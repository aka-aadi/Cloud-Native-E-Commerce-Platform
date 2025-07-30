import { NextResponse } from "next/server"
import { db } from "@/lib/db"
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

    const result = await db.query(query)

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
    console.error("Error fetching categories:", error)

    // Fallback data for development
    const fallbackCategories = [
      {
        id: "1",
        name: "Guitars",
        slug: "guitars",
        icon: Guitar,
        count: 2431,
        color: "bg-orange-500",
        description: "Acoustic and electric guitars",
      },
      {
        id: "2",
        name: "Keyboards",
        slug: "keyboards",
        icon: Piano,
        count: 1256,
        color: "bg-blue-500",
        description: "Digital pianos and synthesizers",
      },
      {
        id: "3",
        name: "Drums",
        slug: "drums",
        icon: Drum,
        count: 892,
        color: "bg-red-500",
        description: "Acoustic and electronic drum kits",
      },
      {
        id: "4",
        name: "Audio Gear",
        slug: "audio-gear",
        icon: Mic,
        count: 1678,
        color: "bg-green-500",
        description: "Microphones and recording equipment",
      },
      {
        id: "5",
        name: "Traditional",
        slug: "traditional",
        icon: Music,
        count: 445,
        color: "bg-yellow-500",
        description: "Tabla, sitar, and classical instruments",
      },
      {
        id: "6",
        name: "Strings",
        slug: "strings",
        icon: Violin,
        count: 723,
        color: "bg-purple-500",
        description: "Violin, cello, and string instruments",
      },
    ]

    return NextResponse.json(fallbackCategories)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, iconName, color, sortOrder } = body

    const query = `
      INSERT INTO categories (name, slug, description, icon_name, color, sort_order, active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `

    const result = await db.query(query, [name, slug, description, iconName, color, sortOrder || 0])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
