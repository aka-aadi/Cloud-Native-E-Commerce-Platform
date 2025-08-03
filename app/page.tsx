"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Search, ArrowRight, Star, TrendingUp, Music, ShoppingBag } from "lucide-react"
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
    <div className="min-h-screen bg-black text-white">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
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
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-black ml-0.5" />
                </div>
                <span className="text-xl font-bold text-white">Legato</span>
              </Link>
              <p className="text-white/60 mb-4">
                India's premier marketplace for musical instruments. Buy and sell with confidence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white/60 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white/60 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/marketplace" className="text-white/60 hover:text-white">
                    All Instruments
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=guitars" className="text-white/60 hover:text-white">
                    Guitars
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=keyboards" className="text-white/60 hover:text-white">
                    Keyboards
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=drums" className="text-white/60 hover:text-white">
                    Drums
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=traditional" className="text-white/60 hover:text-white">
                    Traditional
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth" className="text-white/60 hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth?register=true" className="text-white/60 hover:text-white">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="text-white/60 hover:text-white">
                    Sell Instrument
                  </Link>
                </li>
                <li>
                  <Link href="/account/watchlist" className="text-white/60 hover:text-white">
                    Watchlist
                  </Link>
                </li>
                <li>
                  <Link href="/account/messages" className="text-white/60 hover:text-white">
                    Messages
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Help & Info</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/60 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-white/60 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white/60 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/60 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 mb-4 md:mb-0">© 2023 Legato. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-white/60 hover:text-white text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="text-white/60 hover:text-white text-sm">
                Privacy
              </Link>
              <Link href="/cookies" className="text-white/60 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
