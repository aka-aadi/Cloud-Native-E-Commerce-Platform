import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price as "originalPrice",
        p.condition,
        p.image_url as "imageUrl",
        p.rating,
        p.review_count as "reviews",
        p.created_at as "postedDate",
        c.name as category,
        u.name as seller,
        u.location,
        p.featured,
        CASE 
          WHEN p.featured = true THEN 'Featured'
          WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 'New Listing'
          WHEN p.original_price IS NOT NULL THEN 'Sale'
          ELSE 'Popular'
        END as badge
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active' 
        AND (p.featured = true OR p.rating >= 4.5)
      ORDER BY p.featured DESC, p.rating DESC, p.created_at DESC
      LIMIT 8
    `

    const result = await db.query(query)

    const products = result.rows.map((row) => ({
      ...row,
      postedDate: new Date(row.postedDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching featured products:", error)

    // Fallback data for development
    const fallbackProducts = [
      {
        id: "1",
        name: "Yamaha F310 Acoustic Guitar",
        price: 12999,
        originalPrice: 15999,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Yamaha+Guitar",
        rating: 4.8,
        reviews: 324,
        seller: "Mumbai Music Store",
        condition: "New",
        location: "Mumbai, Maharashtra",
        featured: true,
        category: "Guitars",
        postedDate: "2 days ago",
        badge: "Featured",
      },
      {
        id: "2",
        name: "Casio CT-X700 Keyboard",
        price: 18999,
        originalPrice: 22999,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Casio+Keyboard",
        rating: 4.7,
        reviews: 189,
        seller: "Delhi Instruments",
        condition: "New",
        location: "New Delhi, Delhi",
        featured: true,
        category: "Keyboards",
        postedDate: "1 day ago",
        badge: "Sale",
      },
      {
        id: "3",
        name: "Audio-Technica ATR2100x Microphone",
        price: 8999,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Audio+Technica+Mic",
        rating: 4.9,
        reviews: 156,
        seller: "Bangalore Audio Hub",
        condition: "Like New",
        location: "Bangalore, Karnataka",
        featured: true,
        category: "Audio Gear",
        postedDate: "3 days ago",
        badge: "Popular",
      },
      {
        id: "4",
        name: "Pearl Roadshow Drum Kit",
        price: 45999,
        originalPrice: 52999,
        imageUrl: "/placeholder.svg?height=300&width=300&text=Pearl+Drums",
        rating: 4.6,
        reviews: 89,
        seller: "Chennai Drums",
        condition: "Excellent",
        location: "Chennai, Tamil Nadu",
        featured: true,
        category: "Drums",
        postedDate: "5 days ago",
        badge: "Featured",
      },
    ]

    return NextResponse.json(fallbackProducts)
  }
}
