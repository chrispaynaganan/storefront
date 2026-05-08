import { NextResponse } from 'next/server'
export async function GET() { return NextResponse.json({ product: null }) }
export async function PATCH() { return NextResponse.json({ message: 'Not implemented' }, { status: 501 }) }
export async function DELETE() { return NextResponse.json({ message: 'Not implemented' }, { status: 501 }) }
