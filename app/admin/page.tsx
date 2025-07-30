"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Server,
  Database,
  Cloud,
} from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    icon: DollarSign,
    color: "text-green-400",
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+15.3%",
    icon: ShoppingCart,
    color: "text-blue-400",
  },
  {
    title: "Products",
    value: "1,247",
    change: "+5.2%",
    icon: Package,
    color: "text-purple-400",
  },
  {
    title: "Customers",
    value: "8,429",
    change: "+12.8%",
    icon: Users,
    color: "text-orange-400",
  },
]

const recentOrders = [
  { id: "#3210", customer: "John Doe", amount: "$299.99", status: "Completed", date: "2024-01-15" },
  { id: "#3209", customer: "Jane Smith", amount: "$449.99", status: "Processing", date: "2024-01-15" },
  { id: "#3208", customer: "Mike Johnson", amount: "$199.99", status: "Shipped", date: "2024-01-14" },
  { id: "#3207", customer: "Sarah Wilson", amount: "$599.99", status: "Completed", date: "2024-01-14" },
  { id: "#3206", customer: "Tom Brown", amount: "$159.99", status: "Processing", date: "2024-01-13" },
]

const products = [
  { id: 1, name: "Wireless Headphones Pro", price: "$299.99", stock: 45, status: "Active" },
  { id: 2, name: "Smart Watch Ultra", price: "$449.99", stock: 23, status: "Active" },
  { id: 3, name: "Gaming Laptop Elite", price: "$1299.99", stock: 8, status: "Low Stock" },
  { id: 4, name: "4K Webcam Pro", price: "$199.99", stock: 67, status: "Active" },
]

export default function AdminPage() {
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-white">
                CloudMart Admin
              </Link>
              <Badge className="bg-blue-600 text-white">AWS Powered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  View Store
                </Button>
              </Link>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gray-700">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-gray-700">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700">
              Orders
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-gray-700">
              Infrastructure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-700 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts and Recent Orders */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Sales chart would be rendered here</p>
                      <p className="text-sm">Connected to AWS RDS analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Orders</CardTitle>
                  <CardDescription className="text-gray-400">Latest orders from your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{order.id}</p>
                          <p className="text-sm text-gray-400">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{order.amount}</p>
                          <Badge
                            variant={order.status === "Completed" ? "default" : "secondary"}
                            className={
                              order.status === "Completed"
                                ? "bg-green-600"
                                : order.status === "Processing"
                                  ? "bg-yellow-600"
                                  : "bg-blue-600"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Products</h2>
                <p className="text-gray-400">Manage your product catalog</p>
              </div>
              <Button onClick={() => setIsAddingProduct(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {isAddingProduct && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="text-gray-300">
                        Product Name
                      </Label>
                      <Input
                        id="productName"
                        placeholder="Enter product name"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productPrice" className="text-gray-300">
                        Price
                      </Label>
                      <Input
                        id="productPrice"
                        type="number"
                        placeholder="0.00"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productDescription" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Enter product description"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productCategory" className="text-gray-300">
                        Category
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productStock" className="text-gray-300">
                        Stock
                      </Label>
                      <Input
                        id="productStock"
                        type="number"
                        placeholder="0"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Product</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingProduct(false)}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 text-gray-300">Product</th>
                        <th className="text-left p-4 text-gray-300">Price</th>
                        <th className="text-left p-4 text-gray-300">Stock</th>
                        <th className="text-left p-4 text-gray-300">Status</th>
                        <th className="text-left p-4 text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-700/50">
                          <td className="p-4 text-white">{product.name}</td>
                          <td className="p-4 text-white">{product.price}</td>
                          <td className="p-4 text-white">{product.stock}</td>
                          <td className="p-4">
                            <Badge
                              variant={product.status === "Active" ? "default" : "destructive"}
                              className={product.status === "Active" ? "bg-green-600" : "bg-red-600"}
                            >
                              {product.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Orders</h2>
              <p className="text-gray-400">Manage customer orders</p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 text-gray-300">Order ID</th>
                        <th className="text-left p-4 text-gray-300">Customer</th>
                        <th className="text-left p-4 text-gray-300">Amount</th>
                        <th className="text-left p-4 text-gray-300">Status</th>
                        <th className="text-left p-4 text-gray-300">Date</th>
                        <th className="text-left p-4 text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-700/50">
                          <td className="p-4 text-white font-mono">{order.id}</td>
                          <td className="p-4 text-white">{order.customer}</td>
                          <td className="p-4 text-white">{order.amount}</td>
                          <td className="p-4">
                            <Badge
                              variant={order.status === "Completed" ? "default" : "secondary"}
                              className={
                                order.status === "Completed"
                                  ? "bg-green-600"
                                  : order.status === "Processing"
                                    ? "bg-yellow-600"
                                    : "bg-blue-600"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-400">{order.date}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Infrastructure Status</h2>
              <p className="text-gray-400">Monitor your AWS cloud infrastructure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Server className="h-5 w-5 mr-2 text-green-400" />
                    EC2 Instances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className="bg-green-600">Running</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Instance Type:</span>
                      <span className="text-white">t2.micro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU Usage:</span>
                      <span className="text-white">23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Memory:</span>
                      <span className="text-white">45%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-400" />
                    RDS Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className="bg-green-600">Available</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Engine:</span>
                      <span className="text-white">PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Connections:</span>
                      <span className="text-white">12/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Storage:</span>
                      <span className="text-white">15GB/20GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Cloud className="h-5 w-5 mr-2 text-purple-400" />
                    S3 Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Objects:</span>
                      <span className="text-white">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">2.3GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Requests:</span>
                      <span className="text-white">15.2K/month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">CI/CD Pipeline Status</CardTitle>
                <CardDescription className="text-gray-400">Jenkins & Docker deployment pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">Latest Deployment</p>
                        <p className="text-sm text-gray-400">Build #127 - 2 hours ago</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Success</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Build Stats</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Build Time:</span>
                          <span className="text-white">3m 42s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tests Passed:</span>
                          <span className="text-white">247/247</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Coverage:</span>
                          <span className="text-white">94.2%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Deployment Info</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Environment:</span>
                          <span className="text-white">Production</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Docker Image:</span>
                          <span className="text-white">v1.2.7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Instances:</span>
                          <span className="text-white">3 running</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
