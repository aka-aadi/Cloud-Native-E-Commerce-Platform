import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const totalProductsResult = await client.query("SELECT COUNT(*) FROM products WHERE status = 'approved'")
    const totalProducts = Number.parseInt(totalProductsResult.rows[0].count)

    const totalCategoriesResult = await client.query("SELECT COUNT(*) FROM categories")
    const totalCategories = Number.parseInt(totalCategoriesResult.rows[0].count)

    const totalSellersResult = await client.query(
      "SELECT COUNT(DISTINCT seller_id) FROM products WHERE status = 'approved'",
    )
    const totalSellers = Number.parseInt(totalSellersResult.rows[0].count)

    client.release()

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalSellers,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
