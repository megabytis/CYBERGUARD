import pytest
from app.core.normalizer import Normalizer
from app.core.rules import RulesEngine
from app.core.scorer import RiskScorer
from app.core.ml import ThreatClassifier

def test_url_normalization_and_ip_rule():
    features = Normalizer.normalize_url("http://192.168.1.1/login")
    assert features["is_ip_host"] is True
    assert features["scheme"] == "http"
    findings = RulesEngine.evaluate_url(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_URL_IP_HOST" in rule_ids
    assert "RULE_URL_UNENCRYPTED_HTTP" in rule_ids

def test_url_brand_impersonation_rule():
    features = Normalizer.normalize_url("https://apple-id-verify.security-update.cc/auth")
    findings = RulesEngine.evaluate_url(features)
    rule_ids = [f.rule_id for f in findings]
    assert any("BRAND_APPLE" in rid for rid in rule_ids)
    assert "RULE_URL_HIGH_RISK_TLD" in rule_ids

def test_email_mismatch_and_urgency():
    email_text = """From: Security Team <support@paypal.com>
Reply-To: attacker@evil-domain.ru
Subject: Immediate Action Required: Account Suspended

Please verify your credentials within 24 hours.
"""
    features = Normalizer.normalize_email(email_text)
    findings = RulesEngine.evaluate_email(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_EMAIL_SENDER_REPLY_MISMATCH" in rule_ids
    assert "RULE_EMAIL_URGENCY_PRESSURE" in rule_ids

def test_message_smishing():
    msg = "Your USPS parcel has a pending delivery fee. Pay at bit.ly/usps-fee or package will be returned."
    features = Normalizer.normalize_message(msg)
    assert features["has_shortener"] is True
    findings = RulesEngine.evaluate_message(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_MSG_SHORTENER_DETECTED" in rule_ids

def test_auth_log_brute_force():
    log = """
Failed password for invalid user admin from 10.0.0.1
Failed password for invalid user root from 10.0.0.1
Failed password for invalid user test from 10.0.0.1
Failed password for invalid user oracle from 10.0.0.1
Failed password for invalid user deploy from 10.0.0.1
Failed password for invalid user ubuntu from 10.0.0.1
"""
    features = Normalizer.normalize_auth_log(log)
    assert features["failed_attempts"] >= 6
    findings = RulesEngine.evaluate_auth_log(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_AUTH_BRUTE_FORCE_BURST" in rule_ids

def test_scoring_aggregation():
    features = Normalizer.normalize_url("http://192.168.1.1/login")
    findings = RulesEngine.evaluate_url(features)
    classifier = ThreatClassifier.get_instance()
    ml_score, _ = classifier.predict("http://192.168.1.1/login")
    risk_score, risk_level, h_score = RiskScorer.compute_risk(findings, ml_score)
    assert 0 <= risk_score <= 100
    assert risk_level in ("LOW", "MEDIUM", "HIGH")

def test_email_display_name_spoofing_and_embedded_link():
    email = """From: "PayPal Account Security" <alert@payment-updates-secure.xyz>
Reply-To: phish@other-domain.cc
Subject: URGENT: Verify Your Credentials Immediately

Your PayPal account has been restricted due to unauthorized login attempts.
Click below to verify:
https://apple-id-verify.security-update.cc/login
"""
    features = Normalizer.normalize_email(email)
    assert features["claimed_brand_in_display"] == "paypal"
    findings = RulesEngine.evaluate_email(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_EMAIL_DISPLAY_NAME_SPOOFING" in rule_ids
    assert "RULE_EMAIL_SENDER_REPLY_MISMATCH" in rule_ids
    assert "RULE_EMAIL_MALICIOUS_EMBEDDED_LINK" in rule_ids

def test_message_otp_and_financial_lure():
    msg = "WELLS FARGO ALERT: Fraudulent charge of $489.20 detected. Enter your one-time password verification code at bit.ly/wf-card-protect within 15 minutes."
    features = Normalizer.normalize_message(msg)
    findings = RulesEngine.evaluate_message(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_MSG_OTP_INTERCEPTION" in rule_ids
    assert "RULE_MSG_SHORTENER_DETECTED" in rule_ids
    assert "RULE_MSG_URGENCY_PRESSURE" in rule_ids

def test_network_beaconing_and_exfiltration():
    netflow = """2026-09-27T02:00:00Z 10.0.1.50:49210 -> 198.51.100.80:4444 PROTO=TCP BYTES_OUT=125000 BYTES_IN=320
2026-09-27T02:00:30Z 10.0.1.50:49212 -> 198.51.100.80:4444 PROTO=TCP BYTES_OUT=125000 BYTES_IN=320
2026-09-27T02:01:00Z 10.0.1.50:49214 -> 198.51.100.80:4444 PROTO=TCP BYTES_OUT=125000 BYTES_IN=320
2026-09-27T02:01:30Z 10.0.1.50:49216 -> 198.51.100.80:4444 PROTO=TCP BYTES_OUT=125000 BYTES_IN=320
"""
    features = Normalizer.normalize_network(netflow)
    assert features["beaconing_detected"] is True
    assert features["beaconing_interval"] == 30
    assert features["exfiltration_suspected"] is True
    findings = RulesEngine.evaluate_network(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_NET_SUSPICIOUS_PORT_TRAFFIC" in rule_ids
    assert "RULE_NET_BEACONING_ACTIVITY" in rule_ids
    assert "RULE_NET_DATA_EXFILTRATION" in rule_ids

def test_auth_log_off_hours_and_privileged():
    log = """Sep 27 03:14:02 srv1 sshd[912]: Failed password for invalid user admin from 198.51.100.20 port 50122
Sep 27 03:14:04 srv1 sshd[913]: Failed password for invalid user root from 198.51.100.20 port 50124
Sep 27 03:14:06 srv1 sshd[914]: Failed password for invalid user deploy from 198.51.100.20 port 50126
Sep 27 03:14:08 srv1 sshd[915]: Failed password for invalid user oracle from 198.51.100.20 port 50128
Sep 27 03:14:10 srv1 sshd[916]: Failed password for invalid user postgres from 198.51.100.20 port 50130
Sep 27 03:14:12 srv1 sshd[917]: Account locked due to 5 failed attempts
"""
    features = Normalizer.normalize_auth_log(log)
    assert features["off_hours_events"] >= 5
    assert features["lockout_detected"] is True
    findings = RulesEngine.evaluate_auth_log(features)
    rule_ids = [f.rule_id for f in findings]
    assert "RULE_AUTH_BRUTE_FORCE_BURST" in rule_ids
    assert "RULE_AUTH_PRIVILEGED_USER_TARGETING" in rule_ids
    assert "RULE_AUTH_OFF_HOURS_ACTIVITY" in rule_ids
    assert "RULE_AUTH_ACCOUNT_LOCKOUT" in rule_ids
