import { NextResponse } from "next/server"
import { Pool } from "pg"

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function GET() {
  try {
    // Check database connection
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()

    // Check environment variables
    const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "AWS_REGION"]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: {
        status: "connected",
        timestamp: result.rows[0].now,
      },
      services: {
        database: "operational",
        redis: process.env.REDIS_URL ? "operational" : "not_configured",
        s3: process.env.S3_BUCKET_NAME ? "operational" : "not_configured",
      },
      configuration: {
        missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : null,
        region: process.env.AWS_REGION || "not_set",
      },
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    console.error("Health check failed:", error)

    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Connection failed",
      },
    }

    return NextResponse.json(errorStatus, { status: 503 })
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
