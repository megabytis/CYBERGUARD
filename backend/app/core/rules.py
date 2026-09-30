import re
from typing import List, Dict, Any

class RuleFinding:
    def __init__(
        self,
        rule_id: str,
        category: str,
        title: str,
        description: str,
        severity: str,
        weight: float,
        confidence: float,
    ):
        self.rule_id = rule_id
        self.category = category
        self.title = title
        self.description = description
        self.severity = severity
        self.weight = weight
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "category": self.category,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "weight": self.weight,
            "confidence": self.confidence,
        }

class RulesEngine:
    """Deterministic security heuristic evaluation across all 7 supported input vectors."""

    TARGET_BRANDS = [
        "apple", "microsoft", "google", "paypal", "netflix", "amazon",
        "chase", "wellsfargo", "bankofamerica", "meta", "facebook",
        "instagram", "dhl", "fedex", "usps", "dropbox", "docusign",
        "citibank", "capitalone", "irs", "binance", "coinbase"
    ]

    HIGH_RISK_TLDS = {
        ".top", ".xyz", ".cc", ".tk", ".ml", ".ga", ".cf", ".gq",
        ".buzz", ".rest", ".cam", ".monster", ".work", ".click",
        ".vip", ".live", ".shop", ".fit", ".icu", ".sbs", ".cfd"
    }

    @classmethod
    def evaluate_url(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        findings: List[RuleFinding] = []
        host = features.get("host", "").lower()
        unicode_host = features.get("unicode_host", "").lower()
        path = features.get("path", "").lower()
        query = features.get("query", "").lower()
        root_domain = features.get("root_domain", host).lower()

        # 1. IP Host Check
        if features.get("is_ip_host"):
            findings.append(RuleFinding(
                rule_id="RULE_URL_IP_HOST",
                category="STRUCTURAL",
                title="Raw IP Address Used as Host",
                description="Legitimate consumer services rarely expose bare IP addresses for navigation. Often indicates ephemeral phishing hosts or bypasses.",
                severity="HIGH",
                weight=30.0,
                confidence=0.92,
            ))

        # 2. Punycode / IDN Spoofing
        if features.get("is_punycode"):
            findings.append(RuleFinding(
                rule_id="RULE_URL_PUNYCODE",
                category="IMPERSONATION",
                title="Punycode / Internationalized Domain Name (IDN)",
                description=f"Domain uses punycode ({host} -> {unicode_host}). Frequently leveraged in homograph attacks to mimic legitimate brand names with Cyrillic/Greek characters.",
                severity="HIGH",
                weight=25.0,
                confidence=0.88,
            ))

        # 3. Lookalike / Brand Impersonation in Host
        for brand in cls.TARGET_BRANDS:
            if brand in host:
                # Check if it's not the exact official root domain
                if not root_domain.endswith(f"{brand}.com") and not root_domain.endswith(f"{brand}.org") and not root_domain.endswith(f"{brand}.net") and not root_domain.endswith(f"{brand}.gov"):
                    findings.append(RuleFinding(
                        rule_id=f"RULE_URL_BRAND_{brand.upper()}",
                        category="IMPERSONATION",
                        title=f"Brand Target Impersonation ({brand.capitalize()})",
                        description=f"Hostname contains '{brand}' but root domain does not belong to official {brand.capitalize()} infrastructure.",
                        severity="CRITICAL",
                        weight=40.0,
                        confidence=0.95,
                    ))
                    break

        # 4. Typosquatting / Character Substitution
        typos = features.get("typosquat_detected", [])
        if typos:
            for tb in typos[:2]:
                findings.append(RuleFinding(
                    rule_id=f"RULE_URL_TYPOSQUAT_{tb.upper()}",
                    category="IMPERSONATION",
                    title=f"Typosquatting Substitution Detected ({tb.capitalize()})",
                    description=f"Hostname utilizes character lookalikes or leet-speak substitutions mimicking {tb.capitalize()} brand infrastructure.",
                    severity="HIGH",
                    weight=30.0,
                    confidence=0.90,
                ))

        # 5. Credential Harvesting Paths
        cred_paths = ["/login", "/signin", "/auth", "/wp-login", "/verify", "/update-account", "/checkout", "/account-lockout", "/security-checkpoint"]
        if any(cp in path for cp in cred_paths):
            findings.append(RuleFinding(
                rule_id="RULE_URL_CREDENTIAL_PATH",
                category="CONTENT",
                title="Credential Harvester Path Indicator",
                description=f"URL path '{path}' targets authentication or user verification workflows.",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.75,
            ))

        # 6. Dangerous Executable or Payload Download
        if features.get("has_dangerous_extension"):
            findings.append(RuleFinding(
                rule_id="RULE_URL_DANGEROUS_EXTENSION",
                category="CONTENT",
                title="Suspicious Executable / Archive Payload",
                description=f"URL points to a downloadable binary or script payload in path '{path}'. High risk for drive-by drop.",
                severity="CRITICAL",
                weight=40.0,
                confidence=0.95,
            ))

        # 7. High-Risk TLD
        for tld in cls.HIGH_RISK_TLDS:
            if host.endswith(tld):
                findings.append(RuleFinding(
                    rule_id="RULE_URL_HIGH_RISK_TLD",
                    category="STRUCTURAL",
                    title=f"High-Risk Top-Level Domain ({tld})",
                    description=f"The domain uses '{tld}', statistically associated with high rates of disposable phishing and malicious redirects.",
                    severity="MEDIUM",
                    weight=15.0,
                    confidence=0.70,
                ))
                break

        # 8. HTTP Protocol Downgrade
        if features.get("scheme") == "http":
            findings.append(RuleFinding(
                rule_id="RULE_URL_UNENCRYPTED_HTTP",
                category="STRUCTURAL",
                title="Unencrypted HTTP Protocol",
                description="Target specifies plain unencrypted HTTP. Modern authentication portals strictly require TLS/HTTPS.",
                severity="MEDIUM",
                weight=12.0,
                confidence=0.85,
            ))

        # 9. Subdomain Depth Obfuscation
        depth = features.get("subdomain_depth", 0)
        if depth >= 3:
            findings.append(RuleFinding(
                rule_id="RULE_URL_SUBDOMAIN_DEPTH",
                category="STRUCTURAL",
                title="Excessive Subdomain Depth",
                description=f"URL features {depth} subdomain segments, a technique commonly used to obscure the authentic root domain on mobile and projector screens.",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.80,
            ))

        # 10. Multi-Hyphen Deceptive Chaining
        if features.get("hyphen_count", 0) >= 3:
            findings.append(RuleFinding(
                rule_id="RULE_URL_MULTI_HYPHEN_DECEPTION",
                category="STRUCTURAL",
                title="Deceptive Multi-Hyphen Domain Structure",
                description=f"Domain contains {features.get('hyphen_count')} hyphens chaining brand keywords (e.g. apple-id-verify-service).",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.78,
            ))

        # 11. Obfuscated Double URL Encoding
        if features.get("has_double_encoding"):
            findings.append(RuleFinding(
                rule_id="RULE_URL_DOUBLE_ENCODING",
                category="STRUCTURAL",
                title="Obfuscated Double URL Encoding",
                description="URL string contains double-encoded hex sequences (%25), a common evasion tactic to bypass WAF inspection.",
                severity="HIGH",
                weight=25.0,
                confidence=0.88,
            ))

        # 12. Open Redirect Parameters
        if any(param in query for param in ["redirect=", "url=", "dest=", "next=", "target="]):
            findings.append(RuleFinding(
                rule_id="RULE_URL_REDIRECT_PARAMETER",
                category="BEHAVIORAL",
                title="Potential Open Redirect Chain",
                description="Query string contains explicit redirection parameters which may bounce analysts to secondary malicious landing pages.",
                severity="LOW",
                weight=10.0,
                confidence=0.65,
            ))

        # 13. Extreme URL Length
        if features.get("total_length", 0) > 120:
            findings.append(RuleFinding(
                rule_id="RULE_URL_EXTREME_LENGTH",
                category="STRUCTURAL",
                title="Suspiciously Long URL Length",
                description=f"URL length ({features.get('total_length')} chars) exceeds standard navigation norms, often utilized for token embedding or scanner evasion.",
                severity="LOW",
                weight=8.0,
                confidence=0.60,
            ))

        return findings

    @classmethod
    def evaluate_email(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        from app.core.normalizer import Normalizer

        findings: List[RuleFinding] = []
        body_lower = features.get("body", "").lower()
        subject_lower = features.get("subject", "").lower()
        from_hdr = features.get("from_header", "").lower()
        reply_to = features.get("reply_to", "").lower()
        sender_domain = features.get("sender_domain", "").lower()
        reply_domain = features.get("reply_to_domain", "").lower()
        claimed_brand = features.get("claimed_brand_in_display")
        is_free_provider = features.get("is_free_provider", False)
        claims_authority = features.get("claims_authority", False)

        # 1. Header Mismatch (From vs Reply-To)
        if reply_domain and sender_domain and reply_domain != sender_domain:
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_SENDER_REPLY_MISMATCH",
                category="IMPERSONATION",
                title="Sender / Reply-To Domain Mismatch",
                description=f"The sender domain '{sender_domain}' diverges from the reply recipient '{reply_domain}'. High indicator of spoofing and BEC fraud.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.92,
            ))

        # 2. Display Name Brand Spoofing
        if claimed_brand and sender_domain and not sender_domain.endswith(f"{claimed_brand}.com") and not sender_domain.endswith(f"{claimed_brand}.org"):
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_DISPLAY_NAME_SPOOFING",
                category="IMPERSONATION",
                title=f"Display Name Brand Spoofing ({claimed_brand.capitalize()})",
                description=f"Display name references '{claimed_brand.capitalize()}' but sender email originates from untrusted domain '{sender_domain}'.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.94,
            ))

        # 3. Free Webmail Masquerading as Authority / Executive
        if is_free_provider and claims_authority:
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_FREE_PROVIDER_EXECUTIVE",
                category="IMPERSONATION",
                title="Free Webmail Used for Executive / Authority Pretext",
                description=f"Email claims administrative or executive role from a free/disposable webmail provider ('{sender_domain}').",
                severity="HIGH",
                weight=30.0,
                confidence=0.90,
            ))

        # 4. Brand Impersonation in Subject or Body
        for brand in cls.TARGET_BRANDS:
            if (brand in subject_lower or brand in body_lower) and sender_domain:
                if not sender_domain.endswith(f"{brand}.com") and not sender_domain.endswith(f"{brand}.gov") and not sender_domain.endswith(f"{brand}.net"):
                    # Only add if not already flagged in display name
                    if brand != claimed_brand:
                        findings.append(RuleFinding(
                            rule_id=f"RULE_EMAIL_BRAND_MISMATCH_{brand.upper()}",
                            category="IMPERSONATION",
                            title=f"Brand Reference vs Domain Discrepancy ({brand.capitalize()})",
                            description=f"Message references {brand.capitalize()} services but sender domain is '{sender_domain}', not verified corporate infrastructure.",
                            severity="HIGH",
                            weight=25.0,
                            confidence=0.86,
                        ))
                        break

        # 5. Urgency & Extortion Phrasing
        urgency_keywords = [
            "immediate action required", "account suspended", "24 hours", "action required immediately",
            "unauthorized activity detected", "final notice", "immediate verification needed",
            "account will be deleted", "temporary suspension", "security breach alert"
        ]
        matched_urgency = [kw for kw in urgency_keywords if kw in body_lower or kw in subject_lower]
        if matched_urgency:
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_URGENCY_PRESSURE",
                category="CONTENT",
                title="Social Engineering Pressure & Urgency",
                description=f"Detected high-pressure psychological triggers: '{', '.join(matched_urgency[:2])}'. Designed to induce impulsive user action.",
                severity="HIGH",
                weight=25.0,
                confidence=0.88,
            ))

        # 6. Financial Coercion / Unauthorized Wire / Gift Card Requests
        financial_phrases = ["wire transfer", "gift card", "bitcoin payment", "crypto transfer", "remittance required", "overdue invoice", "closing acquisition"]
        matched_fin = [fp for fp in financial_phrases if fp in body_lower or fp in subject_lower]
        if matched_fin:
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_FINANCIAL_COERCION",
                category="CONTENT",
                title="Financial Coercion or Wire Transfer Solicitation",
                description=f"Message solicits urgent financial transactions or wire disbursements ('{matched_fin[0]}'). Characteristic of CEO fraud and BEC.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.92,
            ))

        # 7. Credential Solicitation
        cred_phrases = ["verify your password", "reset your security credentials", "confirm your account details", "enter your login", "update your credentials"]
        if any(cp in body_lower for cp in cred_phrases):
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_CREDENTIAL_SOLICITATION",
                category="CONTENT",
                title="Explicit Credential Solicitation",
                description="Message explicitly solicits user passwords, security PINs, or credentials.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.94,
            ))

        # 8. Embedded Links & Chained URL Inspection
        embedded_urls = features.get("embedded_urls", [])
        if embedded_urls:
            findings.append(RuleFinding(
                rule_id="RULE_EMAIL_EMBEDDED_LINKS",
                category="STRUCTURAL",
                title=f"Embedded Outbound Hyperlinks ({len(embedded_urls)})",
                description=f"Email payload includes {len(embedded_urls)} outbound hyperlinks requiring isolation.",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.75,
            ))

            # Chain URL evaluation for embedded links
            for u in embedded_urls[:3]:
                url_feat = Normalizer.normalize_url(u)
                url_findings = cls.evaluate_url(url_feat)
                critical_url_findings = [f for f in url_findings if f.severity in ["CRITICAL", "HIGH"]]
                if critical_url_findings:
                    top_f = critical_url_findings[0]
                    findings.append(RuleFinding(
                        rule_id="RULE_EMAIL_MALICIOUS_EMBEDDED_LINK",
                        category="CONTENT",
                        title=f"Embedded Malicious Link: {u[:40]}...",
                        description=f"Extracted URL in email triggered security indicator '{top_f.title}': {top_f.description}",
                        severity="CRITICAL",
                        weight=35.0,
                        confidence=0.94,
                    ))
                    break

        return findings

    @classmethod
    def evaluate_message(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        from app.core.normalizer import Normalizer

        findings: List[RuleFinding] = []
        text_lower = features.get("text", "").lower()
        embedded_urls = features.get("embedded_urls", [])

        # 1. Smishing Shorteners
        if features.get("has_shortener"):
            findings.append(RuleFinding(
                rule_id="RULE_MSG_SHORTENER_DETECTED",
                category="BEHAVIORAL",
                title="Obfuscated URL Shortener Link",
                description="Message incorporates shortlink redirection services (bit.ly, t.co, etc.) commonly used to bypass SMS gateway threat filters.",
                severity="HIGH",
                weight=30.0,
                confidence=0.89,
            ))

        # 2. OTP / 2FA Code Theft
        otp_triggers = ["enter your code", "one-time password", "verification code", "security code", "otp", "do not share", "confirm code"]
        if any(ot in text_lower for ot in otp_triggers):
            findings.append(RuleFinding(
                rule_id="RULE_MSG_OTP_INTERCEPTION",
                category="CONTENT",
                title="Multi-Factor (OTP) Interception Lure",
                description="Message attempts to harvest or query a multi-factor authentication pass-code or SMS verification string.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.95,
            ))

        # 3. Financial Redirection / Unpaid Tolls / Delivery Fees
        financial_lures = ["unpaid toll", "package delivery fee", "customs fee", "payment declined", "irs notice", "refund pending", "redelivery tax", "$1.99", "customs tax"]
        matched_fin = [fl for fl in financial_lures if fl in text_lower]
        if matched_fin:
            findings.append(RuleFinding(
                rule_id="RULE_MSG_FINANCIAL_LURE",
                category="CONTENT",
                title=f"Financial Extortion or Delivery Lure ({matched_fin[0]})",
                description="Message mimics courier fee delivery alerts or payment failures targeting consumer payment credentials.",
                severity="HIGH",
                weight=25.0,
                confidence=0.88,
            ))

        # 4. Social Engineering / Brand Pretexting
        couriers = ["usps", "fedex", "dhl", "ups", "wells fargo", "chase", "bank of america"]
        matched_courier = [c for c in couriers if c in text_lower]
        if matched_courier:
            findings.append(RuleFinding(
                rule_id="RULE_MSG_BRAND_PRETEXTING",
                category="IMPERSONATION",
                title=f"Courier / Financial Pretexting ({matched_courier[0].upper()})",
                description=f"Message mimics official alert notifications from {matched_courier[0].upper()} to harvest card data or PII.",
                severity="HIGH",
                weight=25.0,
                confidence=0.88,
            ))

        # 5. Artificial Urgency
        urgency_terms = ["within 15 minutes", "within 12 hours", "within 24 hours", "minutes", "hours", "avoid return", "final notice", "immediate response", "today only", "urgent", "expires"]
        if any(ut in text_lower for ut in urgency_terms):
            findings.append(RuleFinding(
                rule_id="RULE_MSG_URGENCY_PRESSURE",
                category="CONTENT",
                title="High-Pressure Coercive Deadline",
                description="Message creates false urgency to compel immediate link interaction before verification.",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.82,
            ))

        # 6. Chained URL Inspection
        for u in embedded_urls:
            url_feat = Normalizer.normalize_url(u)
            url_findings = cls.evaluate_url(url_feat)
            cred_or_brand = [f for f in url_findings if f.severity in ["CRITICAL", "HIGH"]]
            if cred_or_brand:
                findings.append(RuleFinding(
                    rule_id="RULE_MSG_MALICIOUS_EMBEDDED_LINK",
                    category="CONTENT",
                    title="High-Risk Embedded Link in Message",
                    description=f"Target URL within message flagged high-risk finding '{cred_or_brand[0].title}'.",
                    severity="CRITICAL",
                    weight=35.0,
                    confidence=0.92,
                ))
                break

        return findings

    @classmethod
    def evaluate_auth_log(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        findings: List[RuleFinding] = []
        failed = features.get("failed_attempts", 0)
        root_events = features.get("root_or_sudo_events", 0)
        unique_ips = features.get("unique_ips", [])
        unique_users = features.get("unique_users", [])
        targeted_privileged = features.get("targeted_privileged_users", [])
        off_hours_events = features.get("off_hours_events", 0)
        lockout = features.get("lockout_detected", False)

        # 1. Failed Login Bursts
        if failed >= 5:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_BRUTE_FORCE_BURST",
                category="BEHAVIORAL",
                title="Credential Brute-Force / Password Spraying",
                description=f"Observed {failed} failed authentication attempts in short sequence. Characteristic of automated brute-force attacks.",
                severity="CRITICAL",
                weight=40.0,
                confidence=0.95,
            ))
        elif failed >= 2:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_FAILED_LOGIN_ANOMALY",
                category="BEHAVIORAL",
                title="Anomalous Failed Authentication Sequence",
                description=f"Observed {failed} authentication rejections.",
                severity="MEDIUM",
                weight=20.0,
                confidence=0.75,
            ))

        # 2. Privileged Account Targeting
        if targeted_privileged:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_PRIVILEGED_USER_TARGETING",
                category="AUTHENTICATION",
                title=f"High-Value Account Enumeration ({', '.join(targeted_privileged[:3])})",
                description=f"Authentication attempts explicitly targeted administrative system accounts: {', '.join(targeted_privileged)}.",
                severity="HIGH",
                weight=30.0,
                confidence=0.92,
            ))

        # 3. Distributed Spraying / Multi-User Targeting
        if len(unique_users) >= 3 and len(unique_ips) >= 1:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_MULTI_USER_SPRAY",
                category="BEHAVIORAL",
                title=f"Multi-Username Password Spraying ({len(unique_users)} users)",
                description=f"Single source or distributed endpoints cycled through {len(unique_users)} distinct user accounts.",
                severity="HIGH",
                weight=30.0,
                confidence=0.90,
            ))

        # 4. Off-Hours Authentication Activity
        if off_hours_events >= 2:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_OFF_HOURS_ACTIVITY",
                category="BEHAVIORAL",
                title="Anomalous Off-Hours Authentication Sequence",
                description=f"Detected {off_hours_events} authentication events during standard off-hours (01:00 - 05:00). Often indicative of automated off-shift intrusions.",
                severity="MEDIUM",
                weight=20.0,
                confidence=0.80,
            ))

        # 5. Account Lockout Event
        if lockout:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_ACCOUNT_LOCKOUT",
                category="AUTHENTICATION",
                title="Security Account Lockout Threshold Triggered",
                description="Log entries confirm security policy triggered an automatic account lockout due to consecutive failures.",
                severity="HIGH",
                weight=25.0,
                confidence=0.90,
            ))

        # 6. Privilege Escalation
        if root_events > 0:
            findings.append(RuleFinding(
                rule_id="RULE_AUTH_PRIVILEGE_ELEVATION",
                category="AUTHENTICATION",
                title="Privileged Account (Root/Sudo) Invocation",
                description=f"Log telemetry records {root_events} root or sudo escalation commands.",
                severity="HIGH",
                weight=25.0,
                confidence=0.85,
            ))

        return findings

    @classmethod
    def evaluate_network(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        findings: List[RuleFinding] = []
        suspicious_ports = features.get("suspicious_ports_hit", [])
        beaconing = features.get("beaconing_detected", False)
        beacon_interval = features.get("beaconing_interval")
        exfil = features.get("exfiltration_suspected", False)
        dns = features.get("dns_activity", False)
        bytes_out = features.get("total_bytes_out", 0)

        # 1. Suspicious Port Traffic (C2 / Reverse Shells)
        if suspicious_ports:
            port_labels = {
                4444: "Metasploit/Meterpreter C2",
                1337: "Elite Backdoor Listener",
                6667: "IRC Botnet C2",
                31337: "Back Orifice Trojan",
                50050: "Cobalt Strike Team Server",
                9050: "Tor SOCKS Relay",
                9150: "Tor Browser Control",
            }
            labels = [f"{p} ({port_labels.get(p, 'Suspicious Port')})" for p in suspicious_ports]
            findings.append(RuleFinding(
                rule_id="RULE_NET_SUSPICIOUS_PORT_TRAFFIC",
                category="NETWORK",
                title=f"Communication on High-Risk Port(s): {', '.join(labels[:2])}",
                description="Traffic observed targeting known botnet/C2 or reverse shell listening ports.",
                severity="CRITICAL",
                weight=40.0,
                confidence=0.94,
            ))

        # 2. C2 Beaconing Periodic Activity
        if beaconing and beacon_interval:
            findings.append(RuleFinding(
                rule_id="RULE_NET_BEACONING_ACTIVITY",
                category="BEHAVIORAL",
                title=f"Periodic C2 Beaconing Detected (~{beacon_interval}s cadence)",
                description=f"Observed highly regular connection intervals ({beacon_interval}s +/- 3s) characteristic of automated malware heartbeat check-ins.",
                severity="CRITICAL",
                weight=40.0,
                confidence=0.96,
            ))

        # 3. Data Exfiltration Anomaly
        if exfil:
            findings.append(RuleFinding(
                rule_id="RULE_NET_DATA_EXFILTRATION",
                category="NETWORK",
                title=f"Anomalous Outbound Data Volume ({bytes_out:,} bytes out)",
                description="Outbound data volume dramatically exceeds inbound telemetry by >3x ratio, consistent with staged data exfiltration.",
                severity="HIGH",
                weight=30.0,
                confidence=0.88,
            ))

        # 4. DNS Tunneling Anomaly
        if dns and features.get("total_records", 0) >= 10:
            findings.append(RuleFinding(
                rule_id="RULE_NET_DNS_TUNNELING",
                category="NETWORK",
                title="High-Frequency DNS Query Volume",
                description="High proportion of DNS activity on port 53 observed. Requires inspection for DNS data tunneling or TXT record exfiltration.",
                severity="MEDIUM",
                weight=15.0,
                confidence=0.72,
            ))

        return findings

    @classmethod
    def evaluate_headers(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        findings: List[RuleFinding] = []

        if features.get("spf_fail"):
            findings.append(RuleFinding(
                rule_id="RULE_HDR_SPF_VERIFICATION_FAIL",
                category="AUTHENTICATION",
                title="Explicit SPF Validation Failure (spf=fail)",
                description="Sending IP address is not authorized by the domain's published SPF policy records.",
                severity="HIGH",
                weight=30.0,
                confidence=0.96,
            ))

        if features.get("dkim_fail"):
            findings.append(RuleFinding(
                rule_id="RULE_HDR_DKIM_SIGNATURE_FAIL",
                category="AUTHENTICATION",
                title="Explicit DKIM Cryptographic Failure (dkim=fail)",
                description="The cryptographic signature over the message body failed validation against DNS public key.",
                severity="HIGH",
                weight=30.0,
                confidence=0.96,
            ))

        if features.get("dmarc_fail"):
            findings.append(RuleFinding(
                rule_id="RULE_HDR_DMARC_POLICY_REJECT",
                category="AUTHENTICATION",
                title="Explicit DMARC Alignment Failure (dmarc=fail)",
                description="Message fails alignment between envelope sender and RFC 5322 From address per DMARC policy.",
                severity="CRITICAL",
                weight=35.0,
                confidence=0.98,
            ))

        from_hdr = features.get("from_header", "").lower()
        return_path = features.get("return_path", "").lower()
        if from_hdr and return_path:
            from_domain = from_hdr.split("@")[-1].strip(">").strip() if "@" in from_hdr else ""
            ret_domain = return_path.split("@")[-1].strip(">").strip() if "@" in return_path else ""
            if from_domain and ret_domain and from_domain != ret_domain:
                findings.append(RuleFinding(
                    rule_id="RULE_HDR_RETURN_PATH_MISMATCH",
                    category="AUTHENTICATION",
                    title="Envelope Return-Path vs From Domain Mismatch",
                    description=f"Envelope bounce return domain '{ret_domain}' does not align with user-facing sender '{from_domain}'.",
                    severity="HIGH",
                    weight=25.0,
                    confidence=0.90,
                ))

        if features.get("received_hop_count", 0) > 6:
            findings.append(RuleFinding(
                rule_id="RULE_HDR_EXCESSIVE_RELAY_HOPS",
                category="STRUCTURAL",
                title=f"Excessive Mail Relay Hop Count ({features.get('received_hop_count')} hops)",
                description="Message traversed an unusually long chain of mail transfer agents (MTAs), common when routing through proxy networks.",
                severity="LOW",
                weight=10.0,
                confidence=0.68,
            ))

        return findings

    @classmethod
    def evaluate_qr(cls, features: Dict[str, Any]) -> List[RuleFinding]:
        """Evaluates security heuristics for QR code payloads (Quishing, rogue Wi-Fi, telecom scams, exploits)."""
        findings: List[RuleFinding] = []

        # 1. Dangerous Protocol Execution Scheme
        if features.get("is_dangerous_scheme"):
            findings.append(RuleFinding(
                rule_id="RULE_QR_DANGEROUS_SCHEME",
                category="EXPLOITATION",
                title="Dangerous Protocol Execution Scheme in QR Payload",
                description="QR code attempts to execute an exploit-prone or local application protocol (intent://, data:, javascript:, file://). Attackers leverage custom scheme invocation to trigger local mobile application flaws or execute unauthorized system commands.",
                severity="CRITICAL",
                weight=65.0,
                confidence=0.98,
            ))

        # 2. Dynamic QR Redirection (Quishing Infrastructure)
        if features.get("is_dynamic_qr_generator"):
            redirector = features.get("redirector_domain", "Dynamic QR Service")
            has_credential_intent = False
            if features.get("url_features"):
                uf = features["url_features"]
                path_lower = uf.get("path", "").lower()
                query_lower = uf.get("query", "").lower()
                has_credential_intent = any(k in path_lower or k in query_lower for k in ["login", "verify", "auth", "account", "signin", "session"])

            findings.append(RuleFinding(
                rule_id="RULE_QR_DYNAMIC_REDIRECTOR",
                category="QUISHING",
                title=f"Quishing Dynamic QR Redirection ({redirector})",
                description=f"QR payload utilizes dynamic redirection service '{redirector}'. Attackers systematically employ dynamic QR shorteners to conceal malicious destination URLs from security scanners and swap the final landing page after physical distribution.",
                severity="HIGH" if has_credential_intent else "MEDIUM",
                weight=35.0,
                confidence=0.88,
            ))

        # 3. Rogue Wi-Fi Association Payload
        if features.get("is_wifi_lure"):
            ssid = features.get("wifi_ssid", "Unidentified")
            nopass = features.get("wifi_nopass", False)
            findings.append(RuleFinding(
                rule_id="RULE_QR_ROGUE_WIFI_LURE",
                category="TELECOM",
                title=f"Automated Wi-Fi Association Payload (SSID: {ssid})",
                description=f"QR code initiates automatic network association with Wi-Fi SSID '{ssid}' {'with no password protection' if nopass else ''}. Threat actors distribute physical QR stickers in public spaces (airports, transit, cafes) to conduct Evil Twin and Man-in-the-Middle (MitM) credential interception.",
                severity="HIGH" if nopass or "free" in ssid.lower() else "MEDIUM",
                weight=40.0 if nopass else 25.0,
                confidence=0.85,
            ))

        # 4. Unsolicited Telecom / SMS Dispatch
        if features.get("is_telecom_dispatch"):
            target = features.get("telecom_target", "Outbound Destination")
            findings.append(RuleFinding(
                rule_id="RULE_QR_UNSOLICITED_TELECOM",
                category="TELECOM",
                title=f"Unsolicited Telecom Dispatch (Target: {target})",
                description=f"QR code payload triggers immediate outbound SMS or phone call dispatch to '{target}'. Frequently utilized in smishing schemes to send victim-authenticated authorization codes or subscribe mobile numbers to premium-rate subscription billing.",
                severity="MEDIUM",
                weight=30.0,
                confidence=0.82,
            ))

        # 5. Sensitive TOTP Authenticator Secret Exposure
        if features.get("is_otp_leak"):
            findings.append(RuleFinding(
                rule_id="RULE_QR_OTP_SECRET_EXPOSURE",
                category="CREDENTIALS",
                title="Sensitive TOTP Authenticator Secret Exposure",
                description="QR code exposes an unencrypted two-factor authentication (TOTP) seed. Anyone scanning this code can clone the one-time passcode generator and defeat MFA controls.",
                severity="HIGH",
                weight=45.0,
                confidence=0.95,
            ))

        # 6. Evaluate underlying URL features if present
        if features.get("url_features"):
            url_findings = cls.evaluate_url(features["url_features"])
            findings.extend(url_findings)

        # 7. Evaluate underlying text features if present and no URL
        if features.get("text_features") and not features.get("url_features"):
            text_findings = cls.evaluate_message(features["text_features"])
            findings.extend(text_findings)

        return findings

