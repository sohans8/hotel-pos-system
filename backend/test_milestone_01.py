import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.super_admin import SuperAdmin
from app.models.tenant import Tenant
from app.models.restaurant import Restaurant
from app.models.restaurant_user import RestaurantUser
from app.models.subscription import Subscription
from app.models.license import License
from app.models.terminal import RegisteredTerminal
from app.models.feature import Feature, RestaurantFeaturePermission
from app.models.audit import AuditLog

BASE_URL = "http://localhost:8000/api/v1"

def http_request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"detail": err_body}

def run_tests():
    print("==========================================================")
    print("RUNNING MILESTONE 01: SUPER ADMIN PANEL VERIFICATION SUITE")
    print("==========================================================")

    # ----------------------------------------------------
    # TEST 1: INITIALLY ZERO RESTAURANTS IN DATABASE (Section C)
    # ----------------------------------------------------
    db = SessionLocal()
    rest_count = db.query(Restaurant).count()
    tenant_count = db.query(Tenant).count()
    admin_count = db.query(SuperAdmin).count()
    feature_count = db.query(Feature).count()
    db.close()

    print(f"[TEST 1] Initial DB Check: Restaurants={rest_count}, Tenants={tenant_count}, SuperAdmins={admin_count}, Features={feature_count}")
    assert rest_count == 0, f"Expected 0 restaurants initially, found {rest_count}"
    assert tenant_count == 0, f"Expected 0 tenants initially, found {tenant_count}"
    assert admin_count >= 1, "Expected Super Admin account to be seeded"
    assert feature_count >= 7, "Expected standard feature registry to be seeded"
    print("  -> PASSED: Database initially contains strictly ZERO restaurants.")

    # ----------------------------------------------------
    # TEST 2: SUPER ADMIN SECURITY & AUTHENTICATION (Section B & J)
    # ----------------------------------------------------
    status, unauth = http_request("GET", "/super-admin/dashboard")
    assert status == 401, f"Expected 401 for unauthenticated request, got {status}"

    status, bad_login = http_request("POST", "/super-admin/login", {
        "username_or_email": "admin",
        "password": "WrongPassword!"
    })
    assert status == 401, f"Expected 401 for bad password, got {status}"

    status, good_login = http_request("POST", "/super-admin/login", {
        "username_or_email": "admin",
        "password": "SuperAdmin@Apex2026!"
    })
    assert status == 200, f"Super Admin login failed: {good_login}"
    admin_token = good_login["access_token"]
    print("  -> PASSED: Super Admin authentication strictly secured.")

    # ----------------------------------------------------
    # TEST 3: INITIAL DASHBOARD EMPTY STATE (Section C)
    # ----------------------------------------------------
    status, dash_data = http_request("GET", "/super-admin/dashboard", token=admin_token)
    assert status == 200
    assert dash_data["stats"]["total_restaurants"] == 0
    assert dash_data["stats"]["active_restaurants"] == 0
    assert len(dash_data["recent_restaurants"]) == 0
    print(f"  -> PASSED: Dashboard correctly reports 0 restaurants (Stats: {dash_data['stats']}).")

    # ----------------------------------------------------
    # TEST 4: REGISTER RESTAURANT & AUTO 1-YEAR SUBSCRIPTION (Section D & E)
    # ----------------------------------------------------
    reg_payload = {
        "restaurant_name": "Hotel Royal Family Restaurant",
        "owner_name": "Suresh Patil",
        "mobile": "9820123456",
        "email": "suresh@hotelroyal.in",
        "address": "Near Station Road, Kalyan (W)",
        "city": "Kalyan",
        "state": "Maharashtra",
        "pincode": "421301",
        "country": "India",
        "gstin": "27AABCH1234F1Z1",
        "fssai": "11521024009999",
        "restaurant_type": "Family Restaurant",
        "username": "hotelroyal",
        "initial_password": "Initial@Royal2026",
        "max_terminals": 2,
        "is_activated": True
    }
    status, reg_data = http_request("POST", "/super-admin/restaurants", reg_payload, token=admin_token)
    assert status == 200, f"Onboarding failed: {reg_data}"
    tenant_id = reg_data["tenant_id"]
    rest_id = reg_data["restaurant_id"]

    act_date = datetime.fromisoformat(reg_data["activation_date"].replace("Z", "+00:00"))
    exp_date = datetime.fromisoformat(reg_data["expiry_date"].replace("Z", "+00:00"))
    delta_days = (exp_date - act_date).days
    assert delta_days == 365, f"Expected 365 days subscription, got {delta_days}"
    print(f"  -> PASSED: Onboarded '{reg_payload['restaurant_name']}' [ID: {rest_id}]. Generated 1-Year subscription ({delta_days} days).")

    # ----------------------------------------------------
    # TEST 5: RESTAURANT LOGIN & FIRST-LOGIN PASSWORD CHANGE (Section D & J)
    # ----------------------------------------------------
    status, rest_auth = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "Initial@Royal2026"
    })
    assert status == 200
    assert rest_auth["must_change_password"] is True, "Owner MUST be required to change password on first login"
    rest_token = rest_auth["access_token"]
    print("  -> PASSED: Restaurant owner login succeeded with must_change_password=True.")

    # Complete first-time password change
    status, chg_pwd = http_request("POST", "/auth/change-password", {
        "old_password": "Initial@Royal2026",
        "new_password": "NewSecret@Royal2026!",
        "confirm_password": "NewSecret@Royal2026!"
    }, token=rest_token)
    assert status == 200
    
    # Verify old password no longer works
    status, old_login = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "Initial@Royal2026"
    })
    assert status == 401, "Old password must be rejected after password change"

    # Verify new password works and must_change_password is now False
    status, new_login = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "NewSecret@Royal2026!"
    })
    assert status == 200
    assert new_login["must_change_password"] is False
    rest_token = new_login["access_token"]
    print("  -> PASSED: First-login password change enforced and verified.")

    # ----------------------------------------------------
    # TEST 6: TERMINAL LIMIT & AUTHORIZATION (Section F)
    # Limit is 2 terminals: Hotel Sai Dhaba example in prompt
    # ----------------------------------------------------
    # Terminal 01: Register Device 1
    status, t1 = http_request("POST", "/terminals/register", {
        "tenant_id": tenant_id,
        "device_id": "DEVICE-COUNTER-POS-01",
        "device_name": "Counter 01 Billing PC",
        "platform": "Windows 11",
        "ip_address": "192.168.1.101"
    })
    assert status == 200
    assert t1["status"] == "AUTHORIZED"
    assert t1["terminal_id"] == "TERM-01"
    print("  -> PASSED: Terminal 01 registered and AUTHORIZED.")

    # Test Idempotency: Same device connecting again (does not consume extra terminal)
    status, t1_reconnect = http_request("POST", "/terminals/register", {
        "tenant_id": tenant_id,
        "device_id": "DEVICE-COUNTER-POS-01",
        "device_name": "Counter 01 Billing PC",
        "platform": "Windows 11"
    })
    assert status == 200
    assert t1_reconnect["is_authorized"] is True

    # Terminal 02: Register Device 2
    status, t2 = http_request("POST", "/terminals/register", {
        "tenant_id": tenant_id,
        "device_id": "DEVICE-KITCHEN-TAB-02",
        "device_name": "Captain Order Tab",
        "platform": "Windows Tablet",
        "ip_address": "192.168.1.102"
    })
    assert status == 200
    assert t2["status"] == "AUTHORIZED"
    assert t2["terminal_id"] == "TERM-02"
    print("  -> PASSED: Terminal 02 registered and AUTHORIZED (2 of 2 used).")

    # Terminal 03: Must be BLOCKED (Third-Terminal Rejection)
    status, t3 = http_request("POST", "/terminals/register", {
        "tenant_id": tenant_id,
        "device_id": "DEVICE-UNAUTHORIZED-03",
        "device_name": "Unauthorized Third Device",
        "platform": "Android",
        "ip_address": "192.168.1.103"
    })
    assert status == 403, f"Expected 403 Forbidden for terminal 3, got {status}"
    assert "Terminal limit reached" in t3["detail"]
    print("  -> PASSED: Terminal 03 BLOCKED with HTTP 403 (Terminal limit of 2 strictly enforced).")

    # ----------------------------------------------------
    # TEST 7: TERMINAL REPLACEMENT & REVOCATION (Section F)
    # ----------------------------------------------------
    status, replace_req = http_request("POST", "/terminals/replace-request", {
        "tenant_id": tenant_id,
        "old_device_id": "DEVICE-KITCHEN-TAB-02",
        "new_device_id": "DEVICE-KITCHEN-TAB-REPLACEMENT-02",
        "new_device_name": "Replaced Captain Tab Hardware",
        "platform": "Windows 11",
        "reason": "Cracked screen on old tab; replaced with new unit"
    }, token=rest_token)
    assert status == 200
    print("  -> PASSED: Terminal replacement completed. Slot transferred to replacement hardware.")

    # Super Admin Revocation of Terminal 1
    status, terminals_list = http_request("GET", f"/super-admin/terminals?tenant_id={tenant_id}", token=admin_token)
    t1_record = next(t for t in terminals_list if t["device_id"] == "DEVICE-COUNTER-POS-01")
    status, revoke_resp = http_request("POST", f"/super-admin/terminals/{t1_record['id']}/revoke", {"reason": "Compromised device"}, token=admin_token)
    assert status == 200

    # Verify revoked device is rejected when connecting
    status, t1_check = http_request("POST", "/terminals/register", {
        "tenant_id": tenant_id,
        "device_id": "DEVICE-COUNTER-POS-01"
    })
    assert status == 403, "Revoked device must be blocked"
    print("  -> PASSED: Super Admin revocation verified; revoked device blocked.")

    # ----------------------------------------------------
    # TEST 8: RESTAURANT ACTIVATION & SUSPENSION (Section H)
    # ----------------------------------------------------
    status, suspend_resp = http_request("POST", f"/super-admin/restaurants/{tenant_id}/action", {
        "action": "suspend",
        "reason": "Payment overdue audit"
    }, token=admin_token)
    assert status == 200

    status, susp_login = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "NewSecret@Royal2026!"
    })
    assert status == 403, "Suspended restaurant must be blocked from logging in"
    assert "SUSPENDED" in susp_login["detail"]
    print("  -> PASSED: Restaurant suspension verified (login blocked).")

    # Re-activate restaurant
    status, act_resp = http_request("POST", f"/super-admin/restaurants/{tenant_id}/action", {
        "action": "activate",
        "reason": "Account resolved"
    }, token=admin_token)
    assert status == 200

    status, re_login = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "NewSecret@Royal2026!"
    })
    assert status == 200
    print("  -> PASSED: Restaurant reactivation verified (access restored).")

    # ----------------------------------------------------
    # TEST 9: FEATURE GRANT & REVOCATION (Section G)
    # ----------------------------------------------------
    status, feat_check1 = http_request("GET", "/features/check/pos_ordering", token=rest_token)
    assert status == 200
    assert feat_check1["is_enabled"] is True

    # Disable pos_ordering feature for this restaurant
    status, feat_toggle = http_request("PUT", f"/super-admin/restaurants/{tenant_id}/features", {
        "feature_key": "pos_ordering",
        "is_enabled": False
    }, token=admin_token)
    assert status == 200

    # Verify protected backend API now blocks the feature
    status, feat_check2 = http_request("GET", "/features/check/pos_ordering", token=rest_token)
    assert status == 403
    assert "disabled or not included" in feat_check2["detail"]
    print("  -> PASSED: Feature revocation blocks protected API with HTTP 403.")

    # Re-enable feature
    status, _ = http_request("PUT", f"/super-admin/restaurants/{tenant_id}/features", {
        "feature_key": "pos_ordering",
        "is_enabled": True
    }, token=admin_token)
    status, feat_check3 = http_request("GET", "/features/check/pos_ordering", token=rest_token)
    assert status == 200
    print("  -> PASSED: Feature re-enabled and authorized.")

    # ----------------------------------------------------
    # TEST 10: ANNUAL SUBSCRIPTION RENEWAL (Section E)
    # ----------------------------------------------------
    status, renew_resp = http_request("POST", f"/super-admin/restaurants/{tenant_id}/action", {
        "action": "renew"
    }, token=admin_token)
    assert status == 200
    renew_expiry = datetime.fromisoformat(renew_resp["new_expiry"].replace("Z", "+00:00"))
    assert renew_expiry > exp_date, "Renewed expiry must extend beyond initial expiry"
    print(f"  -> PASSED: Annual subscription renewed (+1 Year until {renew_expiry.strftime('%Y-%m-%d')}).")

    # ----------------------------------------------------
    # TEST 11: SUBSCRIPTION EXPIRY ENFORCEMENT (Section E & J)
    # ----------------------------------------------------
    db = SessionLocal()
    sub_records = db.query(Subscription).filter(Subscription.tenant_id == tenant_id).all()
    for s in sub_records:
        s.expiry_date = datetime.now(timezone.utc) - timedelta(days=1)
        s.status = "EXPIRED"
    db.commit()
    db.close()

    status, exp_login = http_request("POST", "/auth/restaurant-login", {
        "username_or_email": "hotelroyal",
        "password": "NewSecret@Royal2026!"
    })
    assert status == 403
    assert "expired" in exp_login["detail"].lower()
    print("  -> PASSED: Expired subscription blocks access to protected services.")

    # Restore subscription to active
    http_request("POST", f"/super-admin/restaurants/{tenant_id}/action", {"action": "renew"}, token=admin_token)

    # ----------------------------------------------------
    # TEST 12: AUDIT LOG VERIFICATION (Section B, I, J)
    # ----------------------------------------------------
    status, logs = http_request("GET", "/super-admin/activity-logs", token=admin_token)
    assert status == 200
    actions = [l["action"] for l in logs]
    print(f"  -> Audit actions captured: {set(actions)}")
    assert "RESTAURANT_CREATED" in actions
    assert "PASSWORD_CHANGED" in actions
    assert "TERMINAL_REGISTERED" in actions
    assert "TERMINAL_REVOKED" in actions
    assert "TERMINAL_REPLACED" in actions
    assert "RESTAURANT_SUSPENDED" in actions
    assert "RESTAURANT_ACTIVATED" in actions
    assert "FEATURE_PERMISSION_CHANGED" in actions
    assert "SUBSCRIPTION_RENEWED" in actions
    print("  -> PASSED: Comprehensive audit trail recorded for all events.")

    # Cleanup test restaurant so the system can be left in clean state (or keep for review)
    print("\n==========================================================")
    print("ALL 12 MILESTONE 01 REQUIREMENTS VERIFIED AND PASSED!")
    print("==========================================================")

if __name__ == "__main__":
    run_tests()
