import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

const ALLOWED_ROLES = ['admin', 'manager', 'staff']
const ASSIGNABLE_ROLES = ['admin', 'manager', 'staff', 'customer']
const TEAM_ROLES = ['admin', 'manager', 'staff']

// ── GET /api/admin/users ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminSupabase = await createAdminSupabaseClient()
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') ?? '1')
    const search = searchParams.get('search') ?? ''
    const tab = searchParams.get('tab') ?? 'customers' // 'customers' | 'team'
    const PER_PAGE = 15
    const from = (page - 1) * PER_PAGE
    const to = from + PER_PAGE - 1

    let query = adminSupabase
      .from('users')
      .select('id, email, full_name, first_name, last_name, role, is_active, avatar_url, created_at', { count: 'exact' })

    if (tab === 'team') {
      query = query.in('role', TEAM_ROLES)
    } else {
      query = query.eq('role', 'customer')
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // For team tab, also fetch employee profiles
    if (tab === 'team' && data && data.length > 0) {
      const userIds = data.map((u: any) => u.id)
      const { data: profiles } = await adminSupabase
        .from('employee_profiles')
        .select('*')
        .in('user_id', userIds)

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p: any) => [p.user_id, p])
      )

      const enriched = data.map((u: any) => ({
        ...u,
        employee_profile: profileMap[u.id] ?? null,
      }))

      return NextResponse.json({ data: enriched, count })
    }

    return NextResponse.json({ data, count })
  } catch (err) {
    console.error('GET users error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/admin/users — create team member ────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: actor } = await supabase
      .from('users')
      .select('role, full_name, first_name')
      .eq('id', user.id)
      .single()

    if (!actor || actor.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create team members' }, { status: 403 })
    }

    const body = await req.json()
    const {
      email,
      password,
      full_name,
      first_name,
      last_name,
      role,
      // employee profile fields
      employment_type,
      position,
      department,
      date_hired,
      daily_rate,
      work_days,
      work_start,
      work_end,
      phone,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      notes,
    } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'email, password, and role are required' }, { status: 400 })
    }

    if (!TEAM_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Role must be admin, manager, or staff' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Create auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('Auth create error:', authError)
      return NextResponse.json(
        { error: authError?.message ?? 'Failed to create user' },
        { status: 400 }
      )
    }

    const newUserId = authData.user.id

    // Upsert into users table
    const { error: userError } = await adminSupabase
      .from('users')
      .upsert({
        id: newUserId,
        email,
        full_name: full_name ?? (`${first_name ?? ''} ${last_name ?? ''}`.trim() || null),
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        role,
        is_active: true,
      })

    if (userError) {
      console.error('User upsert error:', userError)
      // Clean up auth user if users table insert fails
      await adminSupabase.auth.admin.deleteUser(newUserId)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    // Generate employee ID via Postgres function
    const { data: empIdData, error: empIdError } = await adminSupabase
      .rpc('generate_employee_id', { p_role: role })

    if (empIdError || !empIdData) {
      console.error('Employee ID generation error:', empIdError)
      await adminSupabase.auth.admin.deleteUser(newUserId)
      return NextResponse.json({ error: 'Failed to generate employee ID' }, { status: 500 })
    }

    // Create employee profile
    const { data: empProfile, error: profileError } = await adminSupabase
      .from('employee_profiles')
      .insert({
        user_id: newUserId,
        employee_id: empIdData,
        employment_type: employment_type ?? 'full_time',
        position: position ?? null,
        department: department ?? null,
        date_hired: date_hired ?? null,
        daily_rate: daily_rate ?? null,
        work_days: work_days ?? [],
        work_start: work_start ?? null,
        work_end: work_end ?? null,
        phone: phone ?? null,
        address: address ?? null,
        emergency_contact_name: emergency_contact_name ?? null,
        emergency_contact_phone: emergency_contact_phone ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (profileError) {
      console.error('Employee profile error:', profileError)
      // Don't block — user is created, profile can be added later
    }

    await logActivity({
      userId: user.id,
      userName: actor.first_name ?? actor.full_name ?? user.email,
      userRole: actor.role,
      action: 'created',
      entity: 'user',
      entityId: newUserId,
      entityName: full_name ?? email,
      metadata: {
        role,
        employee_id: empIdData,
        employment_type: employment_type ?? 'full_time',
      },
    })

    return NextResponse.json({
      success: true,
      user_id: newUserId,
      employee_id: empIdData,
    })
  } catch (err: any) {
    console.error('POST users error:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}