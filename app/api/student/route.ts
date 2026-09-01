import { NextResponse } from 'next/server';
import { sql } from '@/app/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        class VARCHAR(20)
      );
    `;

    const students = await sql`SELECT * FROM students`;

    return NextResponse.json({
      message: 'Koneksi & Tabel Berhasil!',
      data: students
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}