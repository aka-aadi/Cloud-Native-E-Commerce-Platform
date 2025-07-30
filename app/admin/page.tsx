"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  IndianRupee,
  RefreshCw,
  Play,
  Loader2,
  Clock,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { toast } from "sonner"

interface DashboardStats {
  totalRevenue: number
  activeListings: number
  totalUsers: number
  transactions: number
  pendingReviews: number
  revenueChange: string
  listingsChange: string
  usersChange: string
  transactionsChange: string
}

interface PendingProduct {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  condition: string
  category: string
  location: string
  contactName: string
  contactMethod: string
  contactDetails: string
  description: string
  specifications: Record<string, string>
  features: string[]
  images: string[]
  shipping: {
    method: string
    cost: number
    estimatedDays: string
    freeShipping: boolean
    localPickup: boolean
    nationwide: boolean
  }
  warranty: string
  returnPolicy: string
  inStock: number
  submittedAt: string
  status: "pending" | "approved" | "rejected"
}

interface RecentListing {
  id: string
  item: string
  seller: string
  amount: number
  status: string
  date: string
  category: string
}

interface User {
  id: string
  name: string
  email: string
  type: string
  listings: number
  status: string
  joined: string
  location: string
}

interface RevenueData {
  month: string
  revenue: number
  orders: number
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([])
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setRefreshing(true)

