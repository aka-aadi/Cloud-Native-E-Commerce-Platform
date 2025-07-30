import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        p.id,
        p.title as name,
        p.price,
        p.original_price,
        p.condition,
        p.state,
        p.city,
        p.views_count,
        p.likes_count,
        u.name as seller,
        c.name as category,
        pi.image_url,
        COALESCE(AVG(r.rating), 4.5) as rating,
        COUNT(r.id) as review_count
      FROM products p
      JOIN users u ON p.seller_id = u.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.status = 'approved' AND p.is_featured = true
      GROUP BY p.id, p.title, p.price, p.original_price, p.condition, p.state, p.city, 
               p.views_count, p.likes_count, u.name, c.name, pi.image_url
      ORDER BY p.created_at DESC
      LIMIT 8
    `)

    client.release()

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number.parseFloat(row.price),
      originalPrice: row.original_price ? Number.parseFloat(row.original_price) : null,
      condition: row.condition.charAt(0).toUpperCase() + row.condition.slice(1).replace("_", " "),
      location: `${row.city}, ${row.state}`,
      seller: row.seller,
      rating: Number.parseFloat(row.rating),
      reviews: Number.parseInt(row.review_count) || 0,
      imageUrl:
        row.image_url ||
        `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center`,
      featured: true,
      category: row.category,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
