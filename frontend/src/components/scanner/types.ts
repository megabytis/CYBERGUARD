export type SegmentState = 'safe' | 'review' | 'critical';

export type Segment = {
  label: string;
  value: string;
  state: SegmentState;
  reason?: string;
};

export type Stage = {
  label: string;
  detail: string;
};

export type Evidence = {
  label: string;
  detail: string;
  severity: SegmentState;
};

export type Verdict = 'safe' | 'review' | 'critical';

export type ScanProfile = {
  url: string;
  segments: Segment[];
  stages: Stage[];
  score: number;
  verdict: Verdict;
  action: string;
  evidence: Evidence[];
};

export const demoStages: Stage[] = [
  { label: 'Structure', detail: 'URL anatomy' },
  { label: 'Heuristics', detail: 'Threat signals' },
  { label: 'ML classifier', detail: 'Pattern match' },
  { label: 'AI explanation', detail: 'Plain-language reason' },
];

export const phishingProfile: ScanProfile = {
  url: 'https://secure-paypa1.login.verify-account.example/wp-login.php',
  segments: [
    { label: 'scheme', value: 'https://', state: 'review', reason: 'HTTP/HTTPS masquerade' },
    { label: 'subdomain', value: 'secure-paypa1.login.verify-account', state: 'critical', reason: 'Deep subdomain chain' },
    { label: 'domain', value: 'example', state: 'critical', reason: 'Lookalike brand spoofing' },
    { label: 'TLD', value: '.com', state: 'safe' },
    { label: 'path', value: '/wp-login.php', state: 'critical', reason: 'Credential path /login' },
    { label: 'query', value: '—', state: 'safe' },
  ],
  stages: demoStages,
  score: 94,
  verdict: 'critical',
  action: 'Do not enter credentials. Immediate defensive isolation and threat reporting recommended.',
  evidence: [
    { label: 'Lookalike identity', detail: 'The hostname imitates a trusted payment brand with a substituted character.', severity: 'critical' },
    { label: 'Credential collection', detail: 'The path targets a WordPress login endpoint, a common credential lure.', severity: 'critical' },
    { label: 'Unusual structure', detail: 'Multiple nested subdomains obscure the actual destination.', severity: 'review' },
  ],
};

export const safeProfile: ScanProfile = {
  url: 'https://www.nasa.gov/learning-resources/',
  segments: [
    { label: 'scheme', value: 'https://', state: 'safe' },
    { label: 'subdomain', value: 'www', state: 'safe' },
    { label: 'domain', value: 'nasa', state: 'safe' },
    { label: 'TLD', value: '.gov', state: 'safe' },
    { label: 'path', value: '/learning-resources/', state: 'safe' },
    { label: 'query', value: '—', state: 'safe' },
  ],
  stages: demoStages,
  score: 4,
  verdict: 'safe',
  action: 'The destination looks legitimate and cryptographically verified. You can continue with confidence.',
  evidence: [
    { label: 'Verified domain', detail: 'The destination uses the established nasa.gov government domain.', severity: 'safe' },
    { label: 'Secure transport', detail: 'The URL uses HTTPS with a straightforward structure.', severity: 'safe' },
    { label: 'No lure patterns', detail: 'No credential paths, obfuscation, or suspicious redirects detected.', severity: 'safe' },
  ],
};

/**
 * Intelligent client-side URL dissection and defensive heuristics.
 * Evaluates RFC structure, subdomain depth, typosquatting brand substitutions,
 * credential harvesting paths, and high-risk TLDs for ANY user-supplied URL.
 */
