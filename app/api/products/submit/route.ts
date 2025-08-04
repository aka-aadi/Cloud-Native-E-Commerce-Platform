import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      brand,
      price,
      originalPrice,
      condition,
      description,
      specifications,
      features,
      images,
      shippingInfo,
      warranty,
      returnPolicy,
      contactName,
      contactMethod,
      contactDetails,
      inStock,
      location,
      categoryId,
      sellerId, // Assuming sellerId is passed from authenticated user
    } = body

    // Basic validation
    if (!name || !price || !description || !categoryId || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const productId = uuidv4()
    const parsedPrice = Math.round(Number.parseFloat(price) * 100) // Store price in cents
    const parsedOriginalPrice = originalPrice ? Math.round(Number.parseFloat(originalPrice) * 100) : null

    const insertQuery = `
      INSERT INTO products (
        id,
        name,
        brand,
        price,
        original_price,
        condition,
        description,
        specifications,
        features,
        images,
        shipping_info,
        warranty,
        return_policy,
        contact_name,
        contact_method,
        contact_details,
        in_stock,
        location,
        category_id,
        seller_id,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW())
      RETURNING id
    `

    const values = [
      productId,
      name,
      brand,
      parsedPrice,
      parsedOriginalPrice,
      condition,
      description,
      JSON.stringify(specifications),
      JSON.stringify(features),
      JSON.stringify(images),
      JSON.stringify(shippingInfo),
      warranty,
      returnPolicy,
      contactName,
      contactMethod,
      contactDetails,
      inStock,
      location,
      categoryId,
      sellerId,
      "pending", // New products are pending approval
    ]

    const result = await db.query(insertQuery, values)

    // Log the submission for admin review
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, data, created_at) 
       VALUES ('new_product_submission', $1, $2, $3, NOW())`,
      [
        "New Product Submitted",
        `A new product "${name}" has been submitted for review.`,
        JSON.stringify({ productId: productId, sellerId: sellerId }),
      ],
    )

    return NextResponse.json({
      success: true,
      productId: result.rows[0].id,
      message: "Product submitted successfully for review!",
    })
  } catch (error) {
    console.error("Error submitting product:", error)
    return NextResponse.json({ error: "Failed to submit product" }, { status: 500 })
  }
}
