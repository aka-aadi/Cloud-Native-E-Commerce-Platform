"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Star, ShoppingCart, Grid, List, MapPin, Clock, Heart, Loader2, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Header } from "@/components/header"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  rating: number
  reviews: number
  category: string
  condition: string
  seller: string
  location: string
  postedDate: string
  badge?: string
  description: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 300000])
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        } else {
          // Fallback data for demo
          setProducts([
            {
              id: "1",
              name: "Yamaha FG830 Acoustic Guitar",
              price: 25000,
              originalPrice: 30000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Yamaha+Guitar",
              rating: 4.8,
              reviews: 124,
              category: "Guitars",
              condition: "Excellent",
              seller: "MusicStore Delhi",
              location: "New Delhi, India",
              postedDate: "2 days ago",
              badge: "Hot Deal",
              description: "Beautiful acoustic guitar in excellent condition",
            },
            {
              id: "2",
              name: "Roland TD-17KVX Electronic Drums",
              price: 85000,
              originalPrice: 95000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Roland+Drums",
              rating: 4.9,
              reviews: 67,
              category: "Drums",
              condition: "Like New",
              seller: "DrumWorld Mumbai",
              location: "Mumbai, India",
              postedDate: "1 day ago",
              badge: "New Listing",
              description: "Professional electronic drum kit with mesh heads",
            },
            {
              id: "3",
              name: "Casio Privia PX-160 Digital Piano",
              price: 45000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Casio+Piano",
              rating: 4.7,
              reviews: 89,
              category: "Keyboards",
              condition: "Very Good",
              seller: "KeyboardKing Bangalore",
              location: "Bangalore, India",
              postedDate: "3 days ago",
              description: "88-key weighted digital piano with great sound",
            },
            {
              id: "4",
              name: "Shure SM58 Dynamic Microphone",
              price: 8500,
              originalPrice: 10000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Shure+SM58",
              rating: 4.9,
              reviews: 234,
              category: "Audio Gear",
              condition: "Excellent",
              seller: "AudioPro Chennai",
              location: "Chennai, India",
              postedDate: "5 days ago",
              badge: "Best Seller",
              description: "Industry standard vocal microphone",
            },
            {
              id: "5",
              name: "Tabla Set - Professional",
              price: 15000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Tabla+Set",
              rating: 4.6,
              reviews: 45,
              category: "Traditional",
              condition: "New",
              seller: "Classical Instruments Kolkata",
              location: "Kolkata, India",
              postedDate: "1 week ago",
              badge: "Traditional",
              description: "Handcrafted tabla set with premium quality",
            },
            {
              id: "6",
              name: "Sitar - Concert Quality",
              price: 35000,
              imageUrl: "/placeholder.svg?height=300&width=300&text=Sitar",
              rating: 4.8,
              reviews: 23,
              category: "Traditional",
              condition: "Excellent",
              seller: "Heritage Music Varanasi",
              location: "Varanasi, India",
              postedDate: "4 days ago",
              badge: "Premium",
              description: "Concert quality sitar with beautiful tone",
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesCondition =
      selectedCondition === "all" || product.condition.toLowerCase() === selectedCondition.toLowerCase()
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "oldest":
        return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()
      default: // newest
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    }
  })

  const addToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const savedCart = localStorage.getItem("legato-cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
    cart.push(product)
    localStorage.setItem("legato-cart", JSON.stringify(cart))

    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event("cartUpdated"))

    toast.success("Added to cart!")
  }

  const addToWishlist = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const savedWishlist = localStorage.getItem("legato-wishlist")
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    const exists = wishlist.find((item: Product) => item.id === product.id)
    if (!exists) {
      wishlist.push(product)
      localStorage.setItem("legato-wishlist", JSON.stringify(wishlist))
      toast.success("Added to wishlist!")
    } else {
      toast.info("Already in wishlist")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedCondition("all")
    setPriceRange([0, 300000])
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            placeholder="Search instruments, sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/20">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="guitars">Guitars</SelectItem>
            <SelectItem value="keyboards">Keyboards</SelectItem>
            <SelectItem value="drums">Drums</SelectItem>
            <SelectItem value="traditional">Traditional</SelectItem>
            <SelectItem value="audio gear">Audio Gear</SelectItem>
            <SelectItem value="strings">Strings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">Condition</label>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/20">
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="like new">Like New</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="very good">Very Good</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">
          Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
        </label>
        <Slider value={priceRange} onValueChange={setPriceRange} max={300000} step={5000} className="mt-2" />
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
      >
        Clear All Filters
      </Button>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-white mx-auto" />
            <motion.div
              className="absolute inset-0 h-16 w-16 border-2 border-white/20 rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
          <motion.p
            className="mt-6 text-xl text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading Marketplace...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <motion.div
            className="hidden lg:block lg:w-80 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </motion.div>

          {/* Products */}
          <div className="flex-1">
            {/* Mobile Search Bar */}
            <motion.div
              className="lg:hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                <Input
                  placeholder="Search instruments, sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Toolbar */}
            <motion.div
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Legato Marketplace</h1>
                <p className="text-white/70">{sortedProducts.length} instruments found</p>
              </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-black border-white/20 text-white">
                    <SheetHeader>
                      <SheetTitle className="text-white">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-white/20 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none bg-white/10 hover:bg-white/20"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none bg-white/10 hover:bg-white/20"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Active Filters Display */}
            {(searchTerm ||
              selectedCategory !== "all" ||
              selectedCondition !== "all" ||
              priceRange[0] > 0 ||
              priceRange[1] < 300000) && (
              <motion.div
                className="mb-6 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {searchTerm && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCondition !== "all" && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    Condition: {selectedCondition}
                    <button onClick={() => setSelectedCondition("all")} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 300000) && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    <button onClick={() => setPriceRange([0, 300000])} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Clear All
                </Button>
              </motion.div>
            )}

            {/* Product Grid */}
            <motion.div
              className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {sortedProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeInUp} layout exit={{ opacity: 0, scale: 0.8 }}>
                    <Link href={`/product/${product.id}`}>
                      <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm overflow-hidden cursor-pointer">
                        <CardHeader className="p-0">
                          <div className="relative overflow-hidden">
                            <motion.img
                              src={product.imageUrl}
                              alt={product.name}
                              className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                                viewMode === "grid" ? "h-48" : "h-32"
                              }`}
                              whileHover={{ scale: 1.1 }}
                            />
                            {product.badge && (
                              <Badge className="absolute top-3 left-3 bg-white text-black font-semibold">
                                {product.badge}
                              </Badge>
                            )}
                            <Badge className="absolute top-3 right-3 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                              {product.condition}
                            </Badge>
                            <motion.button
                              className="absolute bottom-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => addToWishlist(product, e)}
                            >
                              <Heart className="h-4 w-4 text-white" />
                            </motion.button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className={viewMode === "list" ? "flex items-start justify-between" : ""}>
                            <div className={viewMode === "list" ? "flex-1" : ""}>
                              <CardTitle className="text-white mb-2 line-clamp-2 group-hover:text-white/90">
                                {product.name}
                              </CardTitle>
                              <div className="flex items-center text-sm text-white/60 mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {product.location}
                                <Clock className="h-3 w-3 ml-3 mr-1" />
                                {product.postedDate}
                              </div>
                              <p className="text-sm text-white/60 mb-2">Sold by: {product.seller}</p>
                              <div className="flex items-center mb-3">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm text-white/80 ml-1">{product.rating}</span>
                                  <span className="text-sm text-white/50 ml-1">({product.reviews})</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-white/50 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {viewMode === "list" && (
                              <div className="ml-6 flex flex-col space-y-2">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <Button
                                    className="bg-white text-black hover:bg-gray-200 font-semibold"
                                    onClick={(e) => addToCart(product, e)}
                                  >
                                    Add to Cart
                                  </Button>
                                </motion.div>
                                <Button
                                  variant="outline"
                                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                                >
                                  Contact Seller
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        {viewMode === "grid" && (
                          <CardFooter className="p-6 pt-0 space-y-2">
                            <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
                                onClick={(e) => addToCart(product, e)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </motion.div>
                            <Button
                              variant="outline"
                              className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                            >
                              Contact Seller
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {sortedProducts.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold text-white mb-2">No instruments found</h3>
                <p className="text-white/60 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={clearFilters} className="bg-white text-black hover:bg-gray-200">
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