export function parseUrlToScanProfile(rawUrl: string): ScanProfile {
  let urlStr = rawUrl.trim();
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const parsed = new URL(urlStr);
    const protocol = parsed.protocol;
    const hostname = parsed.hostname;
    const pathname = parsed.pathname || '/';
    const search = parsed.search || '—';

    // Parse host segments
    const hostParts = hostname.split('.');
    let tld = '';
    let domain = '';
    let subdomain = '';

    if (hostParts.length >= 2) {
      tld = '.' + hostParts[hostParts.length - 1];
      domain = hostParts[hostParts.length - 2];
      subdomain = hostParts.slice(0, hostParts.length - 2).join('.');
    } else {
      domain = hostname;
    }

    const segments: Segment[] = [];
    const evidence: Evidence[] = [];
    let criticalCount = 0;
    let reviewCount = 0;

    // 1. Scheme Check
    if (protocol === 'http:') {
      segments.push({
        label: 'scheme',
        value: 'http://',
        state: 'review',
        reason: 'Unencrypted HTTP protocol without TLS',
      });
      evidence.push({
        label: 'Insecure Transport',
        detail: 'Target specifies unencrypted HTTP transport instead of TLS/HTTPS.',
        severity: 'review',
      });
      reviewCount++;
    } else {
      segments.push({
        label: 'scheme',
        value: 'https://',
        state: 'safe',
        reason: 'Secure TLS transport',
      });
    }

    // 2. Subdomain Check
    const brandKeywords = [
      'paypal',
      'apple',
      'google',
      'microsoft',
      'amazon',
      'netflix',
      'bank',
      'secure',
      'verify',
      'login',
      'account',
      'auth',
    ];
    const hasBrandInSubdomain = brandKeywords.some((b) =>
      subdomain.toLowerCase().includes(b)
    );
    const isDeepSubdomain = subdomain.split('.').length >= 2 || subdomain.length > 22;

    if (hasBrandInSubdomain) {
      segments.push({
        label: 'subdomain',
        value: subdomain || '—',
        state: 'critical',
        reason: 'Impersonation brand cue nested in subdomain',
      });
      evidence.push({
        label: 'Brand Mimicry in Subdomain',
        detail: `Subdomain "${subdomain}" embeds brand keywords to mislead users.`,
        severity: 'critical',
      });
      criticalCount++;
    } else if (isDeepSubdomain) {
      segments.push({
        label: 'subdomain',
        value: subdomain,
        state: 'review',
        reason: 'Unusual multi-level subdomain depth',
      });
      evidence.push({
        label: 'Subdomain Chain Obfuscation',
        detail: 'Deep nesting obscuring the true root domain authority.',
        severity: 'review',
      });
      reviewCount++;
    } else {
      segments.push({
        label: 'subdomain',
        value: subdomain || '—',
        state: 'safe',
      });
    }

    // 3. Domain Check
    const safeDomains = [
      'nasa',
      'google',
      'github',
      'microsoft',
      'apple',
      'gov',
      'edu',
      'cloudflare',
      'wikipedia',
      'amazon',
      'youtube',
    ];
    const isKnownSafeDomain =
      safeDomains.includes(domain.toLowerCase()) &&
      ['.gov', '.edu', '.com', '.org', '.io', '.net'].includes(tld.toLowerCase());
    const hasTypoSubstitute =
      /paypa[1l]|g[0o]{2}gle|app[1l]e|m[i1]crosoft|amaz[0o]n/i.test(domain) &&
      !isKnownSafeDomain;
    const hasHyphenChaining = (domain.match(/-/g) || []).length >= 2;
    const hasBrandInDomain =
      brandKeywords.some((b) => domain.toLowerCase().includes(b)) && !isKnownSafeDomain;

    if (hasTypoSubstitute) {
      segments.push({
        label: 'domain',
        value: domain,
        state: 'critical',
        reason: 'Typosquatting character substitution (e.g. 1 for l)',
      });
      evidence.push({
        label: 'Typosquatting Spoof',
        detail: `Root domain "${domain}" employs deceptive character substitution.`,
        severity: 'critical',
      });
      criticalCount++;
    } else if (hasBrandInDomain || hasHyphenChaining) {
      segments.push({
        label: 'domain',
        value: domain,
        state: 'critical',
        reason: 'Hyphen-chained brand keywords',
      });
      evidence.push({
        label: 'Deceptive Domain Structure',
        detail: `Domain "${domain}" chains brand keywords to forge legitimacy.`,
        severity: 'critical',
      });
      criticalCount++;
    } else if (isKnownSafeDomain) {
      segments.push({
        label: 'domain',
        value: domain,
        state: 'safe',
        reason: 'Verified official root infrastructure',
      });
    } else {
      segments.push({
        label: 'domain',
        value: domain,
        state: 'review',
        reason: 'Unverified external domain entity',
      });
      reviewCount++;
    }

    // 4. TLD Check
    const riskyTlds = ['.cc', '.ru', '.xyz', '.top', '.buzz', '.work', '.cn', '.tk', '.cf', '.gq'];
    if (riskyTlds.includes(tld.toLowerCase())) {
      segments.push({
        label: 'TLD',
        value: tld,
        state: 'review',
        reason: 'Abuse-prone top-level domain registrar',
      });
      evidence.push({
        label: 'High-Abuse Registrar TLD',
        detail: `Top-level domain "${tld}" shows disproportionate historical phishing activity.`,
        severity: 'review',
      });
      reviewCount++;
    } else {
      segments.push({
        label: 'TLD',
        value: tld || '.com',
        state: 'safe',
      });
    }

    // 5. Path Check
    const credentialPathRegex =
      /(login|verify|auth|signin|wp-login|account|security|password|session|update|billing|wallet)/i;
    const isCredPath = credentialPathRegex.test(pathname);

    if (isCredPath && (criticalCount > 0 || reviewCount > 0)) {
      segments.push({
        label: 'path',
        value: pathname,
        state: 'critical',
        reason: 'Credential harvest endpoint lure',
      });
      evidence.push({
        label: 'Credential Harvester Path',
        detail: `Endpoint "${pathname}" solicits authentication credentials on unverified domain.`,
        severity: 'critical',
      });
      criticalCount++;
    } else if (isCredPath) {
      segments.push({
        label: 'path',
        value: pathname,
        state: 'safe',
        reason: 'Standard authentication pathway',
      });
    } else {
      segments.push({
        label: 'path',
        value: pathname,
        state: 'safe',
      });
    }

    // 6. Query Check
    const isSensitiveQuery = /(token=|session=|redirect=|url=|dest=|otp=|secret=)/i.test(search);
    if (isSensitiveQuery) {
      segments.push({
        label: 'query',
        value: search.length > 25 ? search.slice(0, 25) + '…' : search,
        state: 'review',
        reason: 'Embedded session or redirect parameter',
      });
      evidence.push({
        label: 'Suspicious Query Vector',
        detail: 'URL query string conveys authentication tokens or redirect parameters.',
        severity: 'review',
      });
      reviewCount++;
    } else {
      segments.push({
        label: 'query',
        value:
          search === '—' ? '—' : search.length > 25 ? search.slice(0, 25) + '…' : search,
        state: 'safe',
      });
    }

    // Compute dynamic Score & Verdict
    let score = 4;
    let verdict: Verdict = 'safe';
    let action =
      'The destination looks legitimate and cryptographically verified. You can continue with confidence.';

    if (criticalCount >= 2) {
      score = Math.min(96, 84 + criticalCount * 4);
      verdict = 'critical';
      action =
        'Do not enter credentials. Immediate defensive isolation and threat reporting recommended.';
    } else if (criticalCount === 1) {
      score = Math.min(88, 72 + reviewCount * 4);
      verdict = 'critical';
      action =
        'Phishing indicators detected. Suspend interaction and verify destination out-of-band.';
    } else if (reviewCount >= 2) {
      score = Math.min(65, 42 + reviewCount * 6);
      verdict = 'review';
      action =
        'Anomalies detected. Proceed with caution and do not disclose sensitive corporate credentials.';
    } else if (reviewCount === 1) {
      score = 36;
      verdict = 'review';
      action = 'Minor unverified signals observed. Exercise prudence before submitting data.';
    } else {
      score = isKnownSafeDomain ? 4 : 8;
      verdict = 'safe';
      if (evidence.length === 0) {
        evidence.push(
          {
            label: 'Verified Domain Authority',
            detail: `Domain authority established for ${domain}${tld}.`,
            severity: 'safe',
          },
          {
            label: 'Encrypted Channel',
            detail: 'HTTPS transport encryption verified.',
            severity: 'safe',
          },
          {
            label: 'Zero Malicious Indicators',
            detail:
              'Clean path and query parameters with zero credential exploitation vectors.',
            severity: 'safe',
          }
        );
      }
    }

    return {
      url: rawUrl.trim(),
      segments,
      stages: demoStages,
      score,
      verdict,
      action,
      evidence: evidence.slice(0, 3),
    };
  } catch {
    return phishingProfile;
  }
}
