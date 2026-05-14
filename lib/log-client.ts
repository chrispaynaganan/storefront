interface LogParams {
  userId?: string | null
  userName?: string | null
  userRole?: string | null
  action: string
  entity: string
  entityId?: string | null
  entityName?: string | null
  changes?: Record<string, { from: any; to: any }> | null
  metadata?: Record<string, any> | null
}

export async function logAction(params: LogParams) {
  try {
    await fetch('/api/admin/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch (e) {
    console.error('Log error:', e)
  }
}

export function buildDiff(
  before: Record<string, any>,
  after: Record<string, any>,
  ignoreKeys: string[] = ['updated_at', 'created_at']
): Record<string, { from: any; to: any }> {
  const diff: Record<string, { from: any; to: any }> = {}
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const key of allKeys) {
    if (ignoreKeys.includes(key)) continue
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = { from: before[key] ?? null, to: after[key] ?? null }
    }
  }
  return diff
}