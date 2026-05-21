import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

const ALLOWED_ROLES = ['admin', 'manager', 'staff']
const ASSIGNABLE_ROLES = ['admin', 'manager', 'staff', 'customer'] // roles an admin can assign

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, first_name')
      .eq('id', user.id)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { role, is_active, full_name, first_name, last_name } = body

    // Only admins can change roles
    if (role !== undefined && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can assign roles' },
        { status: 403 }
      )
    }

    // Validate role value
    if (role !== undefined && !ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${ASSIGNABLE_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    // Prevent admin from removing their own admin role
    if (role !== undefined && id === user.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot remove your own admin role' },
        { status: 400 }
      )
    }

    const adminSupabase = await createAdminSupabaseClient()

    // Get current user state for logging
    const { data: target } = await adminSupabase
      .from('users')
      .select('role, is_active, full_name')
      .eq('id', id)
      .single()

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update payload — only include fields that were passed
    const updates: Record<string, any> = {}
    if (role !== undefined) updates.role = role
    if (is_active !== undefined) updates.is_active = is_active
    if (full_name !== undefined) updates.full_name = full_name
    if (first_name !== undefined) updates.first_name = first_name
    if (last_name !== undefined) updates.last_name = last_name

    const { error: updateError } = await adminSupabase
      .from('users')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('User update error:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    const actorName = profile.first_name ?? profile.full_name ?? user.email
    await logActivity({
      userId: user.id,
      userName: actorName,
      userRole: profile.role,
      action: 'updated',
      entity: 'user',
      entityId: id,
      entityName: target.full_name ?? id,
      changes: Object.fromEntries(
        Object.keys(updates).map((key) => [
          key,
          { from: (target as any)[key] ?? null, to: updates[key] },
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

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, first_name')
      .eq('id', user.id)
      .single()

    // Only admins can delete users
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 })
    }

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: target } = await adminSupabase
      .from('users')
      .select('full_name')
      .eq('id', id)
      .single()

    const { error: deleteError } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('User delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    await logActivity({
      userId: user.id,
      userName: profile.first_name ?? profile.full_name ?? user.email,
      userRole: profile.role,
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