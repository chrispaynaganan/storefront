'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ActivityLog {
  id: string
  user_id: string | null
  user_name: string | null
  user_role: string | null
  action: string
  entity: string
  entity_id: string | null
  entity_name: string | null
  changes: Record<string, { from: any; to: any }> | null
  metadata: Record<string, any> | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  created:     'bg-green-100 text-green-700',
  updated:     'bg-blue-100 text-blue-700',
  deleted:     'bg-red-100 text-red-700',
  published:   'bg-purple-100 text-purple-700',
  unpublished: 'bg-yellow-100 text-yellow-700',
  signed_in:   'bg-peach-light text-brown',
  signed_out:  'bg-gray-100 text-gray-600',
}

const ENTITIES = ['all', 'product', 'collection', 'order', 'promo', 'journal_post', 'auth']
const ACTIONS  = ['all', 'created', 'updated', 'deleted', 'published', 'unpublished', 'signed_in', 'signed_out']

function ChangesView({ changes }: { changes: Record<string, { from: any; to: any }> }) {
  const entries = Object.entries(changes)
  if (!entries.length) return null

  return (
    <div className="mt-2 space-y-1">
      {entries.map(([key, { from, to }]) => (
        <div key={key} className="flex items-start gap-2 text-xs">
          <span className="text-brown/40 font-mono shrink-0 w-32 truncate">{key}</span>
          <span className="text-red-400 line-through truncate max-w-30">
            {from === null ? '—' : typeof from === 'object' ? JSON.stringify(from) : String(from)}
          </span>
          <span className="text-brown/30 shrink-0">→</span>
          <span className="text-green-600 truncate max-w-30">
            {to === null ? '—' : typeof to === 'object' ? JSON.stringify(to) : String(to)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminLogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const PER_PAGE = 25

  const [filterEntity, setFilterEntity] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterUser, setFilterUser] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const from = (page - 1) * PER_PAGE
    const to = from + PER_PAGE - 1

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filterEntity !== 'all') query = query.eq('entity', filterEntity)
    if (filterAction !== 'all') query = query.eq('action', filterAction)
    if (filterUser.trim()) query = query.ilike('user_name', `%${filterUser.trim()}%`)

    const { data, count } = await query
    setLogs((data as ActivityLog[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, filterEntity, filterAction, filterUser])

  useEffect(() => { load() }, [load])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [filterEntity, filterAction, filterUser])

  const totalPages = Math.ceil(total / PER_PAGE)

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-brown tracking-tight">Activity Log</h1>
          <p className="text-sm text-brown/40 mt-1">{total.toLocaleString()} total entries</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-whitewash-off text-brown/60 text-sm rounded-2xl px-4 py-2 hover:bg-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Entity filter */}
        <div className="relative">
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="appearance-none bg-white border border-whitewash-off rounded-2xl px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-peach pr-8 transition"
          >
            {ENTITIES.map(e => (
              <option key={e} value={e}>{e === 'all' ? 'All entities' : e.replace('_', ' ')}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Action filter */}
        <div className="relative">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="appearance-none bg-white border border-whitewash-off rounded-2xl px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-peach pr-8 transition"
          >
            {ACTIONS.map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All actions' : a.replace('_', ' ')}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* User search */}
        <input
          type="text"
          placeholder="Search by user..."
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="bg-white border border-whitewash-off rounded-2xl px-4 py-2 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition"
        />

        {(filterEntity !== 'all' || filterAction !== 'all' || filterUser) && (
          <button
            onClick={() => { setFilterEntity('all'); setFilterAction('all'); setFilterUser('') }}
            className="text-sm text-brown/40 hover:text-brown underline transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No activity found.</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-whitewash-off overflow-hidden"
            >
              {/* Main row */}
              <div
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-whitewash/40 transition"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                {/* Action badge */}
                <span className={cn(
                  'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize mt-0.5',
                  ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'
                )}>
                  {log.action.replace('_', ' ')}
                </span>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown">
                    <span className="font-medium">{log.user_name ?? 'Unknown'}</span>
                    {' '}
                    <span className="text-brown/50">{log.action.replace('_', ' ')}</span>
                    {log.entity_name && (
                      <> <span className="font-medium">{log.entity_name}</span></>
                    )}
                    {' '}
                    <span className="text-brown/30 text-xs capitalize">({log.entity.replace('_', ' ')})</span>
                  </p>
                  <p className="text-xs text-brown/40 mt-0.5">{formatDate(log.created_at)}</p>
                </div>

                {/* Role badge */}
                {log.user_role && (
                  <span className="shrink-0 text-xs text-brown/40 capitalize bg-whitewash-off px-2 py-1 rounded-full">
                    {log.user_role}
                  </span>
                )}

                {/* Expand indicator */}
                {(log.changes || log.metadata) && (
                  <svg
                    className={cn('w-4 h-4 text-brown/30 shrink-0 transition-transform mt-0.5', expandedId === log.id ? 'rotate-180' : '')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {/* Expanded detail */}
              {expandedId === log.id && (log.changes || log.metadata) && (
                <div className="px-5 pb-4 border-t border-whitewash-off pt-3">
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-brown/40 uppercase tracking-wide mb-2">Changes</p>
                      <ChangesView changes={log.changes} />
                    </div>
                  )}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-brown/40 uppercase tracking-wide mb-2">Metadata</p>
                      <div className="space-y-1">
                        {Object.entries(log.metadata).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2 text-xs">
                            <span className="text-brown/40 font-mono w-32 shrink-0">{k}</span>
                            <span className="text-brown/70">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.entity_id && (
                    <p className="text-xs text-brown/30 mt-3 font-mono">ID: {log.entity_id}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-brown/50">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}