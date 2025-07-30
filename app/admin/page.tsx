"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  IndianRupee,
  RefreshCw,
  Play,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"

interface DashboardStats {
  totalRevenue: number
  activeListings: number
  totalUsers: number
  transactions: number
  revenueChange: string
  listingsChange: string
  usersChange: string
  transactionsChange: string
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
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true)
    setRefreshing(true)

    try {
      const [statsRes, listingsRes, usersRes, revenueRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/listings/recent"),
        fetch("/api/admin/users"),
        fetch("/api/admin/revenue"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setRecentListings(listingsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json()
        setRevenueData(revenueData)
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
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Credentials Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Admin Access Credentials</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-white/80">
                      <span className="font-medium">Email:</span> admin@legato.com
                    </p>
                    <p className="text-white/80">
                      <span className="font-medium">Password:</span> Legato2024!Admin
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                      🔒 Change these credentials after first login for security
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/30 mb-2">Super Admin</Badge>
                  <p className="text-xs text-white/60">Full System Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/10 text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="listings" className="data-[state=active]:bg-white/10 text-white">
              Listings
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10 text-white">
              Users
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/10 text-white">
              Categories
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white/10 text-white">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            {stats && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                              <TrendingUp className="inline h-4 w-4 mr-1" />
                              {stat.change} from last month
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
                    <CardTitle className="text-white">Recent Listings</CardTitle>
                    <CardDescription className="text-white/60">Latest items submitted for review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <AnimatePresence>
                        {recentListings.map((listing, index) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300"
                          >
                            <div>
                              <p className="font-medium text-white">{listing.item}</p>
                              <p className="text-sm text-white/60">
                                {listing.seller} • {formatCurrency(listing.amount)}
                              </p>
                              <p className="text-xs text-white/40">{listing.category}</p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="secondary"
                                className={
                                  listing.status === "Approved"
                                    ? "bg-green-600/20 text-green-400 border-green-600/30"
                                    : listing.status === "Flagged"
                                      ? "bg-red-600/20 text-red-400 border-red-600/30"
                                      : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                                }
                              >
                                {listing.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">Manage Listings</h2>
                <p className="text-white/60">Review and moderate marketplace listings</p>
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
                          <th className="text-left p-4 text-white/60 font-medium">Listing ID</th>
                          <th className="text-left p-4 text-white/60 font-medium">Item</th>
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
                            <td className="p-4 font-mono text-white/80">#{listing.id}</td>
                            <td className="p-4 text-white">{listing.item}</td>
                            <td className="p-4 text-white">{listing.seller}</td>
                            <td className="p-4 text-white">{formatCurrency(listing.amount)}</td>
                            <td className="p-4">
                              <Badge
                                variant="secondary"
                                className={
                                  listing.status === "Approved"
                                    ? "bg-green-600/20 text-green-400 border-green-600/30"
                                    : listing.status === "Flagged"
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
                                  className="text-green-400 hover:text-green-300 hover:bg-green-600/10"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/10"
                                >
                                  <Flag className="h-4 w-4" />
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

          <TabsContent value="categories" className="space-y-6">
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">Categories</h2>
                <p className="text-white/60">Manage instrument and equipment categories</p>
              </div>
              <Button onClick={() => setIsAddingCategory(true)} className="bg-white text-black hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </motion.div>

            <AnimatePresence>
              {isAddingCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Add New Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName" className="text-white/80">
                            Category Name
                          </Label>
                          <Input
                            id="categoryName"
                            placeholder="e.g., Tabla"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoryIcon" className="text-white/80">
                            Icon (Emoji)
                          </Label>
                          <Input
                            id="categoryIcon"
                            placeholder="🥁"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryDescription" className="text-white/80">
                          Description
                        </Label>
                        <Textarea
                          id="categoryDescription"
                          placeholder="Brief description of this category"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-white text-black hover:bg-gray-200">Save Category</Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingCategory(false)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {["Traditional", "Guitars", "Keyboards", "Drums", "Audio Gear", "Strings"].map((category, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <h3 className="font-semibold text-white">{category}</h3>
                            <p className="text-sm text-white/60">245 listings</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h2>
                <p className="text-white/60">View detailed reports and platform analytics</p>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  icon: AlertTriangle,
                  title: "Content Moderation",
                  color: "from-yellow-400/20 to-yellow-600/20",
                  textColor: "text-yellow-400",
                  data: [
                    { label: "Pending Review", value: "12" },
                    { label: "Resolved Today", value: "8" },
                    { label: "False Reports", value: "3" },
                  ],
                },
                {
                  icon: TrendingUp,
                  title: "Growth Metrics",
                  color: "from-green-400/20 to-green-600/20",
                  textColor: "text-green-400",
                  data: [
                    { label: "New Users (30d)", value: "342" },
                    { label: "New Listings (30d)", value: "1,247" },
                    { label: "Transactions (30d)", value: "456" },
                  ],
                },
                {
                  icon: BarChart3,
                  title: "Platform Health",
                  color: "from-blue-400/20 to-blue-600/20",
                  textColor: "text-blue-400",
                  data: [
                    { label: "Uptime", value: "99.9%" },
                    { label: "Avg Response", value: "245ms" },
                    { label: "Active Sessions", value: "1,234" },
                  ],
                },
              ].map((report, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${report.color} mr-3`}>
                          <report.icon className={`h-5 w-5 ${report.textColor}`} />
                        </div>
                        {report.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.data.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-white/60">{item.label}:</span>
                            <span className="font-semibold text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
