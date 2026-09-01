import { NextResponse } from 'next/server';
import { sql } from '@/app/db';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM violations ORDER BY id DESC;`;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error GET violations:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];

    for (const item of items) {
      await sql`
        INSERT INTO violations (data) 
        VALUES (${JSON.stringify(item)})
      `;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error POST violations:', error);
    return NextResponse.json({ error: 'Gagal simpan ke cloud' }, { status: 500 });
  }
}