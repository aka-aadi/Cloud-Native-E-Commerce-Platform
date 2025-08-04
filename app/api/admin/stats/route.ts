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
        `SELECT COALESCE(SUM(total_amount), 0) as current_revenue FROM orders WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND payment_status = 'paid'`,
        [currentMonth, currentYear],
      ),
      client.query(
        `SELECT COUNT(*) as current_listings FROM products WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status = 'approved'`,
        [currentMonth, currentYear],
      ),
      client.query(
        `SELECT COUNT(*) as current_users FROM users WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [currentMonth, currentYear],
      ),
      client.query(
        `SELECT COUNT(*) as current_transactions FROM orders WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status IN ('confirmed', 'shipped', 'delivered')`,
        [currentMonth, currentYear],
      ),
    ])

    // Get total counts
    const totalRevenueResult = await client.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE payment_status = 'paid'",
    )
    const totalRevenue = Number.parseFloat(totalRevenueResult.rows[0].total_revenue)

    const totalOrdersResult = await client.query("SELECT COUNT(*) as total_orders FROM orders")
    const totalOrders = Number.parseInt(totalOrdersResult.rows[0].total_orders)

    const totalProductsResult = await client.query("SELECT COUNT(*) as total_products FROM products")
    const totalProducts = Number.parseInt(totalProductsResult.rows[0].total_products)

    const totalUsersResult = await client.query("SELECT COUNT(*) as total_users FROM users")
    const totalUsers = Number.parseInt(totalUsersResult.rows[0].total_users)

    client.release()

    const currentRevenue = Number.parseFloat(revenueResult.rows[0].current_revenue)
    const lastRevenueResult = await client.query(
      `SELECT COALESCE(SUM(total_amount), 0) as last_revenue FROM orders WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND payment_status = 'paid'`,
      [lastMonth, lastMonthYear],
    )
    const lastRevenue = Number.parseFloat(lastRevenueResult.rows[0].last_revenue)
    const revenueChange = lastRevenue > 0 ? (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1) : "0"

    const currentListings = Number.parseInt(listingsResult.rows[0].current_listings)
    const lastListingsResult = await client.query(
      `SELECT COUNT(*) as last_listings FROM products WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status = 'approved'`,
      [lastMonth, lastMonthYear],
    )
    const lastListings = Number.parseInt(lastListingsResult.rows[0].last_listings)
    const listingsChange = lastListings > 0 ? (((currentListings - lastListings) / lastListings) * 100).toFixed(1) : "0"

    const currentUsers = Number.parseInt(usersResult.rows[0].current_users)
    const lastUsersResult = await client.query(
      `SELECT COUNT(*) as last_users FROM users WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [lastMonth, lastMonthYear],
    )
    const lastUsers = Number.parseInt(lastUsersResult.rows[0].last_users)
    const usersChange = lastUsers > 0 ? (((currentUsers - lastUsers) / lastUsers) * 100).toFixed(1) : "0"

    const currentTransactions = Number.parseInt(transactionsResult.rows[0].current_transactions)
    const lastTransactionsResult = await client.query(
      `SELECT COUNT(*) as last_transactions FROM orders WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status IN ('confirmed', 'shipped', 'delivered')`,
      [lastMonth, lastMonthYear],
    )
    const lastTransactions = Number.parseInt(lastTransactionsResult.rows[0].last_transactions)
    const transactionsChange =
      lastTransactions > 0 ? (((currentTransactions - lastTransactions) / lastTransactions) * 100).toFixed(1) : "0"

    const stats = {
      totalRevenue,
      activeListings: totalProducts,
      totalUsers,
      transactions: totalOrders,
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
