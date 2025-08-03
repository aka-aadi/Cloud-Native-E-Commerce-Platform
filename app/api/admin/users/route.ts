import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.user_type,
        u.status,
        u.created_at::date as joined,
        u.city,
        u.state,
        COUNT(p.id) as listings_count
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      WHERE u.email != 'admin@legato.com'
      GROUP BY u.id, u.name, u.email, u.user_type, u.status, u.created_at, u.city, u.state
      ORDER BY u.created_at DESC
      LIMIT 20
    `)

    client.release()

    const users = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      type: row.user_type.charAt(0).toUpperCase() + row.user_type.slice(1),
      listings: Number.parseInt(row.listings_count) || 0,
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      joined: new Date(row.joined).toLocaleDateString("en-IN"),
      location: row.city && row.state ? `${row.city}, ${row.state}` : "Not specified",
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
