import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAllPages, getAllSections, getSettings } from '@/lib/cms'
import { SectionEditor, SettingsEditor } from '@/components/admin/cms/SectionEditor'
import { PagesListClient } from './PagesListClient'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/admin')
}

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; section?: string }>
}) {
  await requireAdmin()

  const { tab = 'custom', section } = await searchParams

  const [pages, sections, settings] = await Promise.all([
    getAllPages(),
    getAllSections(),
    getSettings(),
  ])

  const activeSection = sections.find(s => s.section_key === (section ?? 'hero'))

  const tabs = [
    { key: 'custom', label: 'Custom pages' },
    { key: 'fixed', label: 'Fixed sections' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brown">Pages & Content</h1>
        <p className="text-sm text-brown-light mt-1">
          Manage your website pages, sections, and global settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-peach-light mb-6">
        {tabs.map(t => (
          <Link
            key={t.key}
            href={`/admin/pages?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? 'bg-white border border-b-white border-peach-light text-brown -mb-px'
                : 'text-brown-light hover:text-brown'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab: Custom Pages */}
      {tab === 'custom' && (
        <PagesListClient pages={pages} />
      )}

      {/* Tab: Fixed Sections */}
      {tab === 'fixed' && (
        <div className="grid grid-cols-[220px_1fr] gap-6">
          {/* Section nav */}
          <div className="space-y-1">
            {sections.map(s => (
              <Link
                key={s.section_key}
                href={`/admin/pages?tab=fixed&section=${s.section_key}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection?.section_key === s.section_key
                    ? 'bg-brown text-whitewash'
                    : 'text-brown-light hover:bg-peach-light/50 hover:text-brown'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Section editor */}
          <div className="bg-white border border-peach-light rounded-xl p-6">
            {activeSection ? (
              <>
                <h2 className="text-base font-semibold text-brown mb-1">{activeSection.label}</h2>
                <p className="text-xs text-brown/40 mb-5">
                  Last updated {new Date(activeSection.updated_at).toLocaleDateString('en-PH', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
                <SectionEditor section={activeSection} />
              </>
            ) : (
              <p className="text-sm text-brown-light">Select a section on the left to edit.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === 'settings' && (
        <div className="max-w-xl">
          <div className="bg-white border border-peach-light rounded-xl p-6">
            <h2 className="text-base font-semibold text-brown mb-1">Global site settings</h2>
            <p className="text-xs text-brown/40 mb-5">
              Footer tagline, social links, and marketplace URLs.
            </p>
            {settings ? (
              <SettingsEditor settings={settings} />
            ) : (
              <p className="text-sm text-red-400">Could not load settings. Check your database.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}