import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const condition = searchParams.get("condition")
    const sortBy = searchParams.get("sortBy")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        p.id,
        p.name,
        p.brand,
        p.price / 100 as price,
        p.original_price / 100 as "originalPrice",
        p.images,
        p.condition,
        p.location,
        c.name as category
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'approved'
    `
    const params = []
    let paramIndex = 1

    if (category) {
      query += ` AND c.name ILIKE $${paramIndex++}`
      params.push(`%${category}%`)
    }
    if (minPrice) {
      query += ` AND p.price >= $${paramIndex++} * 100`
      params.push(Number.parseFloat(minPrice))
    }
    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex++} * 100`
      params.push(Number.parseFloat(maxPrice))
    }
    if (condition) {
      query += ` AND p.condition ILIKE $${paramIndex++}`
      params.push(`%${condition}%`)
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    let orderBy = "p.created_at DESC"
    if (sortBy === "price_asc") {
      orderBy = "p.price ASC"
    } else if (sortBy === "price_desc") {
      orderBy = "p.price DESC"
    } else if (sortBy === "name_asc") {
      orderBy = "p.name ASC"
    } else if (sortBy === "name_desc") {
      orderBy = "p.name DESC"
    }

    query += ` ORDER BY ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    params.push(limit, offset)

    const result = await db.query(query, params)

    const products = result.rows.map((row) => ({
      ...row,
      images: typeof row.images === "string" ? JSON.parse(row.images) : row.images,
    }))

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*)
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'approved'
    `
    const countParams = []
    let countParamIndex = 1

    if (category) {
      countQuery += ` AND c.name ILIKE $${countParamIndex++}`
      countParams.push(`%${category}%`)
    }
    if (minPrice) {
      countQuery += ` AND p.price >= $${countParamIndex++} * 100`
      countParams.push(Number.parseFloat(minPrice))
    }
    if (maxPrice) {
      countQuery += ` AND p.price <= $${countParamIndex++} * 100`
      countParams.push(Number.parseFloat(maxPrice))
    }
    if (condition) {
      countQuery += ` AND p.condition ILIKE $${countParamIndex++}`
      countParams.push(`%${condition}%`)
    }
    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex} OR p.brand ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
    }

    const countResult = await db.query(countQuery, countParams)
    const totalProducts = Number.parseInt(countResult.rows[0].count)

    return NextResponse.json({
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
