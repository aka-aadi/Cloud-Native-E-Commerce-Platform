import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const result = await client.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE payment_status = 'paid' 
      AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
      ORDER BY EXTRACT(MONTH FROM created_at)
    `)

    client.release()

    const revenueData = result.rows.map((row) => ({
      month: row.month,
      revenue: Number.parseFloat(row.revenue),
      orders: Number.parseInt(row.orders),
    }))

    // If no data, return sample data for demo
    if (revenueData.length === 0) {
      return NextResponse.json([
        { month: "Jul", revenue: 185000, orders: 120 },
        { month: "Aug", revenue: 220000, orders: 145 },
        { month: "Sep", revenue: 195000, orders: 135 },
        { month: "Oct", revenue: 275000, orders: 180 },
        { month: "Nov", revenue: 310000, orders: 200 },
        { month: "Dec", revenue: 285000, orders: 175 },
      ])
    }

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
