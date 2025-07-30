"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Star, ShoppingCart, Grid, List } from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 1247,
    category: "Electronics",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch Ultra",
    price: 449.99,
    originalPrice: 599.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 892,
    category: "Electronics",
    badge: "New",
  },
  {
    id: 3,
    name: "Gaming Laptop Elite",
    price: 1299.99,
    originalPrice: 1599.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 634,
    category: "Electronics",
    badge: "Hot Deal",
  },
  {
    id: 4,
    name: "Designer Jacket",
    price: 199.99,
    originalPrice: 299.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 423,
    category: "Fashion",
    badge: "Limited",
  },
  {
    id: 5,
    name: "Running Shoes Pro",
    price: 159.99,
    originalPrice: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 789,
    category: "Sports",
    badge: "Popular",
  },
  {
    id: 6,
    name: "Coffee Maker Deluxe",
    price: 249.99,
    originalPrice: 329.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 567,
    category: "Home & Garden",
    badge: "Sale",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState("grid")

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              CloudMart
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Link href="/auth">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
                <p className="text-gray-400">{filteredProducts.length} products found</p>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-gray-700 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition-all duration-300 group"
                >
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === "grid" ? "h-48" : "h-32"
                        }`}
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">{product.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className={viewMode === "list" ? "flex items-center justify-between" : ""}>
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <CardTitle className="text-white mb-2 line-clamp-1">{product.name}</CardTitle>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-300 ml-1">{product.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">${product.price}</span>
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        </div>
                      </div>
                      {viewMode === "list" && (
                        <div className="ml-4">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add to Cart</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {viewMode === "grid" && (
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add to Cart</Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
