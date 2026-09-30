import re
import urllib.parse
from typing import Dict, Any, List, Optional
import ipaddress
from datetime import datetime

class Normalizer:
    """Sanitizes and normalizes input data without triggering network connections (Strict Zero-SSRF)."""

    TARGET_BRANDS = [
        "apple", "microsoft", "google", "paypal", "netflix", "amazon",
        "chase", "wellsfargo", "bankofamerica", "meta", "facebook",
        "instagram", "dhl", "fedex", "usps", "dropbox", "docusign",
        "citibank", "capitalone", "irs", "binance", "coinbase"
    ]

    FREE_EMAIL_PROVIDERS = {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
        "aol.com", "icloud.com", "proton.me", "protonmail.com", "mail.ru",
        "yandex.ru", "yandex.com", "zoho.com", "gmx.com", "tempmail.com"
    }

    TYPOSQUAT_MAP = {
        "0": "o", "1": "l", "l": "1", "i": "l", "vv": "w", "rn": "m", "5": "s"
    }

    DANGEROUS_EXTENSIONS = {
        ".exe", ".scr", ".bat", ".cmd", ".vbs", ".vbe", ".js", ".jse",
        ".wsf", ".wsh", ".ps1", ".ps1xml", ".ps2", ".msc", ".jar",
        ".iso", ".img", ".vhd", ".vhdx", ".zip", ".tar.gz", ".apk", ".dmg"
    }

    DYNAMIC_QR_DOMAINS = {
        "qrco.de", "qrfy.com", "me-qr.com", "flowcode.com", "qr-code-generator.com",
        "scanova.io", "beaconstac.com", "uniqode.com", "qr.io", "qr-creator.com",
        "qr.net", "kaywa.com", "bit.ly", "tinyurl.com", "cutt.ly", "is.gd",
        "rb.gy", "t.co", "ow.ly", "v.gd", "linktr.ee"
    }

    @classmethod
    def normalize_url(cls, raw_url: str) -> Dict[str, Any]:
        """Parses and extracts static lexical and structural features from a URL."""
        cleaned = raw_url.strip()
        if not re.match(r'^[a-zA-Z]+://', cleaned):
            # If no scheme provided, prefix with https:// for structural parsing
            cleaned = 'https://' + cleaned

        parsed = urllib.parse.urlsplit(cleaned)
        netloc = parsed.netloc.lower()

        # Handle credentials in netloc (e.g. user:pass@host)
        user_info = None
        host = netloc
        if '@' in netloc:
            user_info, host = netloc.split('@', 1)

        # Handle port
        port = None
        if ':' in host and not host.startswith('['):
            parts = host.split(':', 1)
            host = parts[0]
            try:
                port = int(parts[1])
            except ValueError:
                pass

        # Check if host is raw IP
        is_ip = False
        ip_version = None
        try:
            ip_obj = ipaddress.ip_address(host.strip('[]'))
            is_ip = True
            ip_version = ip_obj.version
        except ValueError:
            pass

        # Decode punycode (IDN)
        is_punycode = False
        unicode_host = host
        try:
            if 'xn--' in host:
                is_punycode = True
                unicode_host = host.encode('ascii').decode('idna')
        except Exception:
            pass

        # Extract domain, subdomain segments, and depth
        host_parts = host.split('.')
        subdomain_depth = max(0, len(host_parts) - 2) if not is_ip else 0
        subdomains = host_parts[:-2] if len(host_parts) > 2 else []
        root_domain = ".".join(host_parts[-2:]) if len(host_parts) >= 2 else host

        # Path and query analysis
        path = parsed.path
        query = parsed.query
        has_url_encoding = bool(re.search(r'%[0-9a-fA-F]{2}', cleaned))
        has_double_encoding = "%25" in cleaned or "%252e" in cleaned.lower()

        # Hyphen count in hostname (phishers frequently chain multiple hyphens)
        hyphen_count = host.count('-')

        # Dangerous extension in path
        path_lower = path.lower()
        has_dangerous_ext = any(path_lower.endswith(ext) or f"{ext}?" in path_lower for ext in cls.DANGEROUS_EXTENSIONS)

        # Suspicious query parameter keys
        query_params = urllib.parse.parse_qs(query)
        cred_params_present = [
            k for k in query_params.keys()
            if any(target in k.lower() for target in ["email", "user", "login", "auth", "token", "session", "pass", "key", "account"])
        ]

        # Check typosquatting against target brands
        typosquat_detected = []
        host_normalized = host
        for k, v in cls.TYPOSQUAT_MAP.items():
            host_normalized = host_normalized.replace(k, v)

        for brand in cls.TARGET_BRANDS:
            # If the brand appears when leet-speak is normalized, but wasn't exact brand domain
            if brand in host_normalized and brand not in root_domain:
                typosquat_detected.append(brand)

        return {
            "raw_input": raw_url,
            "normalized_url": cleaned,
            "scheme": parsed.scheme.lower(),
            "host": host,
            "unicode_host": unicode_host,
            "root_domain": root_domain,
            "subdomains": subdomains,
            "subdomain_depth": subdomain_depth,
            "port": port,
            "path": path,
            "query": query,
            "has_credentials": user_info is not None,
            "is_ip_host": is_ip,
            "ip_version": ip_version,
            "is_punycode": is_punycode,
            "has_url_encoding": has_url_encoding,
            "has_double_encoding": has_double_encoding,
            "hyphen_count": hyphen_count,
            "has_dangerous_extension": has_dangerous_ext,
            "cred_params_present": cred_params_present,
            "typosquat_detected": typosquat_detected,
            "total_length": len(cleaned),
        }

    @classmethod
    def normalize_email(cls, raw_text: str) -> Dict[str, Any]:
        """Extracts structural parts, sender details, and embedded links from an email message."""
        headers = {}
        body = raw_text

        lines = raw_text.splitlines()
        header_section = True
        body_lines = []

        for line in lines:
            if header_section and ': ' in line and not line.startswith(' '):
                key, val = line.split(': ', 1)
                headers[key.lower().strip()] = val.strip()
            elif header_section and line.strip() == '':
                header_section = False
            else:
                body_lines.append(line)

        body = "\n".join(body_lines).strip()
        if not body and header_section:
            body = raw_text

        # Extract From Header details
        from_hdr = headers.get("from", "")
        display_name = ""
        sender_address = ""
        sender_domain = ""

        if from_hdr:
            addr_match = re.search(r'<([^>]+)>', from_hdr)
            if addr_match:
                sender_address = addr_match.group(1).lower().strip()
                display_name = from_hdr[:addr_match.start()].strip(' "\'')
            elif '@' in from_hdr:
                parts = from_hdr.split()
                for p in parts:
                    if '@' in p:
                        sender_address = p.strip('<> "\'').lower()
                        break
                display_name = from_hdr.replace(sender_address, '').strip(' <>"\'')

            if '@' in sender_address:
                sender_domain = sender_address.split('@')[-1]

        # Extract Reply-To details
        reply_to_hdr = headers.get("reply-to", "")
        reply_to_address = ""
        reply_to_domain = ""
        if reply_to_hdr:
            reply_match = re.search(r'<([^>]+)>', reply_to_hdr)
            if reply_match:
                reply_to_address = reply_match.group(1).lower().strip()
            elif '@' in reply_to_hdr:
                reply_to_address = reply_to_hdr.strip('<> "\'').lower()

            if '@' in reply_to_address:
                reply_to_domain = reply_to_address.split('@')[-1]

        # Extract Return-Path details
        return_path = headers.get("return-path", "").strip('<> "\'')

        # Check if sender uses a free webmail provider
        is_free_provider = sender_domain in cls.FREE_EMAIL_PROVIDERS

        # Check if display name mentions corporate / executive role or brand
        display_lower = display_name.lower()
        corporate_keywords = ["ceo", "executive", "admin", "administrator", "it support", "security", "security team", "billing", "payroll", "compliance", "helpdesk"]
        claims_authority = any(ck in display_lower for ck in corporate_keywords)

        # Brand impersonation in display name
        claimed_brand_in_display = None
        for brand in cls.TARGET_BRANDS:
            if brand in display_lower:
                claimed_brand_in_display = brand
                break

        # Extract embedded URLs
        url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+'
        found_urls = list(set(re.findall(url_pattern, raw_text)))

        return {
            "from_header": from_hdr,
            "display_name": display_name,
            "sender_address": sender_address,
            "sender_domain": sender_domain,
            "reply_to": reply_to_hdr,
            "reply_to_address": reply_to_address,
            "reply_to_domain": reply_to_domain,
            "return_path": return_path,
            "subject": headers.get("subject", ""),
            "body": body,
            "is_free_provider": is_free_provider,
            "claims_authority": claims_authority,
            "claimed_brand_in_display": claimed_brand_in_display,
            "embedded_urls": found_urls,
            "url_count": len(found_urls),
            "line_count": len(lines),
            "has_headers": bool(headers),
        }

    @classmethod
    def normalize_message(cls, raw_text: str) -> Dict[str, Any]:
        """Extracts SMS / instant message text, phone numbers, and shortened links."""
        url_pattern = r'https?://[^\s<>"\']+|www\.[^\s<>"\']+|bit\.ly/[^\s]+|t\.co/[^\s]+|tinyurl\.com/[^\s]+|is\.gd/[^\s]+|cutt\.ly/[^\s]+'
        found_urls = list(set(re.findall(url_pattern, raw_text, re.IGNORECASE)))

        phone_pattern = r'\+?[0-9]{1,3}?[-.\s]?\(?[0-9]{2,4}?\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}'
        found_phones = re.findall(phone_pattern, raw_text)

        text_lower = raw_text.lower()
        has_shortener = any(re.search(r'(bit\.ly|t\.co|tinyurl|is\.gd|cutt\.ly|ow\.ly|rebrand\.ly)', u, re.IGNORECASE) for u in found_urls)

        # Brand / Entity mentions
        mentioned_entities = [b for b in cls.TARGET_BRANDS if b in text_lower]

        return {
            "text": raw_text.strip(),
            "character_count": len(raw_text.strip()),
            "embedded_urls": found_urls,
            "found_phones": found_phones,
            "has_shortener": has_shortener,
            "mentioned_entities": mentioned_entities,
        }

    @classmethod
    def normalize_auth_log(cls, raw_text: str) -> Dict[str, Any]:
        """Parses lines of authentication log events, timing anomalies, and targets."""
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        failed_count = 0
        success_count = 0
        root_count = 0
        ip_addresses = set()
        users = set()
        off_hours_events = 0
        lockout_detected = False

        ip_regex = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
        time_regex = r'\b([0-2][0-9]):([0-5][0-9]):([0-5][0-9])\b'

        for line in lines:
            line_lower = line.lower()
            if any(term in line_lower for term in ["fail", "invalid", "rejected", "bad password", "auth failure"]):
                failed_count += 1
            if "accepted" in line_lower or "success" in line_lower:
                success_count += 1
            if any(term in line_lower for term in ["root", "sudo", "uid=0", "privilege", "wheel"]):
                root_count += 1
            if any(term in line_lower for term in ["account locked", "maximum authentication attempts", "lockout", "disabled"]):
                lockout_detected = True

            # Extract IP addresses
            for ip in re.findall(ip_regex, line):
                ip_addresses.add(ip)

            # Extract Usernames
            user_match = re.search(r'for\s+(?:invalid\s+user\s+)?([a-zA-Z0-9_\-\.]+)', line, re.IGNORECASE)
            if user_match:
                users.add(user_match.group(1).lower())

            # Parse time for off-hours detection (01:00 AM to 05:00 AM)
            time_match = re.search(time_regex, line)
            if time_match:
                hour = int(time_match.group(1))
                if 1 <= hour <= 5:
                    off_hours_events += 1

        targeted_privileged_users = [u for u in users if u in ["root", "admin", "administrator", "oracle", "deploy", "postgres", "ubuntu", "test"]]

        return {
            "total_lines": len(lines),
            "failed_attempts": failed_count,
            "success_attempts": success_count,
            "root_or_sudo_events": root_count,
            "unique_ips": list(ip_addresses),
            "unique_users": list(users),
            "targeted_privileged_users": targeted_privileged_users,
            "off_hours_events": off_hours_events,
            "lockout_detected": lockout_detected,
        }

    @classmethod
    def normalize_network(cls, raw_text: str) -> Dict[str, Any]:
        """Parses network activity lines (NetFlow, Zeek, or firewall syslog), exfiltration, and beaconing."""
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        dest_ports = []
        suspicious_ports = {4444, 1337, 6667, 31337, 8888, 9999, 50050, 9050, 9150, 53, 8080}
        hit_suspicious_ports = []

        total_bytes_out = 0
        total_bytes_in = 0
        timestamps = []

        time_regex = r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?|\b\d{2}:\d{2}:\d{2}\b)'

        for line in lines:
            # Extract ports
            port_matches = re.findall(r':(\d{1,5})\b', line)
            for p in port_matches:
                p_int = int(p)
                dest_ports.append(p_int)
                if p_int in suspicious_ports:
                    hit_suspicious_ports.append(p_int)

            # Extract bytes out and in
            bytes_out_match = re.search(r'(?:BYTES_OUT|bytes_out|out|sent)=(\d+)', line, re.IGNORECASE)
            if bytes_out_match:
                total_bytes_out += int(bytes_out_match.group(1))

            bytes_in_match = re.search(r'(?:BYTES_IN|bytes_in|in|rcvd)=(\d+)', line, re.IGNORECASE)
            if bytes_in_match:
                total_bytes_in += int(bytes_in_match.group(1))

            # Extract timestamp
            t_match = re.search(time_regex, line)
            if t_match:
                t_str = t_match.group(1)
                timestamps.append(t_str)

        # Detect periodic beaconing intervals (e.g. connections at regular 30s or 60s intervals)
        beaconing_detected = False
        beaconing_interval = None
        if len(timestamps) >= 3:
            try:
                # Try parsing ISO or HH:MM:SS
                dt_list = []
                for ts in timestamps:
                    if 'T' in ts:
                        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                    else:
                        dt = datetime.strptime(ts, "%H:%M:%S")
                    dt_list.append(dt)

                deltas = [(dt_list[i] - dt_list[i-1]).total_seconds() for i in range(1, len(dt_list))]
                if deltas:
                    first_delta = deltas[0]
                    # Check if all intervals match within +/- 3 seconds
                    if first_delta >= 10 and all(abs(d - first_delta) <= 3 for d in deltas):
                        beaconing_detected = True
                        beaconing_interval = int(round(first_delta))
            except Exception:
                pass

        exfiltration_suspected = total_bytes_out > 5000 and total_bytes_out > (total_bytes_in * 3)

        return {
            "total_records": len(lines),
            "ports_observed": list(set(dest_ports)),
            "suspicious_ports_hit": list(set(hit_suspicious_ports)),
            "total_bytes_out": total_bytes_out,
            "total_bytes_in": total_bytes_in,
            "exfiltration_suspected": exfiltration_suspected,
            "beaconing_detected": beaconing_detected,
            "beaconing_interval": beaconing_interval,
            "dns_activity": 53 in dest_ports or "domain" in raw_text.lower(),
        }

    @staticmethod
    def normalize_headers(raw_text: str) -> Dict[str, Any]:
        """Extracts RFC 822 email headers."""
        lines = raw_text.splitlines()
        headers: Dict[str, List[str]] = {}
        current_header = None

        for line in lines:
            if line.startswith((' ', '\t')) and current_header:
                headers[current_header][-1] += ' ' + line.strip()
            elif ':' in line:
                key, val = line.split(':', 1)
                clean_key = key.lower().strip()
                current_header = clean_key
                if clean_key not in headers:
                    headers[clean_key] = []
                headers[clean_key].append(val.strip())
            else:
                current_header = None

        received_hops = headers.get("received", [])

        # Check SPF, DKIM, DMARC in Authentication-Results
        auth_results = " ".join(headers.get("authentication-results", [])).lower()
        spf_fail = "spf=fail" in auth_results or "spf=softfail" in auth_results
        dkim_fail = "dkim=fail" in auth_results
        dmarc_fail = "dmarc=fail" in auth_results

        from_header = headers.get("from", [""])[0]
        reply_to = headers.get("reply-to", [""])[0]
        return_path = headers.get("return-path", [""])[0]

        return {
            "header_count": len(headers),
            "received_hop_count": len(received_hops),
            "from_header": from_header,
            "reply_to": reply_to,
            "return_path": return_path,
            "has_auth_results": bool(auth_results),
            "spf_fail": spf_fail,
            "dkim_fail": dkim_fail,
            "dmarc_fail": dmarc_fail,
        }

    @classmethod
    def normalize_qr(cls, raw_text: str) -> Dict[str, Any]:
        """Dissects QR code payload into specialized telemetry: URL, Wi-Fi, Telecom, Auth, or Exploit."""
        cleaned = raw_text.strip()
        lower = cleaned.lower()

        qr_type = "text"
        is_dangerous_scheme = False
        is_dynamic_qr_generator = False
        redirector_domain = None
        is_wifi_lure = False
        wifi_ssid = None
        wifi_nopass = False
        is_telecom_dispatch = False
        telecom_target = None
        is_otp_leak = False
        url_payload = None
        url_features = None

        # 1. Dangerous scheme checks
        if any(lower.startswith(scheme) for scheme in ["intent://", "data:", "javascript:", "file://", "ms-appinstaller:"]):
            qr_type = "dangerous_scheme"
            is_dangerous_scheme = True

        # 2. Wi-Fi Configuration
        elif lower.startswith("wifi:"):
            qr_type = "wifi"
            is_wifi_lure = True
            ssid_match = re.search(r's:([^;]+)', cleaned, re.IGNORECASE)
            wifi_ssid = ssid_match.group(1) if ssid_match else "Unknown"
            if "t:nopass" in lower or ";p:;" in lower or not re.search(r'p:[^;]+', cleaned, re.IGNORECASE):
                wifi_nopass = True

        # 3. Telecom / SMS / Call dispatch
        elif any(lower.startswith(prefix) for prefix in ["smsto:", "sms:", "tel:", "mmsto:"]):
            qr_type = "telecom"
            is_telecom_dispatch = True
            parts = cleaned.split(":", 2)
            telecom_target = parts[1] if len(parts) > 1 else cleaned

        # 4. OTP Auth secret exposure
        elif lower.startswith("otpauth://"):
            qr_type = "otp"
            is_otp_leak = True

        # 5. URL or Domain Payload (with or without http:// or https://)
        url_match = re.search(r'(https?://[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)', cleaned)
        if url_match and not is_dangerous_scheme and not is_wifi_lure:
            matched_url = url_match.group(1)
            # Ensure scheme
            if not re.match(r'^[a-zA-Z]+://', matched_url):
                matched_url = "https://" + matched_url
            url_payload = matched_url
            url_features = cls.normalize_url(matched_url)
            qr_type = "url"

            # Check if host is a known dynamic QR generator / shortener
            host = url_features.get("host", "").lower()
            root_domain = url_features.get("root_domain", host).lower()
            for dq in cls.DYNAMIC_QR_DOMAINS:
                if host == dq or host.endswith("." + dq) or root_domain == dq:
                    is_dynamic_qr_generator = True
                    redirector_domain = dq
                    break

        # 6. Fallback or Supplementary Text Normalization
        text_features = cls.normalize_message(cleaned)

        return {
            "qr_type": qr_type,
            "raw_payload": cleaned,
            "is_dangerous_scheme": is_dangerous_scheme,
            "is_dynamic_qr_generator": is_dynamic_qr_generator,
            "redirector_domain": redirector_domain,
            "is_wifi_lure": is_wifi_lure,
            "wifi_ssid": wifi_ssid,
            "wifi_nopass": wifi_nopass,
            "is_telecom_dispatch": is_telecom_dispatch,
            "telecom_target": telecom_target,
            "is_otp_leak": is_otp_leak,
            "url_payload": url_payload,
            "url_features": url_features,
            "text_features": text_features,
        }
