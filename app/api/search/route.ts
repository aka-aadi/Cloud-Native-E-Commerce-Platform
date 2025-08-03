import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {}
    const searchTerm = `%${query}%`

    // Search products
    if (type === "all" || type === "products") {
      const productsQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.image_url as "imageUrl",
          c.name as category,
          'product' as type
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 
          p.status = 'active' AND
          (p.name ILIKE $1 OR p.description ILIKE $1 OR c.name ILIKE $1)
        ORDER BY 
          CASE WHEN p.name ILIKE $1 THEN 1
               WHEN c.name ILIKE $1 THEN 2
               ELSE 3
          END
        LIMIT $2
      `

      const productsResult = await db.query(productsQuery, [searchTerm, limit])
      results.products = productsResult.rows
    }

    // Search categories
    if (type === "all" || type === "categories") {
      const categoriesQuery = `
        SELECT 
          id,
          name,
          slug,
          image_url as "imageUrl",
          'category' as type
        FROM categories
        WHERE name ILIKE $1
        ORDER BY name
        LIMIT $2
      `

      const categoriesResult = await db.query(categoriesQuery, [searchTerm, limit])
      results.categories = categoriesResult.rows
    }

    // Search sellers
    if (type === "all" || type === "sellers") {
      const sellersQuery = `
        SELECT 
          id,
          name,
          location,
          avatar_url as "avatarUrl",
          rating,
          'seller' as type
        FROM users
        WHERE 
          role = 'seller' AND
          (name ILIKE $1 OR location ILIKE $1)
        ORDER BY rating DESC
        LIMIT $2
      `

      const sellersResult = await db.query(sellersQuery, [searchTerm, limit])
      results.sellers = sellersResult.rows
    }

    return NextResponse.json({
      query,
      results,
    })
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
