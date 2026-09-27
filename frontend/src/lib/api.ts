export interface UserProfile {
  full_name: string;
  organization: string;
  department: string;
  avatar_url?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  profile?: UserProfile;
}

export interface ScanFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  confidence: number;
  rule_id: string;
  created_at: string;
}

export interface EvidenceItem {
  category: string;
  finding: string;
  severity: string;
  rule_id?: string;
  confidence?: number;
}

export interface ScanRecord {
  id: string;
  input_type: string;
  input_summary: string;
  input_payload: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  classification?: string;
  heuristic_score: number;
  ml_score: number;
  detection_mode: string;
  executive_summary: string;
  ai_explanation?: string;
  is_ai_generated: boolean;
  findings: ScanFinding[];
  evidence?: EvidenceItem[];
  recommendations: string[];
  recommended_actions?: string[];
  metadata_payload?: Record<string, any>;
  processing_time_ms: number;
  created_at: string;
}

export interface ScanSummaryItem {
  id: string;
  input_type: string;
  input_summary: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  detection_mode: string;
  findings_count: number;
  created_at: string;
}

export interface DashboardStats {
  total_scans: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  risk_distribution: { label: string; count: number; percentage: number }[];
  scanner_distribution: { type: string; count: number }[];
  detection_method_distribution: { label: string; count: number; percentage: number }[];
  recent_scans: ScanSummaryItem[];
}

export interface UserPreferences {
  enable_groq_ai: boolean;
  groq_model: string;
  heuristic_weight: number;
  ml_weight: number;
  reduced_motion: boolean;
}

class ApiService {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      let errorMsg = `Request failed: ${res.statusText}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errorMsg;
      } catch {
        // ignore parse error
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Scans ---
  async analyze(input_type: string, payload: string, enable_ai = true): Promise<ScanRecord> {
    return this.request<ScanRecord>('/scans/analyze', {
      method: 'POST',
      body: JSON.stringify({ input_type, payload, enable_ai }),
    });
  }

  async analyzeQR(file: File, enable_ai = true): Promise<ScanRecord> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}/scans/analyze-qr?enable_ai=${enable_ai}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'QR scan failed');
    }
    return res.json();
  }

  async getScans(params: {
    page?: number;
    limit?: number;
    query?: string;
    input_type?: string;
    risk_level?: string;
  } = {}): Promise<{ items: ScanSummaryItem[]; total: number; page: number; pages: number }> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    if (params.query) q.append('query', params.query);
    if (params.input_type) q.append('input_type', params.input_type);
    if (params.risk_level) q.append('risk_level', params.risk_level);

    return this.request(`/scans?${q.toString()}`);
  }

  async getScan(id: string): Promise<ScanRecord> {
    return this.request<ScanRecord>(`/scans/${id}`);
  }

  async deleteScan(id: string): Promise<void> {
    await this.request(`/scans/${id}`, { method: 'DELETE' });
  }

  // --- Reports ---
  async generateReport(scan_id: string): Promise<{ id: string; report_number: string; download_url: string }> {
    return this.request(`/reports/generate/${scan_id}`, { method: 'POST' });
  }

  // --- Dashboard ---
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // --- Copilot ---
  async chatCopilot(message: string, scan_id?: string, conversation_id?: string): Promise<{ conversation_id: string; response: string; source: string }> {
    return this.request('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, scan_id, conversation_id }),
    });
  }

  // --- Preferences ---
  async getPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences');
  }

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }
}

export const api = new ApiService();
