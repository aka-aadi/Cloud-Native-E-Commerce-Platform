"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  ShoppingCart,
  User,
  Star,
  Heart,
  TrendingUp,
  Shield,
  Truck,
  CreditCard,
  Clock,
  MapPin,
  Sun,
  Moon,
  Laptop,
  IndianRupee,
  Loader2,
  Play,
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  rating: number
  reviews: number
  seller: string
  condition: string
  location: string
  featured: boolean
  category: string
}

interface Stats {
  label: string
  value: string
  icon: any
  change: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: any
  count: number
  color: string
  description: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10 transition-colors">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-white/20">
        <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-white/10">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-white/10">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-white/10">
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes, statsRes] = await Promise.all([
          fetch("/api/products/featured"),
          fetch("/api/categories"),
          fetch("/api/stats"),
        ])

        if (productsRes.ok) {
          const products = await productsRes.json()
          setFeaturedProducts(products)
        }

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json()
          setCategories(cats)
        }

        if (statsRes.ok) {
          const statistics = await statsRes.json()
          setStats(statistics)
        }

        // Get cart count from localStorage
        const savedCart = localStorage.getItem("legato-cart")
        if (savedCart) {
          const cart = JSON.parse(savedCart)
          setCartCount(cart.length || 0)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

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
            Loading Legato...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                className="h-10 w-10 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <Play className="h-6 w-6 text-black ml-0.5" />
              </motion.div>
              <motion.span
                className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Legato
              </motion.span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <motion.div
                className="relative w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="search"
                  placeholder="Search instruments, tabla, sitar, guitar..."
                  className="pl-12 pr-4 w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 transition-all duration-300 h-12 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            </div>

            {/* Navigation */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ThemeToggle />
              <Link href="/marketplace">
                <Button variant="ghost" className="hidden sm:inline-flex hover:bg-white/10 text-white">
                  Browse
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="ghost" className="hidden sm:inline-flex hover:bg-white/10 text-white">
                  Sell
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 h-5 w-5 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-white/10 text-white">U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/20">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem className="text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <Link href="/admin">
                    <DropdownMenuItem className="text-white hover:bg-white/10">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <Link href="/auth">
                    <DropdownMenuItem className="text-white hover:bg-white/10">Sign Out</DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <motion.div
          className="container mx-auto px-4 relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="text-center space-y-8">
            <motion.h1
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent leading-tight"
              variants={fadeInUp}
            >
              India's Premier
              <br />
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Music Marketplace
              </span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Connect with musicians across India. Buy and sell instruments from traditional tabla to modern guitars -
              all in one trusted, professional marketplace.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
              variants={fadeInUp}
            >
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="text-lg px-10 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-xl font-semibold group"
                >
                  Start Shopping
                  <Search className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 rounded-xl font-semibold group bg-transparent"
                >
                  Sell Your Instruments
                  <TrendingUp className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center space-y-4 group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-white/10 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
                <div className="text-xs text-green-400 font-medium">{stat.change}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">Shop by Category</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              From classical Indian instruments to modern music gear
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map((category, index) => (
              <motion.div key={category.id} variants={fadeInUp}>
                <Link href={`/marketplace?category=${category.slug}`}>
                  <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group backdrop-blur-sm">
                    <CardContent className="p-6 text-center space-y-4">
                      <motion.div
                        className="h-16 w-16 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <category.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-white/90">{category.name}</h3>
                        <p className="text-sm text-white/60">{category.count.toLocaleString()} items</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white/5">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">Featured Listings</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Hand-picked instruments from trusted sellers across India
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <Card className="h-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm overflow-hidden">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      whileHover={{ scale: 1.1 }}
                    />
                    {product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-white text-black font-semibold">Sale</Badge>
                    )}
                    <motion.button
                      className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </motion.button>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg leading-tight text-white group-hover:text-white/90">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1 text-white">{product.rating}</span>
                        </div>
                        <span className="text-sm text-white/60">({product.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold text-white flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {product.price.toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-white/50 line-through flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {product.originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Condition:</span>
                        <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                          {product.condition}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Seller:</span>
                        <span className="font-medium text-white">{product.seller}</span>
                      </div>
                      <div className="flex items-center text-sm text-white/60">
                        <MapPin className="h-3 w-3 mr-1" />
                        {product.location}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 font-semibold">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 rounded-xl px-8 py-3 bg-transparent"
              >
                View All Listings
                <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">Why Choose Legato?</h2>
            <p className="text-xl text-white/70">Trusted by musicians across India</p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description: "UPI, Net Banking, Cards - all payments secured with bank-level encryption",
                color: "from-green-400/20 to-green-600/20",
              },
              {
                icon: Truck,
                title: "Pan-India Delivery",
                description: "Fast and reliable shipping to all major cities and towns",
                color: "from-blue-400/20 to-blue-600/20",
              },
              {
                icon: CreditCard,
                title: "Easy Returns",
                description: "7-day return policy with free return pickup",
                color: "from-purple-400/20 to-purple-600/20",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Customer support in Hindi, English, and regional languages",
                color: "from-orange-400/20 to-orange-600/20",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center space-y-6 group"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`h-20 w-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 backdrop-blur-sm`}
                >
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-black ml-0.5" />
                </div>
                <span className="text-2xl font-bold text-white">Legato</span>
              </Link>
              <p className="text-white/70 leading-relaxed">
                India's premier marketplace for musical instruments. Connecting musicians from Kashmir to Kanyakumari
                with quality instruments and trusted sellers.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold text-white text-lg">Categories</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <Link href="/marketplace?category=traditional" className="hover:text-white transition-colors">
                    Traditional Instruments
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=guitars" className="hover:text-white transition-colors">
                    Guitars
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=keyboards" className="hover:text-white transition-colors">
                    Keyboards
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace?category=drums" className="hover:text-white transition-colors">
                    Drums
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold text-white text-lg">Support</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    Shipping Info
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-semibold text-white text-lg">Company</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/60">
            <p>&copy; 2024 Legato. All rights reserved. Made in India 🇮🇳 for Indian musicians.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
