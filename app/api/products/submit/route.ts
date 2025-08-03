import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      brand,
      category,
      condition,
      description,
      price,
      originalPrice,
      location,
      negotiable,
      shipping,
      specifications,
      features,
      images,
      warranty,
      returnPolicy,
      contactName,
      contactMethod,
      contactDetails,
      inStock,
    } = body

    // Insert product into database with pending status
    const query = `
      INSERT INTO products (
        name, brand, description, price, original_price, condition, 
        category_id, location, negotiable, shipping_info, specifications, 
        features, images, warranty, return_policy, contact_name, 
        contact_method, contact_details, in_stock, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        (SELECT id FROM categories WHERE LOWER(name) = LOWER($7) LIMIT 1),
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'pending', NOW()
      )
      RETURNING id, name, status
    `

    const result = await db.query(query, [
      title,
      brand,
      description,
      price * 100, // Convert to paise
      originalPrice ? originalPrice * 100 : null,
      condition,
      category,
      location,
      negotiable,
      JSON.stringify(shipping),
      JSON.stringify(specifications),
      JSON.stringify(features),
      JSON.stringify(images),
      warranty || null,
      returnPolicy || null,
      contactName,
      contactMethod,
      contactDetails,
      inStock,
    ])

    const product = result.rows[0]

    // Log the submission for admin review
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, data, created_at) 
       VALUES ('new_product', $1, $2, $3, NOW())`,
      [
        "New Product Submission",
        `New product "${title}" submitted for review`,
        JSON.stringify({ productId: product.id, seller: contactName }),
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Product submitted successfully for review",
      productId: product.id,
    })
  } catch (error) {
    console.error("Error submitting product:", error)
    return NextResponse.json({ error: "Failed to submit product" }, { status: 500 })
  }
}
