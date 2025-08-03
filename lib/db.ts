import Database from "better-sqlite3"
import { join } from "path"
import bcrypt from "bcryptjs" // Import bcryptjs at the top

// SQLite database configuration for zero-cost deployment
const dbPath = process.env.DATABASE_PATH || join(process.cwd(), "data", "legato.db")

const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL")
db.pragma("synchronous = NORMAL")
db.pragma("cache_size = 1000000")
db.pragma("foreign_keys = ON")

console.log("✅ SQLite database connected successfully")

// Initialize database schema
function initDatabase() {
  console.log("🗄️ Initializing SQLite database...")

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      status TEXT DEFAULT 'approved',
      stock_quantity INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)

  // Insert sample data (only if tables are empty)
  const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get().count
  if (categoryCount === 0) {
    console.log("🌱 Seeding database with sample data...")

    // Insert categories
    const insertCategory = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
    insertCategory.run("Guitars", "Acoustic and electric guitars")
    insertCategory.run("Keyboards", "Pianos and keyboards")
    insertCategory.run("Drums", "Drum sets and percussion")

    // Insert admin user
    // Note: In a real app, handle password hashing securely on the server.
    // For this demo, we'll use a simple hash.
    const adminPassword = bcrypt.hashSync("admin123", 10)
    const insertUser = db.prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    insertUser.run("admin@legato.com", adminPassword, "Admin User", "admin")

    // Insert sample products
    const insertProduct = db.prepare(
      "INSERT INTO products (name, description, price, category_id, featured, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)",
    )
    insertProduct.run("Acoustic Guitar Starter Pack", "Perfect for beginners", 299.99, 1, true, 15)
    insertProduct.run("Electric Guitar Pro", "Professional electric guitar", 599.99, 1, true, 8)
    insertProduct.run("Digital Piano 88-Key", "Full-size weighted keys", 899.99, 2, true, 5)
    insertProduct.run("Professional Drum Set", "5-piece drum set", 1299.99, 3, false, 3)

    console.log("✅ Database seeded successfully")
  }
}

// Database query functions
export const dbQuery = {
  // Users
  createUser: db.prepare(`
    INSERT INTO users (email, password_hash, name, role) 
    VALUES (?, ?, ?, ?)
  `),

  getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

  getAllUsers: db.prepare(`
    SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC
  `),

  // Categories
  getAllCategories: db.prepare(`
    SELECT * FROM categories ORDER BY name
  `),

  createCategory: db.prepare(`
    INSERT INTO categories (name, description) VALUES (?, ?)
  `),

  // Products
  getAllProducts: db.prepare(`
    SELECT p.*, c.name as category_name, u.name as seller_name
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN users u ON p.seller_id = u.id
    ORDER BY p.created_at DESC
  `),

  getProductById: db.prepare(`
    SELECT p.*, c.name as category_name, u.name as seller_name
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE p.id = ?
  `),

  getFeaturedProducts: db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.featured = 1 AND p.status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT 6
  `),

  getPendingProducts: db.prepare(`
    SELECT p.*, c.name as category_name, u.name as seller_name
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at DESC
  `),

  createProduct: db.prepare(`
    INSERT INTO products (name, description, price, category_id, image_url, seller_id, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  updateProductStatus: db.prepare(`
    UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `),

  // Orders
  createOrder: db.prepare(`
    INSERT INTO orders (user_id, total_amount, status, shipping_address) 
    VALUES (?, ?, ?, ?)
  `),

  createOrderItem: db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price) 
    VALUES (?, ?, ?, ?)
  `),

  // Stats
  getStats: db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT COUNT(*) FROM categories) as total_categories,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue
  `),
}

// Export functions for database operations
export const getProducts = () => db.prepare("SELECT * FROM products").all()
export const getCategories = () => db.prepare("SELECT * FROM categories").all()
export const getProductById = (id: number) => db.prepare("SELECT * FROM products WHERE id = ?").get(id)
export const getUserByEmail = (email: string) => db.prepare("SELECT * FROM users WHERE email = ?").get(email)
export const createUser = (email: string, passwordHash: string, name: string, role = "user") => {
  return db
    .prepare("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)")
    .run(email, passwordHash, name, role)
}
export const addProduct = (
  name: string,
  description: string,
  price: number,
  category_id: number,
  image_url: string,
  stock_quantity: number,
  featured: boolean,
) => {
  return db
    .prepare(
      "INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(name, description, price, category_id, image_url, stock_quantity, featured)
}
export const updateProductStatus = (id: number, status: string) => {
  return db.prepare("UPDATE products SET status = ? WHERE id = ?").run(status, id)
}
export const getRecentListings = () => db.prepare("SELECT * FROM products ORDER BY created_at DESC LIMIT 5").all()
export const getTotalRevenue = () =>
  db.prepare('SELECT SUM(price * stock_quantity) as totalRevenue FROM products WHERE status = "approved"').get()
    .totalRevenue
export const getStats = () => {
  const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get().count
  const totalCategories = db.prepare("SELECT COUNT(*) as count FROM categories").get().count
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count
  return { totalProducts, totalCategories, totalUsers }
}

// Ensure database is initialized on module load
initDatabase()
