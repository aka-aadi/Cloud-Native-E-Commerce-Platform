import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const searchQuery = `
      SELECT 
        id,
        name,
        brand,
        price / 100 as price,
        images
      FROM products
      WHERE status = 'approved' AND (
        name ILIKE $1 OR 
        description ILIKE $1 OR 
        brand ILIKE $1
      )
      LIMIT 10
    `
    const result = await db.query(searchQuery, [`%${query}%`])

    const products = result.rows.map((row) => ({
      ...row,
      images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
    }))

    return NextResponse.json({ results: products })
  } catch (error) {
    console.error("Error during search:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
