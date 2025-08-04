import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Create a connection pool
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
// })

export async function GET() {
  try {
    // Attempt to connect to the database to check its health
    const client = await pool.connect()
    await client.query("SELECT 1") // Simple query to check connection
    client.release()
    return NextResponse.json({ status: "ok", database: "connected" })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({ status: "error", database: "disconnected", message: error.message }, { status: 500 })
  }
}

export async function HEAD() {
  // Simple health check for load balancers
  try {
    const client = await pool.connect()
    await client.query("SELECT 1")
    client.release()
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
