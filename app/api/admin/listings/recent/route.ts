import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        p.id,
        p.title as item,
        u.name as seller,
        p.price as amount,
        p.status,
        p.created_at::date as date,
        c.name as category
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `)

    client.release()

    const recentListings = result.rows.map((row) => ({
      id: row.id.slice(0, 8),
      item: row.item,
      seller: row.seller,
      amount: Number.parseFloat(row.amount),
      status: row.status.charAt(0).toUpperCase() + row.status.slice(1).replace("_", " "),
      date: new Date(row.date).toLocaleDateString("en-IN"),
      category: row.category,
    }))

    return NextResponse.json(recentListings)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch recent listings" }, { status: 500 })
  }
}
