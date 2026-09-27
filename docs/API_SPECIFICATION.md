# CYBERGUARD — REST API Specification

## 1. Protocol & Transport Guidelines

- **Base URL:** `/api`
- **Content Type:** `application/json` (or `multipart/form-data` for QR code image file uploads).
- **Session Transport:** Encrypted, signed `session_token` stored in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie.
- **Error Format:** Consistent JSON envelope:
  ```json
  {
    "detail": {
      "code": "ERROR_CODE",
      "message": "Human readable sanitised explanation",
      "field": "optional_field_name"
    }
  }
  ```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 `POST /api/auth/login`
Authenticates the user using server-configured credentials.
- **Request Body:**
  ```json
  {
    "email": "analyst@cyberguard.internal",
    "password": "StrongSecretPassword"
  }
  ```
- **Response `200 OK`:** Sets `session_token` cookie.
  ```json
  {
    "user": {
      "id": "uuid-v4-string",
      "email": "analyst@cyberguard.internal",
      "role": "analyst",
      "profile": {
        "full_name": "Senior Security Analyst",
        "organization": "Cyber Defense Operations"
      }
    },
    "message": "Authentication successful"
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  { "detail": "Invalid authentication credentials" }
  ```

### 2.2 `POST /api/auth/logout`
Revokes active session from database and clears cookie.
- **Response `200 OK`:**
  ```json
  { "message": "Session successfully terminated" }
  ```

### 2.3 `GET /api/auth/me`
Validates active session and retrieves user profile.
- **Response `200 OK`:** Current user object.
- **Response `401 Unauthorized`:** If session expired or invalid.

---

## 3. Scanner Endpoints (`/api/scans`)

### 3.1 `POST /api/scans/analyze`
Executes full defensive pipeline across the 7 supported input types.
- **Request Body (JSON or Form for QR):**
  ```json
  {
    "input_type": "url | email | message | qr | auth_log | network | headers",
    "payload": "https://secure-login-apple-support.security-verify.cc/login",
    "enable_ai": true
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "scan_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "input_type": "url",
    "input_summary": "https://secure-login-apple-support.security-verify.cc/login",
    "risk_score": 88,
    "risk_level": "HIGH",
    "heuristic_score": 90.0,
    "ml_score": 84.5,
    "detection_mode": "HYBRID_AI",
    "executive_summary": "High-risk credential harvesting phishing attempt detected targeting Apple brand credentials.",
    "ai_explanation": "The analyzed URL exhibits multiple indicators characteristic of credential phishing campaigns: lookalike domain mimicking Apple support, suspicious deep subdomain structure, and an unsecured HTTP form submission endpoint.",
    "is_ai_generated": true,
    "findings": [
      {
        "category": "IMPERSONATION",
        "title": "Brand Impersonation Target (Apple)",
        "description": "Domain contains 'apple-support' embedded in subdomain while root domain is untrusted third party.",
        "severity": "CRITICAL",
        "confidence": 0.95,
        "rule_id": "RULE_URL_BRAND_IMPERSONATION"
      },
      {
        "category": "STRUCTURAL",
        "title": "Suspicious Deep Subdomain Depth",
        "description": "URL contains 3 subdomains intended to deceive URL inspection.",
        "severity": "HIGH",
        "confidence": 0.88,
        "rule_id": "RULE_URL_SUBDOMAIN_DEPTH"
      }
    ],
    "recommendations": [
      "Do not access the link or submit credentials.",
      "Add security-verify.cc to perimeter DNS blocklists.",
      "Search SIEM proxy logs for other hits to this root domain.",
      "Initiate brand takedown request with the domain registrar."
    ],
    "metadata": {
      "domain": "security-verify.cc",
      "scheme": "https",
      "has_ip_host": false,
      "path_indicators": ["login"]
    },
    "processing_time_ms": 340,
    "created_at": "2026-09-27T11:15:00Z"
  }
  ```

### 3.2 `POST /api/scans/analyze-qr`
Multipart file upload endpoint for QR code images.
- **Request:** `file` (image/png, image/jpeg, image/webp)
- **Response `200 OK`:** Same analysis structure, with extracted decoded payload in metadata.

### 3.3 `GET /api/scans`
Query paginated scan history.
- **Query Params:**
  - `page`: default 1
  - `limit`: default 20 (max 100)
  - `query`: free-text search string
  - `input_type`: filter by type
  - `risk_level`: `LOW` | `MEDIUM` | `HIGH`
  - `date_from`, `date_to`: ISO timestamps
- **Response `200 OK`:**
  ```json
  {
    "items": [ /* array of scan records */ ],
    "total": 42,
    "page": 1,
    "pages": 3
  }
  ```

### 3.4 `GET /api/scans/{id}`
Retrieve a single historical scan with full findings.

### 3.5 `DELETE /api/scans/{id}`
Deletes scan record, findings, and associated reports.
- **Response `200 OK`:** `{ "success": true }`

### 3.6 `GET /api/scans/export/csv`
Exports user's scan records matching filters as a standard RFC 4180 CSV file.

### 3.7 `GET /api/scans/export/json`
Exports user's scan records matching filters as a formatted JSON document.

---

## 4. Reports Endpoints (`/api/reports`)

### 4.1 `POST /api/reports/generate/{scan_id}`
Generates a ReportLab PDF incident report on the server.
- **Response `200 OK`:**
  ```json
  {
    "report_id": "report-uuid",
    "report_number": "CG-2026-0927-0042",
    "download_url": "/api/reports/download/report-uuid"
  }
  ```

### 4.2 `GET /api/reports/download/{report_id}`
Streams the compiled binary PDF document with proper `Content-Disposition: attachment; filename="CYBERGUARD-Incident-Report-0042.pdf"`.

---

## 5. Dashboard Endpoints (`/api/dashboard`)

### 5.1 `GET /api/dashboard/stats`
Computes real-time KPIs strictly from the user's persisted scan records.
- **Response `200 OK`:**
  ```json
  {
    "total_scans": 128,
    "high_risk_count": 34,
    "medium_risk_count": 41,
    "low_risk_count": 53,
    "average_risk_score": 46.2,
    "risk_distribution": [
      { "level": "HIGH", "count": 34, "percentage": 26.5 },
      { "level": "MEDIUM", "count": 41, "percentage": 32.0 },
      { "level": "LOW", "count": 53, "percentage": 41.5 }
    ],
    "scanner_distribution": [
      { "type": "url", "count": 52 },
      { "type": "email", "count": 38 },
      { "type": "message", "count": 15 },
      { "type": "qr", "count": 9 },
      { "type": "auth_log", "count": 6 },
      { "type": "headers", "count": 5 },
      { "type": "network", "count": 3 }
    ],
    "detection_method_distribution": [
      { "method": "HYBRID_AI", "count": 110 },
      { "method": "HYBRID_LOCAL", "count": 18 }
    ],
    "recent_scans": [ /* top 5 recent scans */ ]
  }
  ```

---

## 6. AI Copilot Endpoints (`/api/copilot`)

### 6.1 `POST /api/copilot/chat`
Ask defensive security questions or interrogate specific scan evidence.
- **Request Body:**
  ```json
  {
    "scan_id": "optional-scan-uuid",
    "conversation_id": "optional-conversation-uuid",
    "message": "Why was the lookalike domain rated as Critical severity?"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "conversation_id": "conversation-uuid",
    "response": "The indicator was flagged with **Critical severity** because the domain specifically impersonates a high-value authentication service...",
    "source": "GROQ_LLM"
  }
  ```
