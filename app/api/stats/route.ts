import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Users, Award, Star, MapPin } from "lucide-react"

export async function GET() {
  try {
    const queries = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM users WHERE active = true"),
      db.query("SELECT COUNT(*) as count FROM products WHERE status = 'sold'"),
      db.query("SELECT AVG(rating) as avg_rating FROM products WHERE rating > 0"),
      db.query("SELECT COUNT(DISTINCT location) as count FROM users WHERE location IS NOT NULL"),
    ])

    const [usersResult, soldResult, ratingResult, citiesResult] = queries

    const stats = [
      {
        label: "Active Musicians",
        value: `${Math.floor(Number.parseInt(usersResult.rows[0].count) / 1000)}K+`,
        icon: Users,
        change: "+12% this month",
      },
      {
        label: "Instruments Sold",
        value: `${Math.floor(Number.parseInt(soldResult.rows[0].count) / 1000)}K+`,
        icon: Award,
        change: "+8% this month",
      },
      {
        label: "Average Rating",
        value: `${Number.parseFloat(ratingResult.rows[0].avg_rating || 4.8).toFixed(1)}★`,
        icon: Star,
        change: "+0.2 this month",
      },
      {
        label: "Cities Served",
        value: `${citiesResult.rows[0].count}+`,
        icon: MapPin,
        change: "+5 new cities",
      },
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)

    // Fallback data for development
    const fallbackStats = [
      {
        label: "Active Musicians",
        value: "25K+",
        icon: Users,
        change: "+12% this month",
      },
      {
        label: "Instruments Sold",
        value: "52K+",
        icon: Award,
        change: "+8% this month",
      },
      {
        label: "Average Rating",
        value: "4.8★",
        icon: Star,
        change: "+0.2 this month",
      },
      {
        label: "Cities Served",
        value: "150+",
        icon: MapPin,
        change: "+5 new cities",
      },
    ]

    return NextResponse.json(fallbackStats)
  }
}
