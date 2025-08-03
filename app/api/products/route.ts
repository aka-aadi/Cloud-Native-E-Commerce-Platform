import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price / 100 as price,
        p.original_price / 100 as "originalPrice",
        p.condition,
        p.images->0 as "imageUrl",
        p.rating,
        p.review_count as "reviews",
        p.created_at as "postedDate",
        p.location,
        c.name as category,
        p.contact_name as seller,
        CASE 
          WHEN p.featured = true THEN 'Featured'
          WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 'New Listing'
          WHEN p.original_price IS NOT NULL THEN 'Sale'
          ELSE NULL
        END as badge
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'approved'
    `

    const params: any[] = []
    let paramIndex = 1

    if (category && category !== "all") {
      query += ` AND c.slug = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (condition && condition !== "all") {
      query += ` AND LOWER(p.condition) = LOWER($${paramIndex})`
      params.push(condition)
      paramIndex++
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`
      params.push(Number.parseInt(minPrice) * 100) // Convert to paise
      paramIndex++
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`
      params.push(Number.parseInt(maxPrice) * 100) // Convert to paise
      paramIndex++
    }

    if (search) {
      query += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex} OR
        p.contact_name ILIKE $${paramIndex}
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await db.query(query, params)

    const products = result.rows.map((row) => ({
      ...row,
      postedDate: new Date(row.postedDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      imageUrl: row.imageUrl || "/placeholder.svg?height=300&width=300&text=No+Image",
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)

    // Fallback data for development
    const fallbackProducts = [
      {
        id: "1",
        name: "Yamaha FG830 Acoustic Guitar",
        price: 25000,
        originalPrice: 30000,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Yamaha+Guitar",
        rating: 4.8,
        reviews: 124,
        category: "Guitars",
        condition: "Excellent",
        seller: "MusicStore Delhi",
        location: "New Delhi, India",
        postedDate: "2 days ago",
        badge: "Hot Deal",
        description: "Beautiful acoustic guitar in excellent condition",
      },
      {
        id: "2",
        name: "Roland TD-17KVX Electronic Drums",
        price: 85000,
        originalPrice: 95000,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Roland+Drums",
        rating: 4.9,
        reviews: 67,
        category: "Drums",
        condition: "Like New",
        seller: "DrumWorld Mumbai",
        location: "Mumbai, India",
        postedDate: "1 day ago",
        badge: "New Listing",
        description: "Professional electronic drum kit with mesh heads",
      },
    ]

    return NextResponse.json(fallbackProducts)
  }
}
