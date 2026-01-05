// lib/logger.ts
export type LogLevel = "debug" | "info" | "warn" | "error"

/**
 * Check if debug logging is enabled
 */
export function debugEnabled(): boolean {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_DEBUG_LOGS === "true"
  }
  return process.env.NEXT_PUBLIC_DEBUG_LOGS === "true" || process.env.DEBUG_LOGS === "true"
}

/**
 * Redact sensitive data (for production, not needed in dev)
 */
function redact(data: any): any {
  if (!debugEnabled()) {
    // In production, redact sensitive fields
    const sensitive = ["password", "token", "secret", "key", "authorization"]
    if (typeof data === "object" && data !== null) {
      const redacted = { ...data }
      for (const key in redacted) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          redacted[key] = "[REDACTED]"
        }
      }
      return redacted
    }
  }
  return data
}

/**
 * Base log function
 */
export function log(
  level: LogLevel,
  msg: string,
  meta?: Record<string, unknown>
) {
  const isDebug = debugEnabled()
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...(meta ? { meta: isDebug ? meta : redact(meta) } : {}),
  }
  
  // Server + client safe
  // On Vercel you can filter logs by "traceId"
  const output = JSON.stringify(payload, null, 0)
  console[level === "debug" ? "log" : level](output)
}

/**
 * Convenience functions
 */
export function logInfo(msg: string, meta?: Record<string, unknown>) {
  log("info", msg, meta)
}

export function logWarn(msg: string, meta?: Record<string, unknown>) {
  log("warn", msg, meta)
}

export function logError(msg: string, meta?: Record<string, unknown>) {
  log("error", msg, meta)
}

/**
 * Add traceId to meta object
 */
export function withTrace(meta: Record<string, unknown> = {}, traceId: string): Record<string, unknown> {
  return { ...meta, traceId }
}

/**
 * Grouped logging for client-side (better readability)
 */
export function logGrouped(
  groupName: string,
  traceId: string,
  logs: Array<{ level: LogLevel; msg: string; meta?: Record<string, unknown> }>
) {
  if (typeof window === "undefined") {
    // Server-side: just log normally
    logs.forEach(({ level, msg, meta }) => log(level, msg, meta))
    return
  }

  // Client-side: use console groups
  console.groupCollapsed(`[${groupName}] ${traceId}`)
  logs.forEach(({ level, msg, meta }) => {
    const payload = {
      ts: new Date().toISOString(),
      level,
      msg,
      ...(meta ? { meta } : {}),
    }
    console[level === "debug" ? "log" : level](JSON.stringify(payload, null, 0))
  })
  console.groupEnd()
}

export function newTraceId(prefix = "trace") {
  // Use crypto.randomUUID() if available, fallback to Date-based ID
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  // Fallback for environments without crypto.randomUUID
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

