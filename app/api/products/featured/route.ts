import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.brand,
        p.price / 100 as price,
        p.original_price / 100 as "originalPrice",
        p.images,
        c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
      LIMIT 8
    `
    const result = await db.query(query)

    const products = result.rows.map((row) => ({
      ...row,
      images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
