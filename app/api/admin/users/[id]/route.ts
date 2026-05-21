import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

const ALLOWED_ROLES = ['admin', 'manager', 'staff']
const ASSIGNABLE_ROLES = ['admin', 'manager', 'staff', 'customer']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: actor } = await supabase
      .from('users')
      .select('role, full_name, first_name')
      .eq('id', user.id)
      .single()

    if (!actor || !ALLOWED_ROLES.includes(actor.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      // user fields
      role,
      is_active,
      full_name,
      first_name,
      last_name,
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

    // Only admins can change roles
    if (role !== undefined && actor.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can assign roles' }, { status: 403 })
    }

    if (role !== undefined && !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role` }, { status: 400 })
    }

    // Prevent admin removing own role
    if (role !== undefined && id === user.id && role !== 'admin') {
      return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: target } = await adminSupabase
      .from('users')
      .select('role, is_active, full_name')
      .eq('id', id)
      .single()

    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Build user updates
    const userUpdates: Record<string, any> = {}
    if (role !== undefined) userUpdates.role = role
    if (is_active !== undefined) userUpdates.is_active = is_active
    if (full_name !== undefined) userUpdates.full_name = full_name
    if (first_name !== undefined) userUpdates.first_name = first_name
    if (last_name !== undefined) userUpdates.last_name = last_name

    if (Object.keys(userUpdates).length > 0) {
      const { error: updateError } = await adminSupabase
        .from('users')
        .update(userUpdates)
        .eq('id', id)

      if (updateError) {
        console.error('User update error:', updateError)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }
    }

    // Build employee profile updates
    const profileUpdates: Record<string, any> = {}
    if (employment_type !== undefined) profileUpdates.employment_type = employment_type
    if (position !== undefined) profileUpdates.position = position
    if (department !== undefined) profileUpdates.department = department
    if (date_hired !== undefined) profileUpdates.date_hired = date_hired
    if (daily_rate !== undefined) profileUpdates.daily_rate = daily_rate
    if (work_days !== undefined) profileUpdates.work_days = work_days
    if (work_start !== undefined) profileUpdates.work_start = work_start
    if (work_end !== undefined) profileUpdates.work_end = work_end
    if (phone !== undefined) profileUpdates.phone = phone
    if (address !== undefined) profileUpdates.address = address
    if (emergency_contact_name !== undefined) profileUpdates.emergency_contact_name = emergency_contact_name
    if (emergency_contact_phone !== undefined) profileUpdates.emergency_contact_phone = emergency_contact_phone
    if (notes !== undefined) profileUpdates.notes = notes

    if (Object.keys(profileUpdates).length > 0) {
      // Upsert — creates profile if it doesn't exist yet (for existing admins)
      const { error: profileError } = await adminSupabase
        .from('employee_profiles')
        .upsert({ user_id: id, ...profileUpdates }, { onConflict: 'user_id' })

      if (profileError) {
        console.error('Employee profile update error:', profileError)
        return NextResponse.json({ error: 'Failed to update employee profile' }, { status: 500 })
      }
    }

    const actorName = actor.first_name ?? actor.full_name ?? user.email
    await logActivity({
      userId: user.id,
      userName: actorName,
      userRole: actor.role,
      action: 'updated',
      entity: 'user',
      entityId: id,
      entityName: target.full_name ?? id,
      changes: Object.fromEntries(
        Object.keys(userUpdates).map((key) => [
          key,
          { from: (target as any)[key] ?? null, to: userUpdates[key] },
        ])
      ),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 })
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: target } = await adminSupabase
      .from('users')
      .select('full_name')
      .eq('id', id)
      .single()

    // Delete auth user (cascades to users table via FK if set up)
    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(id)
    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    await logActivity({
      userId: user.id,
      userName: actor.first_name ?? actor.full_name ?? user.email,
      userRole: actor.role,
      action: 'deleted',
      entity: 'user',
      entityId: id,
      entityName: target?.full_name ?? id,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE user error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}