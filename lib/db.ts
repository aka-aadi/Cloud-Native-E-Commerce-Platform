import { Pool } from "pg"
import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// SQLite database configuration for zero-cost deployment
const dbPath =
  process.env.NODE_ENV === "production" ? "/opt/legato/data/legato.db" : path.join(process.cwd(), "data", "legato.db")

let sqliteDb: Database.Database

export function getSQLiteDatabase() {
  if (!sqliteDb) {
    try {
      // Ensure data directory exists
      const fs = require("fs")
      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      sqliteDb = new Database(dbPath)

      // Enable WAL mode for better performance
      sqliteDb.pragma("journal_mode = WAL")
      sqliteDb.pragma("synchronous = NORMAL")
      sqliteDb.pragma("cache_size = 1000000")
      sqliteDb.pragma("foreign_keys = ON")

      // Initialize database schema
      initializeSchema()

      console.log("✅ SQLite database connected successfully")
    } catch (error) {
      console.error("❌ Database connection failed:", error)
      throw error
    }
  }
  return sqliteDb
}

function initializeSchema() {
  const db = getSQLiteDatabase()

  // Create tables if they don't exist
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      seller_id INTEGER,
      stock_quantity INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (seller_id) REFERENCES users(id)
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      shipping_address TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Cart table
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
  `)

  // Insert default data if tables are empty
  insertDefaultData()
}

function insertDefaultData() {
  const db = getSQLiteDatabase()

  // Check if we have any categories
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number }

  if (categoryCount.count === 0) {
    console.log("🌱 Seeding database with default data...")

    // Insert default categories
    const insertCategory = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
    const categories = [
      ["Guitars", "Acoustic and electric guitars"],
      ["Keyboards", "Pianos, synthesizers, and keyboards"],
      ["Drums", "Drum sets and percussion instruments"],
      ["Strings", "Violins, cellos, and other string instruments"],
      ["Brass", "Trumpets, trombones, and brass instruments"],
      ["Woodwinds", "Flutes, clarinets, and woodwind instruments"],
      ["Audio Equipment", "Amplifiers, microphones, and audio gear"],
      ["Accessories", "Cases, stands, and musical accessories"],
    ]

    categories.forEach(([name, description]) => {
      insertCategory.run(name, description)
    })

    // Insert admin user
    const adminPassword = bcrypt.hashSync("admin123", 10)
    const insertUser = db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    insertUser.run("admin@legato.com", adminPassword, "Admin User", "admin")

    // Insert sample products
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, category_id, image_url, status, stock_quantity, featured) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const products = [
      [
        "Acoustic Guitar Starter Pack",
        "Perfect for beginners with everything you need to start playing",
        299.99,
        1,
        "/placeholder.jpg",
        "approved",
        15,
        true,
      ],
      [
        "Electric Guitar - Stratocaster Style",
        "Classic electric guitar with versatile sound",
        599.99,
        1,
        "/placeholder.jpg",
        "approved",
        8,
        true,
      ],
      [
        "Digital Piano 88-Key",
        "Full-size weighted keys with authentic piano sound",
        899.99,
        2,
        "/placeholder.jpg",
        "approved",
        5,
        true,
      ],
      [
        "Professional Drum Set",
        "Complete 5-piece drum set for intermediate players",
        1299.99,
        3,
        "/placeholder.jpg",
        "approved",
        3,
        false,
      ],
      [
        "Violin 4/4 Full Size",
        "Handcrafted violin with bow and case included",
        449.99,
        4,
        "/placeholder.jpg",
        "approved",
        12,
        false,
      ],
      [
        "USB Audio Interface",
        "Professional 2-channel audio interface for recording",
        199.99,
        7,
        "/placeholder.jpg",
        "approved",
        20,
        false,
      ],
    ]

    products.forEach((product) => {
      insertProduct.run(...product)
    })

    console.log("✅ Database seeded with default data")
  }
}

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
  getSQLiteDatabase: getSQLiteDatabase,
}

// Test connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
  process.exit(-1)
})

// Helper functions for database operations
export const dbHelpers = {
  // User operations
  createUser: (email: string, passwordHash: string, name: string, role = "user") => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    return stmt.run(email, passwordHash, name, role)
  },

  getUserByEmail: (email: string) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?")
    return stmt.get(email)
  },

  getUserById: (id: number) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?")
    return stmt.get(id)
  },

  // Product operations
  getAllProducts: (limit = 50, offset = 0) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.seller_id = u.id 
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `)
    return stmt.all(limit, offset)
  },

  getFeaturedProducts: (limit = 6) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'approved' AND p.featured = TRUE
      ORDER BY p.created_at DESC 
      LIMIT ?
    `)
    return stmt.all(limit)
  },

  getProductById: (id: number) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.seller_id = u.id 
      WHERE p.id = ?
    `)
    return stmt.get(id)
  },

  searchProducts: (query: string, limit = 20) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'approved' AND (
        p.name LIKE ? OR 
        p.description LIKE ? OR 
        c.name LIKE ?
      )
      ORDER BY p.created_at DESC 
      LIMIT ?
    `)
    const searchTerm = `%${query}%`
    return stmt.all(searchTerm, searchTerm, searchTerm, limit)
  },

  // Category operations
  getAllCategories: () => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("SELECT * FROM categories ORDER BY name")
    return stmt.all()
  },

  // Admin operations
  getPendingProducts: () => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.seller_id = u.id 
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `)
    return stmt.all()
  },

  approveProduct: (id: number) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    return stmt.run("approved", id)
  },

  rejectProduct: (id: number) => {
    const db = getSQLiteDatabase()
    const stmt = db.prepare("UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    return stmt.run("rejected", id)
  },

  // Stats operations
  getStats: () => {
    const db = getSQLiteDatabase()
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE status = "approved"').get() as {
      count: number
    }
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get() as { count: number }
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number }
    const totalRevenue = db
      .prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "cancelled"')
      .get() as { total: number }

    return {
      totalProducts: totalProducts.count,
      totalUsers: totalUsers.count,
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.total,
    }
  },
}

// Initialize database on import
if (process.env.NODE_ENV !== "test") {
  getSQLiteDatabase()
}

export default getSQLiteDatabase
