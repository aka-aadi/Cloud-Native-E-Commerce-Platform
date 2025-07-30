import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Update product status to approved
    const updateQuery = `
      UPDATE products 
      SET status = 'approved', approved_at = NOW()
      WHERE id = $1
      RETURNING name, contact_name, contact_details
    `

    const result = await db.query(updateQuery, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = result.rows[0]

    // Log the approval
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, data, created_at) 
       VALUES ('product_approved', $1, $2, $3, NOW())`,
      [
        "Product Approved",
        `Product "${product.name}" has been approved and is now live`,
        JSON.stringify({ productId: id, seller: product.contact_name }),
      ],
    )

    // TODO: Send notification to seller
    // This would typically send an email or SMS to the seller

    return NextResponse.json({
      success: true,
      message: "Product approved successfully",
    })
  } catch (error) {
    console.error("Error approving product:", error)
    return NextResponse.json({ error: "Failed to approve product" }, { status: 500 })
  }
}
