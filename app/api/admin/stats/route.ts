import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const client = await pool.connect()

    // Get current month stats
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const [revenueResult, listingsResult, usersResult, transactionsResult] = await Promise.all([
      client.query(
        `
        SELECT 
          COALESCE(SUM(total_amount), 0) as current_revenue,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders 
           WHERE EXTRACT(MONTH FROM created_at) = $1 
           AND EXTRACT(YEAR FROM created_at) = $2 
           AND payment_status = 'paid') as last_revenue
        FROM orders 
        WHERE EXTRACT(MONTH FROM created_at) = $3 
        AND EXTRACT(YEAR FROM created_at) = $4 
        AND payment_status = 'paid'
      `,
        [lastMonth, lastMonthYear, currentMonth, currentYear],
      ),

      client.query(
        `
        SELECT 
          COUNT(*) as current_listings,
          (SELECT COUNT(*) FROM products 
           WHERE EXTRACT(MONTH FROM created_at) = $1 
           AND EXTRACT(YEAR FROM created_at) = $2 
           AND status = 'approved') as last_listings
        FROM products 
        WHERE EXTRACT(MONTH FROM created_at) = $3 
        AND EXTRACT(YEAR FROM created_at) = $4 
        AND status = 'approved'
      `,
        [lastMonth, lastMonthYear, currentMonth, currentYear],
      ),

      client.query(
        `
        SELECT 
          COUNT(*) as current_users,
          (SELECT COUNT(*) FROM users 
           WHERE EXTRACT(MONTH FROM created_at) = $1 
           AND EXTRACT(YEAR FROM created_at) = $2) as last_users
        FROM users 
        WHERE EXTRACT(MONTH FROM created_at) = $3 
        AND EXTRACT(YEAR FROM created_at) = $4
      `,
        [lastMonth, lastMonthYear, currentMonth, currentYear],
      ),

      client.query(
        `
        SELECT 
          COUNT(*) as current_transactions,
          (SELECT COUNT(*) FROM orders 
           WHERE EXTRACT(MONTH FROM created_at) = $1 
           AND EXTRACT(YEAR FROM created_at) = $2 
           AND status IN ('confirmed', 'shipped', 'delivered')) as last_transactions
        FROM orders 
        WHERE EXTRACT(MONTH FROM created_at) = $3 
        AND EXTRACT(YEAR FROM created_at) = $4 
        AND status IN ('confirmed', 'shipped', 'delivered')
      `,
        [lastMonth, lastMonthYear, currentMonth, currentYear],
      ),
    ])

    // Get total counts
    const [totalRevenueResult, totalListingsResult, totalUsersResult, totalTransactionsResult] = await Promise.all([
      client.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = $1", ["paid"]),
      client.query("SELECT COUNT(*) as total FROM products WHERE status = $1", ["approved"]),
      client.query("SELECT COUNT(*) as total FROM users"),
      client.query("SELECT COUNT(*) as total FROM orders WHERE status IN ($1, $2, $3)", [
        "confirmed",
        "shipped",
        "delivered",
      ]),
    ])

    client.release()

    const currentRevenue = Number.parseFloat(revenueResult.rows[0].current_revenue)
    const lastRevenue = Number.parseFloat(revenueResult.rows[0].last_revenue)
    const revenueChange = lastRevenue > 0 ? (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1) : "0"

    const currentListings = Number.parseInt(listingsResult.rows[0].current_listings)
    const lastListings = Number.parseInt(listingsResult.rows[0].last_listings)
    const listingsChange = lastListings > 0 ? (((currentListings - lastListings) / lastListings) * 100).toFixed(1) : "0"

    const currentUsers = Number.parseInt(usersResult.rows[0].current_users)
    const lastUsers = Number.parseInt(usersResult.rows[0].last_users)
    const usersChange = lastUsers > 0 ? (((currentUsers - lastUsers) / lastUsers) * 100).toFixed(1) : "0"

    const currentTransactions = Number.parseInt(transactionsResult.rows[0].current_transactions)
    const lastTransactions = Number.parseInt(transactionsResult.rows[0].last_transactions)
    const transactionsChange =
      lastTransactions > 0 ? (((currentTransactions - lastTransactions) / lastTransactions) * 100).toFixed(1) : "0"

    const stats = {
      totalRevenue: Number.parseFloat(totalRevenueResult.rows[0].total),
      activeListings: Number.parseInt(totalListingsResult.rows[0].total),
      totalUsers: Number.parseInt(totalUsersResult.rows[0].total),
      transactions: Number.parseInt(totalTransactionsResult.rows[0].total),
      revenueChange: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      listingsChange: `${listingsChange >= 0 ? "+" : ""}${listingsChange}%`,
      usersChange: `${usersChange >= 0 ? "+" : ""}${usersChange}%`,
      transactionsChange: `${transactionsChange >= 0 ? "+" : ""}${transactionsChange}%`,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}
