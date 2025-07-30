import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    const [usersResult, productsResult, ordersResult, reviewsResult] = await Promise.all([
      client.query("SELECT COUNT(*) as count FROM users WHERE status = $1", ["active"]),
      client.query("SELECT COUNT(*) as count FROM products WHERE status = $1", ["approved"]),
      client.query("SELECT COUNT(*) as count FROM orders WHERE status IN ($1, $2, $3)", [
        "confirmed",
        "shipped",
        "delivered",
      ]),
      client.query("SELECT AVG(rating) as avg_rating FROM reviews"),
    ])

    client.release()

    const userCount = Number.parseInt(usersResult.rows[0].count)
    const productCount = Number.parseInt(productsResult.rows[0].count)
    const orderCount = Number.parseInt(ordersResult.rows[0].count)
    const avgRating = Number.parseFloat(reviewsResult.rows[0].avg_rating) || 4.8

    const stats = [
      {
        label: "Active Musicians",
        value: userCount >= 100000 ? `${(userCount / 100000).toFixed(1)}L+` : `${(userCount / 1000).toFixed(1)}K+`,
        icon: "Users",
        change: "+12.5%",
      },
      {
        label: "Instruments Sold",
        value: orderCount >= 100000 ? `${(orderCount / 100000).toFixed(1)}L+` : `${(orderCount / 1000).toFixed(1)}K+`,
        icon: "Award",
        change: "+18.3%",
      },
      {
        label: "Average Rating",
        value: `${avgRating.toFixed(1)}★`,
        icon: "Star",
        change: "+0.2%",
      },
      {
        label: "Cities Served",
        value: "150+",
        icon: "MapPin",
        change: "+5.8%",
      },
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
