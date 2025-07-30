import { NextResponse } from "next/server"
import pool from "@/lib/db"

const iconMap: { [key: string]: string } = {
  traditional: "Music",
  guitars: "Guitar",
  keyboards: "Piano",
  drums: "Drum",
  audio: "Mic",
  strings: "Music",
}

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.color,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.slug, c.description, c.color
      ORDER BY c.sort_order, c.name
    `)

    client.release()

    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: iconMap[row.slug] || "Music",
      count: Number.parseInt(row.product_count) || 0,
      color: row.color || "bg-gray-500",
      description: row.description || "",
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
