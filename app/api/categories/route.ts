import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { Guitar, Piano, Drum, Mic, Music, PianoIcon as Violin } from "lucide-react"

const iconMap: { [key: string]: any } = {
  guitar: Guitar,
  piano: Piano,
  drum: Drum,
  mic: Mic,
  music: Music,
  violin: Violin,
}

export async function GET() {
  try {
    const client = await pool.connect()
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.icon_name,
        c.color,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.active = true
      GROUP BY c.id, c.name, c.slug, c.description, c.icon_name, c.color
      ORDER BY c.sort_order, c.name
    `
    const result = await client.query(query)
    client.release()

    const categories = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: iconMap[row.icon_name] || Music,
      color: row.color,
      count: Number.parseInt(row.product_count),
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, iconName, color, sortOrder } = body

    const client = await pool.connect()
    const query = `
      INSERT INTO categories (name, slug, description, icon_name, color, sort_order, active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `
    const result = await client.query(query, [name, slug, description, iconName, color, sortOrder || 0])
    client.release()

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
