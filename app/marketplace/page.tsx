"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Star, ShoppingCart, Grid, List, Music, MapPin, Clock } from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "Fender Player Stratocaster",
    price: 899.99,
    originalPrice: 1099.99,
    image: "/placeholder.svg?height=300&width=300&text=Fender+Strat",
    rating: 4.8,
    reviews: 247,
    category: "Guitars",
    condition: "Excellent",
    seller: "GuitarPro Mike",
    location: "Los Angeles, CA",
    postedDate: "2 days ago",
    badge: "Hot Deal",
  },
  {
    id: 2,
    name: "Roland TD-17KVX Electronic Drum Kit",
    price: 1299.99,
    originalPrice: 1599.99,
    image: "/placeholder.svg?height=300&width=300&text=Roland+Drums",
    rating: 4.9,
    reviews: 89,
    category: "Drums",
    condition: "Like New",
    seller: "DrummerDave",
    location: "Nashville, TN",
    postedDate: "1 day ago",
    badge: "New Listing",
  },
  {
    id: 3,
    name: "Yamaha P-125 Digital Piano",
    price: 649.99,
    originalPrice: 799.99,
    image: "/placeholder.svg?height=300&width=300&text=Yamaha+Piano",
    rating: 4.7,
    reviews: 156,
    category: "Keyboards",
    condition: "Good",
    seller: "KeyboardKing",
    location: "New York, NY",
    postedDate: "3 days ago",
    badge: "Popular",
  },
  {
    id: 4,
    name: "Shure SM58 Dynamic Microphone",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg?height=300&width=300&text=Shure+SM58",
    rating: 4.9,
    reviews: 423,
    category: "Audio Gear",
    condition: "Very Good",
    seller: "StudioGear Pro",
    location: "Austin, TX",
    postedDate: "5 days ago",
    badge: "Best Seller",
  },
  {
    id: 5,
    name: "Gibson Les Paul Standard",
    price: 2299.99,
    originalPrice: 2799.99,
    image: "/placeholder.svg?height=300&width=300&text=Gibson+Les+Paul",
    rating: 4.8,
    reviews: 67,
    category: "Guitars",
    condition: "Excellent",
    seller: "VintageAxes",
    location: "Chicago, IL",
    postedDate: "1 week ago",
    badge: "Premium",
  },
  {
    id: 6,
    name: "Focusrite Scarlett 2i2 Interface",
    price: 169.99,
    originalPrice: 199.99,
    image: "/placeholder.svg?height=300&width=300&text=Focusrite+2i2",
    rating: 4.6,
    reviews: 234,
    category: "Audio Gear",
    condition: "Like New",
    seller: "HomeStudio Hub",
    location: "Seattle, WA",
    postedDate: "4 days ago",
    badge: "Studio Pick",
  },
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesCondition = selectedCondition === "all" || product.condition === selectedCondition
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice
  })

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <Music className="h-6 w-6 mr-2 text-blue-400" />
              MusicMart
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
                      placeholder="Search instruments..."
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
                      <SelectItem value="Guitars">Guitars</SelectItem>
                      <SelectItem value="Keyboards">Keyboards</SelectItem>
                      <SelectItem value="Drums">Drums</SelectItem>
                      <SelectItem value="Audio Gear">Audio Gear</SelectItem>
                      <SelectItem value="Brass">Brass</SelectItem>
                      <SelectItem value="Strings">Strings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Condition</label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Like New">Like New</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Very Good">Very Good</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={3000} step={50} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Music Marketplace</h1>
                <p className="text-gray-400">{filteredProducts.length} instruments found</p>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
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
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">{product.condition}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className={viewMode === "list" ? "flex items-start justify-between" : ""}>
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <CardTitle className="text-white mb-2 line-clamp-2">{product.name}</CardTitle>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {product.location}
                          <Clock className="h-3 w-3 ml-3 mr-1" />
                          {product.postedDate}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">Sold by: {product.seller}</p>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-300 ml-1">{product.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      {viewMode === "list" && (
                        <div className="ml-4 flex flex-col space-y-2">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Seller</Button>
                          <Button
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                          >
                            Add to Watchlist
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {viewMode === "grid" && (
                    <CardFooter className="p-4 pt-0 space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Contact Seller</Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        Add to Watchlist
                      </Button>
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
