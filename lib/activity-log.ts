import { createAdminSupabaseClient } from '@/lib/supabase-server'

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

export async function logActivity(params: LogParams) {
  try {
    const supabase = await createAdminSupabaseClient()
    await supabase.from('activity_logs').insert({
      user_id: params.userId ?? null,
      user_name: params.userName ?? null,
      user_role: params.userRole ?? null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId ?? null,
      entity_name: params.entityName ?? null,
      changes: params.changes ?? null,
      metadata: params.metadata ?? null,
    })
  } catch (e) {
    // Never let logging break the main action
    console.error('Activity log error:', e)
  }
}

// Helper to build a diff between two objects
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