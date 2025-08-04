"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Play,
  ArrowRight,
  Star,
  TrendingUp,
  Music,
  ShoppingBag,
  SearchIcon,
  ShoppingCartIcon,
  TagIcon,
} from "lucide-react"
import { Header } from "@/components/header"

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string
  count: number
}

interface FeaturedProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
  rating: number
  reviews: number
  badge?: string
}

interface Stats {
  totalProducts: number
  totalSellers: number
  totalCategories: number
  totalTransactions: number
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSellers: 0,
    totalCategories: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState({
    categories: true,
    featured: true,
    stats: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
        setLoading((prev) => ({ ...prev, categories: false }))

        // Fetch featured products
        const featuredResponse = await fetch("/api/products/featured")
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedProducts(featuredData)
        }
        setLoading((prev) => ({ ...prev, featured: false }))

        // Fetch stats
        const statsResponse = await fetch("/api/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
        setLoading((prev) => ({ ...prev, stats: false }))
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading({
          categories: false,
          featured: false,
          stats: false,
        })
      }
    }

    fetchData()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`
    }
  }

  // Sample data for development (will be replaced by API data)
  const sampleCategories: Category[] = [
    {
      id: "1",
      name: "Guitars",
      slug: "guitars",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Guitars",
      count: 245,
    },
    {
      id: "2",
      name: "Keyboards",
      slug: "keyboards",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Keyboards",
      count: 189,
    },
    {
      id: "3",
      name: "Drums",
      slug: "drums",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Drums",
      count: 124,
    },
    {
      id: "4",
      name: "Traditional",
      slug: "traditional",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Traditional",
      count: 156,
    },
    {
      id: "5",
      name: "Audio Gear",
      slug: "audio-gear",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Audio+Gear",
      count: 210,
    },
    {
      id: "6",
      name: "Accessories",
      slug: "accessories",
      imageUrl: "/placeholder.svg?height=200&width=200&text=Accessories",
      count: 312,
    },
  ]

  const sampleFeaturedProducts: FeaturedProduct[] = [
    {
      id: "1",
      name: "Gibson Les Paul Standard",
      price: 189999,
      imageUrl: "/placeholder.svg?height=300&width=300&text=Gibson+Les+Paul",
      category: "Guitars",
      rating: 4.9,
      reviews: 87,
      badge: "Premium",
    },
    {
      id: "2",
      name: "Yamaha Grand Piano C3X",
      price: 1250000,
      imageUrl: "/placeholder.svg?height=300&width=300&text=Yamaha+Piano",
      category: "Keyboards",
      rating: 5.0,
      reviews: 32,
      badge: "Exclusive",
    },
    {
      id: "3",
      name: "Tabla Set - Professional",
      price: 24999,
      imageUrl: "/placeholder.svg?height=300&width=300&text=Tabla+Set",
      category: "Traditional",
      rating: 4.8,
      reviews: 124,
      badge: "Handcrafted",
    },
    {
      id: "4",
      name: "Sitar - Concert Quality",
      price: 85000,
      imageUrl: "/placeholder.svg?height=300&width=300&text=Sitar",
      category: "Traditional",
      rating: 4.9,
      reviews: 56,
      badge: "Rare",
    },
  ]

  const sampleStats: Stats = {
    totalProducts: 1245,
    totalSellers: 387,
    totalCategories: 12,
    totalTransactions: 5842,
  }

  // Use sample data if API data is loading
  const displayCategories = categories.length > 0 ? categories : sampleCategories
  const displayFeaturedProducts = featuredProducts.length > 0 ? featuredProducts : sampleFeaturedProducts
  const displayStats = stats.totalProducts > 0 ? stats : sampleStats

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />

        {/* Animated circles */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <Header />
        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              India's Premier Marketplace for Musical Instruments
            </motion.h1>
            <motion.p
              className="text-xl text-white/70 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Buy and sell new, used, and vintage instruments from musicians across India. From traditional to modern,
              find your perfect sound.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              className="flex max-w-xl mx-auto mb-8"
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
                <Input
                  placeholder="Search for instruments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-r-none"
                />
              </div>
              <Button type="submit" className="bg-white text-black hover:bg-gray-200 rounded-l-none px-6">
                Search
              </Button>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/marketplace">
                <Button className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                >
                  Sell Your Instrument
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-white">Browse Categories</h2>
            <Link href="/marketplace" className="text-white/70 hover:text-white flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading.categories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/5 rounded-lg h-40 mb-3"></div>
                  <div className="bg-white/5 h-6 w-24 rounded mb-2"></div>
                  <div className="bg-white/5 h-4 w-16 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/marketplace?category=${category.slug}`}>
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={category.imageUrl || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                        <p className="text-sm text-white/60">{category.count} listings</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <TrendingUp className="mr-3 h-6 w-6" /> Featured Instruments
            </h2>
            <Link href="/marketplace?featured=true" className="text-white/70 hover:text-white flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {loading.featured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/5 rounded-lg h-64 mb-3"></div>
                  <div className="bg-white/5 h-6 w-48 rounded mb-2"></div>
                  <div className="bg-white/5 h-5 w-24 rounded mb-2"></div>
                  <div className="bg-white/5 h-4 w-32 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayFeaturedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/products/${product.id}`}>
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors overflow-hidden h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {product.badge && (
                          <Badge className="absolute top-3 left-3 bg-white text-black font-semibold">
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-xl font-bold text-white mb-2">₹{product.price.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-white/60">
                          <span className="mr-2">{product.category}</span>
                          <div className="flex items-center ml-auto">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{product.rating}</span>
                            <span className="ml-1 text-white/40">({product.reviews})</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">India's Trusted Instrument Marketplace</h2>

          {loading.stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col items-center">
                  <div className="bg-white/5 h-12 w-12 rounded-full mb-4"></div>
                  <div className="bg-white/5 h-8 w-24 rounded mb-2"></div>
                  <div className="bg-white/5 h-4 w-32 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{displayStats.totalProducts.toLocaleString()}</h3>
                <p className="text-white/60">Instruments Listed</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{displayStats.totalSellers.toLocaleString()}</h3>
                <p className="text-white/60">Verified Sellers</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{displayStats.totalCategories}</h3>
                <p className="text-white/60">Instrument Categories</p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {displayStats.totalTransactions.toLocaleString()}
                </h3>
                <p className="text-white/60">Successful Transactions</p>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full py-12 sm:py-24 md:py-32 lg:py-40 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Us?</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                We offer a seamless shopping experience with a focus on quality, variety, and customer satisfaction.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="flex flex-col items-center p-6 text-center">
              <SearchIcon className="h-12 w-12 text-gray-900 dark:text-gray-50" />
              <CardHeader>
                <CardTitle>Vast Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Browse thousands of products across diverse categories.</CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center">
              <TagIcon className="h-12 w-12 text-gray-900 dark:text-gray-50" />
              <CardHeader>
                <CardTitle>Competitive Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Get the best deals and value for your money.</CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-gray-900 dark:text-gray-50" />
              <CardHeader>
                <CardTitle>Easy Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>A simple and secure checkout process for a hassle-free purchase.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-80" />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to find your perfect instrument?
            </motion.h2>
            <motion.p
              className="text-xl text-white/70 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of musicians across India buying and selling on Legato. From traditional to modern, we have
              instruments for every style and budget.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/marketplace">
                <Button className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                  Start Browsing
                </Button>
              </Link>
              <Link href="/auth?register=true">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                >
                  Create Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-950 text-gray-400">
        <p className="text-xs">&copy; 2024 Cloud-Native E-Commerce. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
