import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { reason } = body

    // Update product status to rejected
    const updateQuery = `
      UPDATE products 
      SET status = 'rejected', rejected_at = NOW(), rejection_reason = $2
      WHERE id = $1
      RETURNING name, contact_name, contact_details
    `

    const result = await db.query(updateQuery, [id, reason || "No reason provided"])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = result.rows[0]

    // Log the rejection
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, data, created_at) 
       VALUES ('product_rejected', $1, $2, $3, NOW())`,
      [
        "Product Rejected",
        `Product "${product.name}" has been rejected`,
        JSON.stringify({ productId: id, seller: product.contact_name, reason }),
      ],
    )

    // TODO: Send notification to seller with rejection reason
    // This would typically send an email or SMS to the seller

    return NextResponse.json({
      success: true,
      message: "Product rejected successfully",
    })
  } catch (error) {
    console.error("Error rejecting product:", error)
    return NextResponse.json({ error: "Failed to reject product" }, { status: 500 })
  }
}
