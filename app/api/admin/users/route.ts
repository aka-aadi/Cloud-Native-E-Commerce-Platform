import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        id,
        name,
        email,
        role,
        created_at::date as created_at
      FROM users
      ORDER BY created_at DESC
    `)

    client.release()

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.created_at).toLocaleDateString("en-IN"),
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
