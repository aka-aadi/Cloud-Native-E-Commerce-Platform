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
        p.condition,
        p.description,
        p.specifications,
        p.features,
        p.images,
        p.shipping_info as shipping,
        p.warranty,
        p.return_policy as "returnPolicy",
        p.contact_name as "contactName",
        p.contact_method as "contactMethod", 
        p.contact_details as "contactDetails",
        p.in_stock as "inStock",
        p.location,
        p.created_at as "submittedAt",
        p.status,
        c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `

    const result = await db.query(query)

    const products = result.rows.map((row) => ({
      ...row,
      specifications: typeof row.specifications === "string" ? JSON.parse(row.specifications) : row.specifications,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
      images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
      shipping: typeof row.shipping === "string" ? JSON.parse(row.shipping) : row.shipping,
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching pending products:", error)
    return NextResponse.json({ error: "Failed to fetch pending products" }, { status: 500 })
  }
}