    try {
      const [statsRes, pendingRes, listingsRes, usersRes, revenueRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/products/pending"),
        fetch("/api/admin/listings/recent"),
        fetch("/api/admin/users"),
        fetch("/api/admin/revenue"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        // Mock stats data
        setStats({
          totalRevenue: 2450000,
          activeListings: 1247,
          totalUsers: 8934,
          transactions: 456,
          pendingReviews: 23,
          revenueChange: "+12.5%",
          listingsChange: "+8.2%",
          usersChange: "+15.3%",
          transactionsChange: "+6.7%",
        })
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingProducts(pendingData)
      } else {
        // Mock pending products
        setPendingProducts([
          {
            id: "pending-1",
            name: "Fender Player Stratocaster Electric Guitar",
            brand: "Fender",
            price: 45000,
            originalPrice: 52000,
            condition: "Excellent",
            category: "Guitars",
            location: "Mumbai, Maharashtra",
            contactName: "Rahul Sharma",
            contactMethod: "phone",
            contactDetails: "+91 9876543210",
            description:
              "Beautiful Fender Player Stratocaster in excellent condition. Barely used, kept in climate-controlled environment. Comes with original case and all accessories.",
            specifications: {
              "Body Type": "Solid Body",
              "Body Wood": "Alder",
              "Neck Wood": "Maple",
              Fingerboard: "Maple",
              "Scale Length": "25.5 inches",
              Pickups: "Player Series Alnico 5 Strat Single-Coil",
            },
            features: [
              "Player Series Alnico 5 Strat Single-Coil pickups",
              "Modern C-shaped neck profile",
              "9.5-inch radius fingerboard",
              "22 medium jumbo frets",
              "2-point tremolo bridge",
              "Sealed tuning machines",
            ],
            images: [
              "/placeholder.svg?height=400&width=400&text=Fender+Guitar+1",
              "/placeholder.svg?height=400&width=400&text=Fender+Guitar+2",
              "/placeholder.svg?height=400&width=400&text=Fender+Guitar+3",
            ],
            shipping: {
              method: "both",
              cost: 500,
              estimatedDays: "3-5 business days",
              freeShipping: false,
              localPickup: true,
              nationwide: true,
            },
            warranty: "1 year manufacturer warranty remaining",
            returnPolicy: "7-day return policy",
            inStock: 1,
            submittedAt: "2024-01-15T10:30:00Z",
            status: "pending",
          },
          {
            id: "pending-2",
            name: "Yamaha P-125 Digital Piano",
            brand: "Yamaha",
            price: 35000,
            condition: "Like New",
            category: "Keyboards",
            location: "Delhi, India",
            contactName: "Priya Patel",
            contactMethod: "email",
            contactDetails: "priya.music@email.com",
            description:
              "Yamaha P-125 digital piano in like-new condition. Used only for home practice. Includes sustain pedal and music stand.",
            specifications: {
              Keys: "88 weighted keys",
              Sounds: "24 voices",
              Polyphony: "192 notes",
              Dimensions: "1326 x 295 x 166 mm",
              Weight: "11.8 kg",
            },
            features: [
              "88 fully weighted keys with Graded Hammer Standard action",
              "Pure CF Sound Engine",
              "24 high-quality voices",
              "Smart Pianist app compatibility",
              "USB to Host connectivity",
            ],
            images: [
              "/placeholder.svg?height=400&width=400&text=Yamaha+Piano+1",
              "/placeholder.svg?height=400&width=400&text=Yamaha+Piano+2",
            ],
            shipping: {
              method: "standard",
              cost: 800,
              estimatedDays: "5-7 business days",
              freeShipping: false,
              localPickup: true,
              nationwide: true,
            },
            warranty: "2 years manufacturer warranty",
            returnPolicy: "14-day return policy",
            inStock: 1,
            submittedAt: "2024-01-14T15:45:00Z",
            status: "pending",
          },
        ])
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setRecentListings(listingsData)
      } else {
        // Mock recent listings
        setRecentListings([
          {
            id: "1",
            item: "Gibson Les Paul Standard",
            seller: "MusicStore Delhi",
            amount: 85000,
            status: "Approved",
            date: "2024-01-15",
            category: "Guitars",
          },
          {
            id: "2",
            item: "Roland TD-17KVX Drums",
            seller: "DrumWorld Mumbai",
            amount: 95000,
            status: "Pending",
            date: "2024-01-14",
            category: "Drums",
          },
        ])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      } else {
        // Mock users data
        setUsers([
          {
            id: "1",
            name: "Rahul Sharma",
            email: "rahul@email.com",
            type: "Seller",
            listings: 5,
            status: "Active",
            joined: "2023-06-15",
            location: "Mumbai, India",
          },
          {
            id: "2",
            name: "Priya Patel",
            email: "priya@email.com",
            type: "Buyer",
            listings: 0,
            status: "Active",
            joined: "2023-08-22",
            location: "Delhi, India",
          },
        ])
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json()
        setRevenueData(revenueData)
      } else {
        // Mock revenue data
        setRevenueData([
          { month: "Jan", revenue: 180000, orders: 45 },
          { month: "Feb", revenue: 220000, orders: 52 },
          { month: "Mar", revenue: 280000, orders: 68 },
          { month: "Apr", revenue: 320000, orders: 75 },
          { month: "May", revenue: 380000, orders: 89 },
          { month: "Jun", revenue: 420000, orders: 95 },
        ])
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => fetchDashboardData(false), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleProductAction = async (productId: string, action: "approve" | "reject", reason?: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        toast.success(`Product ${action}d successfully`)
        setPendingProducts((prev) => prev.filter((p) => p.id !== productId))
        setReviewDialogOpen(false)
        setSelectedProduct(null)

        // Refresh stats
        fetchDashboardData(false)
      } else {
        throw new Error(`Failed to ${action} product`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} product`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + "L"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  if (loading && !stats) {
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
            Loading Admin Dashboard...
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
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-black ml-0.5" />
                </div>
                <span className="text-2xl font-bold text-white">Legato Admin</span>
              </Link>
              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Super Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/60">Last updated: {lastUpdated.toLocaleTimeString("en-IN")}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDashboardData(false)}
                disabled={refreshing}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  View Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10 text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10 text-white relative">
              Pending Reviews
              {stats && stats.pendingReviews > 0 && (
                <Badge className="ml-2 bg-red-600 text-white text-xs px-1.5 py-0.5">{stats.pendingReviews}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-white/10 text-white">
              All Listings
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 text-white">
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            {stats && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[
                  {
                    title: "Total Revenue",
                    value: formatNumber(stats.totalRevenue),
                    change: stats.revenueChange,
                    icon: DollarSign,
                    color: "from-green-400/20 to-green-600/20",
                    textColor: "text-green-400",
                  },
                  {
                    title: "Active Listings",
                    value: stats.activeListings.toLocaleString("en-IN"),
                    change: stats.listingsChange,
                    icon: Package,
                    color: "from-blue-400/20 to-blue-600/20",
                    textColor: "text-blue-400",
                  },
                  {
                    title: "Total Users",
                    value: stats.totalUsers.toLocaleString("en-IN"),
                    change: stats.usersChange,
                    icon: Users,
                    color: "from-purple-400/20 to-purple-600/20",
                    textColor: "text-purple-400",
                  },
                  {
                    title: "Transactions",
                    value: stats.transactions.toLocaleString("en-IN"),
                    change: stats.transactionsChange,
                    icon: ShoppingCart,
                    color: "from-orange-400/20 to-orange-600/20",
                    textColor: "text-orange-400",
                  },
                  {
                    title: "Pending Reviews",
                    value: stats.pendingReviews.toString(),
                    change: "Needs attention",
                    icon: Clock,
                    color: "from-red-400/20 to-red-600/20",
                    textColor: "text-red-400",
                  },
                ].map((stat, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/60">{stat.title}</p>
                            <p className="text-2xl font-bold text-white flex items-center">
                              {stat.title === "Total Revenue" && <IndianRupee className="h-5 w-5 mr-1" />}
                              {stat.value}
                            </p>
                            <p className={`text-sm ${stat.textColor} flex items-center mt-1`}>
                              {stat.title !== "Pending Reviews" && <TrendingUp className="inline h-4 w-4 mr-1" />}
                              {stat.change}
                            </p>
                          </div>
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="month" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#ffffff"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-white/60">Latest platform activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">New product submission</p>
                          <p className="text-sm text-white/60">Fender Guitar by Rahul Sharma</p>
                        </div>
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">Product approved</p>
                          <p className="text-sm text-white/60">Gibson Les Paul by MusicStore</p>
                        </div>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Approved</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">Pending Product Reviews</h2>
                <p className="text-white/60">Review and approve new product submissions</p>
              </div>
              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">{pendingProducts.length} pending</Badge>
            </motion.div>

            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {pendingProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="grid lg:grid-cols-3 gap-6">
                          {/* Product Images */}
                          <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg bg-white/5">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                              />
                              <Badge className="absolute top-2 left-2 bg-white text-black">{product.condition}</Badge>
                            </div>
                            {product.images.length > 1 && (
                              <div className="flex space-x-2 overflow-x-auto">
                                {product.images.slice(1, 4).map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={image || "/placeholder.svg"}
                                    alt={`${product.name} ${idx + 2}`}
                                    className="w-16 h-16 object-cover rounded border border-white/20 flex-shrink-0"
                                  />
                                ))}
                                {product.images.length > 4 && (
                                  <div className="w-16 h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center text-white/60 text-xs">
                                    +{product.images.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-white/60 mb-2">
                                  <span>Brand: {product.brand}</span>
                                  <span>Category: {product.category}</span>
                                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                                    {product.condition}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {product.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(product.submittedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white">₹{product.price.toLocaleString()}</div>
                                {product.originalPrice && (
                                  <div className="text-sm text-white/50 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-sm text-white/60 mt-1">Stock: {product.inStock}</div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-white mb-2">Seller Information</h4>
                                <div className="space-y-1 text-sm text-white/80">
                                  <p>Name: {product.contactName}</p>
                                  <p>Contact: {product.contactMethod}</p>
                                  <p>Details: {product.contactDetails}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white mb-2">Shipping</h4>
                                <div className="space-y-1 text-sm text-white/80">
                                  <p>Method: {product.shipping.method}</p>
                                  <p>Cost: {product.shipping.freeShipping ? "Free" : `₹${product.shipping.cost}`}</p>
                                  <p>Delivery: {product.shipping.estimatedDays}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-white mb-2">Description</h4>
                              <p className="text-white/80 text-sm line-clamp-3">{product.description}</p>
                            </div>

                            <div className="flex space-x-4">
                              <Dialog
                                open={reviewDialogOpen && selectedProduct?.id === product.id}
                                onOpenChange={setReviewDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Review Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black border-white/20 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">
                                      Product Review: {selectedProduct?.name}
                                    </DialogTitle>
                                    <DialogDescription className="text-white/60">
                                      Review all product details before approving or rejecting
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <div className="space-y-6">
                                      {/* Product Images Grid */}
                                      <div>
                                        <h4 className="font-semibold text-white mb-3">Product Images</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                          {selectedProduct.images.map((image, idx) => (
                                            <img
                                              key={idx}
                                              src={image || "/placeholder.svg"}
                                              alt={`${selectedProduct.name} ${idx + 1}`}
                                              className="w-full h-32 object-cover rounded border border-white/20"
                                            />
                                          ))}
                                        </div>
                                      </div>

                                      {/* Specifications */}
                                      <div>
                                        <h4 className="font-semibold text-white mb-3">Specifications</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                          {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                            <div
                                              key={key}
                                              className="flex justify-between py-2 border-b border-white/10"
                                            >
                                              <span className="text-white/60">{key}</span>
                                              <span className="text-white">{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Features */}
                                      <div>
                                        <h4 className="font-semibold text-white mb-3">Key Features</h4>
                                        <ul className="space-y-2">
                                          {selectedProduct.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start space-x-2 text-white/80">
                                              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Warranty & Returns */}
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-white mb-2">Warranty</h4>
                                          <p className="text-white/80">
                                            {selectedProduct.warranty || "No warranty specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-white mb-2">Return Policy</h4>
                                          <p className="text-white/80">
                                            {selectedProduct.returnPolicy || "No return policy specified"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex space-x-4 pt-4 border-t border-white/10">
                                        <Button
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          onClick={() => handleProductAction(selectedProduct.id, "approve")}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve Product
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleProductAction(selectedProduct.id, "reject")}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject Product
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleProductAction(product.id, "approve")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button variant="destructive" onClick={() => handleProductAction(product.id, "reject")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {pendingProducts.length === 0 && (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
                  <p className="text-white/60">No pending product reviews at the moment.</p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">All Listings</h2>
                <p className="text-white/60">Manage all approved marketplace listings</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Export Data
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="text-left p-4 text-white/60 font-medium">Product</th>
                          <th className="text-left p-4 text-white/60 font-medium">Seller</th>
                          <th className="text-left p-4 text-white/60 font-medium">Price</th>
                          <th className="text-left p-4 text-white/60 font-medium">Status</th>
                          <th className="text-left p-4 text-white/60 font-medium">Date</th>
                          <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentListings.map((listing, index) => (
                          <motion.tr
                            key={listing.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <td className="p-4 text-white">{listing.item}</td>
                            <td className="p-4 text-white">{listing.seller}</td>
                            <td className="p-4 text-white">{formatCurrency(listing.amount)}</td>
                            <td className="p-4">
                              <Badge
                                variant="secondary"
                                className={
                                  listing.status === "Approved"
                                    ? "bg-green-600/20 text-green-400 border-green-600/30"
                                    : listing.status === "Rejected"
                                      ? "bg-red-600/20 text-red-400 border-red-600/30"
                                      : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                                }
                              >
                                {listing.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-white/60">{listing.date}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">User Management</h2>
                <p className="text-white/60">Manage registered users and their accounts</p>
              </div>
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="text-left p-4 text-white/60 font-medium">Name</th>
                          <th className="text-left p-4 text-white/60 font-medium">Email</th>
                          <th className="text-left p-4 text-white/60 font-medium">Type</th>
                          <th className="text-left p-4 text-white/60 font-medium">Listings</th>
                          <th className="text-left p-4 text-white/60 font-medium">Status</th>
                          <th className="text-left p-4 text-white/60 font-medium">Location</th>
                          <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <td className="p-4 text-white">{user.name}</td>
                            <td className="p-4 text-white">{user.email}</td>
                            <td className="p-4 text-white">{user.type}</td>
                            <td className="p-4 text-white">{user.listings}</td>
                            <td className="p-4">
                              <Badge
                                variant={user.status === "Active" ? "default" : "destructive"}
                                className={
                                  user.status === "Active"
                                    ? "bg-green-600/20 text-green-400 border-green-600/30"
                                    : "bg-red-600/20 text-red-400 border-red-600/30"
                                }
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-white/60">{user.location}</td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
