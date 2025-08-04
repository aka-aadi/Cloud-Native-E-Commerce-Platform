import { Pool } from "pg"
import { neon } from "@neondatabase/serverless"

// Initialize a PostgreSQL connection pool using the 'pg' library.
// This is typically used for applications that manage a pool of connections.
// It expects a connection string from the environment variable PG_CONNECTION_STRING.
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
})

// Initialize a Neon database client using the '@neondatabase/serverless' library.
// This is optimized for serverless environments and connects directly to Neon.
// It expects the database URL from the environment variable DATABASE_URL.
// The '!' asserts that DATABASE_URL will be defined at runtime.
const db = neon(process.env.DATABASE_URL!)

// Export both the 'pool' and 'db' instances for use in different parts of the application.
// 'pool' can be used for general database operations requiring a connection pool.
// 'db' can be used for serverless-optimized database interactions with Neon.
export { pool, db }
