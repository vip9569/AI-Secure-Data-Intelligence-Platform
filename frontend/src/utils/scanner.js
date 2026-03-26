const PATTERNS = [
  { type: 'password',         re: /(?:password|passwd|pwd)\s*[=:]\s*["']?(\S+)/i,               risk: 'critical', desc: 'Password found in plain text',         rec: 'Never log passwords. Use env vars.' },
  { type: 'api_key',          re: /(?:api[_-]?key|apikey)\s*[=:]\s*["']?([A-Za-z0-9\-_]{16,})/i, risk: 'high',     desc: 'API key exposed',                     rec: 'Rotate key and use a secrets manager.' },
  { type: 'token',            re: /(?:token|bearer|jwt)\s*[=:]\s*["']?([A-Za-z0-9\-_.]{20,})/i,  risk: 'high',     desc: 'Auth token in plain text',             rec: 'Revoke token and store securely.' },
  { type: 'aws_key',          re: /(AKIA[0-9A-Z]{16})/,                                           risk: 'critical', desc: 'AWS access key detected',              rec: 'Rotate via IAM immediately.' },
  { type: 'email',            re: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,           risk: 'low',      desc: 'Email address in content',             rec: 'Mask PII before logging.' },
  { type: 'stack_trace',      re: /Traceback|Exception in thread|at [a-zA-Z]+\.[a-zA-Z]+\(/,     risk: 'medium',   desc: 'Stack trace detected',                 rec: 'Suppress stack traces in production.' },
  { type: 'failed_login',     re: /failed.{0,10}login|auth.{0,10}fail|invalid.{0,10}pass/i,      risk: 'medium',   desc: 'Failed auth attempt',                  rec: 'Monitor for brute-force patterns.' },
  { type: 'debug_mode',       re: /debug\s*[=:]\s*true|DEBUG\s*on/i,                             risk: 'medium',   desc: 'Debug mode enabled',                   rec: 'Disable debug in production.' },
  { type: 'hardcoded_secret', re: /(?:secret|private_key|client_secret)\s*[=:]\s*["']?([A-Za-z0-9\-_!@#]{8,})/i, risk: 'high', desc: 'Hardcoded secret', rec: 'Move to environment variables.' },
  { type: 'sql_injection',    re: /union\s+select|drop\s+table|exec\s*\(|'\s*or\s*'1'='1/i,     risk: 'critical', desc: 'SQL injection pattern',                rec: 'Use parameterized queries.' },
  { type: 'ip_address',       re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,                                risk: 'info',     desc: 'IP address logged',                   rec: 'Ensure IP logging complies with privacy policy.' },
]

const RISK_ORDER = ['critical', 'high', 'medium', 'low', 'info', 'none']
const WEIGHTS    = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }

function maskValue(val) {
  return val.length > 5 ? val.slice(0, 3) + '***' + val.slice(-2) : '***'
}

export function clientSideScan(text, type, opts = {}) {
  const lines    = text.split('\n')
  const findings = []
  const lineMap  = []

  lines.forEach((line, i) => {
    const lineNo    = i + 1
    const lineRisks = []
    let maskedLine  = line

    PATTERNS.forEach((p) => {
      const m = line.match(p.re)
      if (m) {
        const val    = m[1] || m[0]
        const masked = maskValue(val)
        maskedLine   = maskedLine.replace(val, masked)
        findings.push({ type: p.type, risk: p.risk, line: lineNo, value: masked, description: p.desc, recommendation: p.rec })
        lineRisks.push({ type: p.type, risk: p.risk })
      }
    })

    const maxRisk = RISK_ORDER.find((r) => lineRisks.some((lr) => lr.risk === r)) || 'none'
    lineMap.push({ line_no: lineNo, text: line, masked: maskedLine, risks: lineRisks, max_risk: maxRisk })
  })

  const score     = Math.min(10, findings.reduce((s, f) => s + (WEIGHTS[f.risk] || 0), 0))
  const riskLevel = score >= 8 ? 'critical' : score >= 6 ? 'high' : score >= 4 ? 'medium' : score >= 2 ? 'low' : 'info'
  const critCount = findings.filter((f) => f.risk === 'critical').length
  const highCount = findings.filter((f) => f.risk === 'high').length

  return {
    summary: findings.length
      ? `Found ${findings.length} issue(s) in ${type} content.${critCount ? ` ${critCount} critical finding(s) need immediate attention.` : ''}${highCount ? ` ${highCount} high-severity issue(s) detected.` : ''}`
      : `No significant risks detected in the ${type} content.`,
    content_type: type,
    findings,
    risk_score: Math.max(1, score),
    risk_level: riskLevel,
    action: opts.mask && findings.length ? 'masked' : 'allowed',
    insights: findings.length
      ? [
          'Sensitive data patterns detected — review before sharing logs',
          'Consider implementing structured logging with automatic PII masking',
          'Audit your logging configuration to reduce data exposure surface',
        ]
      : ['Content appears clean with no major security issues detected.'],
    line_map: lineMap,
  }
}

export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
