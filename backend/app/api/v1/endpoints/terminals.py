import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_restaurant_user
from app.models.tenant import Tenant
from app.models.terminal import RegisteredTerminal
from app.models.audit import AuditLog
from app.schemas.super_admin import TerminalRegisterRequest, TerminalReplaceRequest

router = APIRouter()

@router.post("/register")
def register_terminal(
    req: TerminalRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Registers a POS terminal/device for a tenant.
    Enforces maximum allowed terminals limit.
    Idempotent: Returning existing device does not count as duplicate terminal.
    """
    tenant = db.query(Tenant).filter(Tenant.id == req.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    if tenant.status != "ACTIVE":
        raise HTTPException(status_code=403, detail=f"Cannot register terminal. Restaurant is {tenant.status}.")

    # 1. Check if device is already registered for this tenant
    existing = db.query(RegisteredTerminal).filter(
        RegisteredTerminal.tenant_id == tenant.id,
        RegisteredTerminal.device_id == req.device_id.strip()
    ).first()

    now = datetime.now(timezone.utc)

    if existing:
        if existing.status == "REVOKED":
            raise HTTPException(
                status_code=403,
                detail="This device has been REVOKED by the Super Administrator. Access denied."
            )
        if existing.status == "REPLACED":
            raise HTTPException(
                status_code=403,
                detail="This device was marked as REPLACED. Please register using authorized replacement hardware."
            )
        # Update last active timestamp
        existing.last_active_at = now
        existing.ip_address = req.ip_address or existing.ip_address
        existing.device_name = req.device_name or existing.device_name
        db.commit()

        return {
            "success": True,
            "message": "Device recognized and session validated.",
            "terminal_id": existing.terminal_id,
            "device_id": existing.device_id,
            "status": existing.status,
            "is_authorized": True
        }

    # 2. Count current authorized terminals for this tenant
    active_terminals_count = db.query(RegisteredTerminal).filter(
        RegisteredTerminal.tenant_id == tenant.id,
        RegisteredTerminal.status == "AUTHORIZED"
    ).count()

    # 3. Enforce Terminal Limit
    if active_terminals_count >= tenant.max_terminals:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Terminal limit reached. Maximum allowed terminals: {tenant.max_terminals}. Current active: {active_terminals_count}. Please contact Super Admin to increase capacity or request a device replacement."
        )

    # 4. Register New Terminal
    terminal_number = active_terminals_count + 1
    term_code = f"TERM-{terminal_number:02d}"

    new_terminal = RegisteredTerminal(
        terminal_id=term_code,
        tenant_id=tenant.id,
        device_id=req.device_id.strip(),
        device_name=req.device_name.strip() or f"Terminal {term_code}",
        platform=req.platform or "Windows",
        ip_address=req.ip_address,
        status="AUTHORIZED",
        registered_at=now,
        last_active_at=now
    )
    db.add(new_terminal)

    audit = AuditLog(
        tenant_id=tenant.id,
        actor_type="SYSTEM",
        actor_name="Terminal Gateway",
        action="TERMINAL_REGISTERED",
        target_type="Terminal",
        target_id=term_code,
        details=f"Device '{req.device_id[:12]}...' registered as {term_code}. Active: {active_terminals_count + 1}/{tenant.max_terminals}"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Terminal {term_code} successfully registered and authorized.",
        "terminal_id": term_code,
        "device_id": req.device_id,
        "status": "AUTHORIZED",
        "is_authorized": True,
        "active_terminals": active_terminals_count + 1,
        "max_terminals": tenant.max_terminals
    }

@router.post("/replace-request")
def replace_device_request(
    req: TerminalReplaceRequest,
    current_user = Depends(get_current_restaurant_user),
    db: Session = Depends(get_db)
):
    """
    Allows restaurant owner to decommission a broken or replaced hardware device,
    marking the old device as REPLACED and registering the new replacement hardware.
    """
    if current_user.tenant_id != req.tenant_id and current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Unauthorized to replace terminal.")

    old_term = db.query(RegisteredTerminal).filter(
        RegisteredTerminal.tenant_id == req.tenant_id,
        RegisteredTerminal.device_id == req.old_device_id.strip()
    ).first()

    if not old_term:
        raise HTTPException(status_code=404, detail="Original device not found.")

    now = datetime.now(timezone.utc)
    # Decommission old device
    old_term.status = "REPLACED"
    old_term.replacement_notes = f"Replaced by new device '{req.new_device_id}'. Reason: {req.reason}"

    # Register new device in place of old terminal code
    new_term = RegisteredTerminal(
        terminal_id=old_term.terminal_id, # Retain terminal slot (e.g. TERM-01)
        tenant_id=req.tenant_id,
        device_id=req.new_device_id.strip(),
        device_name=req.new_device_name.strip() or "Replacement POS Terminal",
        platform=req.platform or "Windows",
        status="AUTHORIZED",
        registered_at=now,
        last_active_at=now,
        replacement_notes=f"Replacement for {req.old_device_id}. Reason: {req.reason}"
    )
    db.add(new_term)

    audit = AuditLog(
        tenant_id=req.tenant_id,
        actor_type="RESTAURANT_USER",
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        action="TERMINAL_REPLACED",
        target_type="Terminal",
        target_id=old_term.terminal_id,
        details=f"Device replacement: '{req.old_device_id}' replaced with '{req.new_device_id}'. Reason: {req.reason}"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Hardware device replaced successfully. Slot {old_term.terminal_id} transferred to new device.",
        "terminal_id": old_term.terminal_id,
        "new_device_id": req.new_device_id,
        "status": "AUTHORIZED"
    }
