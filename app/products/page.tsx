"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  images: string[]
  condition: string
  location: string
  category: string
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "created_at_desc")

  const itemsPerPage = 10 // Hardcoded for now, could be a user setting

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)
      if (selectedCondition !== "all") params.append("condition", selectedCondition)
      if (sortBy) params.append("sortBy", sortBy)
      params.append("page", currentPage.toString())
      params.append("limit", itemsPerPage.toString())

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setProducts(data.products)
      setTotalProducts(data.totalProducts)
      setTotalPages(data.totalPages)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setCategories(data)
    } catch (e: any) {
      console.error("Failed to fetch categories:", e.message)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (selectedCondition !== "all") params.set("condition", selectedCondition)
    if (sortBy) params.set("sortBy", sortBy)
    params.set("page", currentPage.toString())
    router.push(`?${params.toString()}`, { scroll: false })

    fetchProducts()
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedCondition, sortBy, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    // The useEffect will trigger fetchProducts
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setMinPrice("")
    setMaxPrice("")
    setSelectedCondition("all")
    setSortBy("created_at_desc")
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Products</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <form onSubmit={handleSearch} className="col-span-full md:col-span-2 lg:col-span-1">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </form>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              setCurrentPage(1)
            }}
            className="w-1/2"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              setCurrentPage(1)
            }}
            className="w-1/2"
          />
        </div>
        <Select
          value={selectedCondition}
          onValueChange={(value) => {
            setSelectedCondition(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="refurbished">Refurbished</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at_desc">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A-Z</SelectItem>
            <SelectItem value="name_desc">Name: Z-A</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleClearFilters} variant="outline" className="col-span-full md:col-span-1 bg-transparent">
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2Icon className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No products found matching your criteria.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <Link
                  href={`/product/${product.id}`}
                  className="relative block h-48 w-full overflow-hidden rounded-t-lg"
                >
                  <Image
                    alt={product.name}
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    src={product.images[0] || "/placeholder.svg?height=200&width=200&query=product image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </Link>
                <CardContent className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/product/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Condition: {product.condition}</span>
                    <span>Location: {product.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) handlePageChange(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}
