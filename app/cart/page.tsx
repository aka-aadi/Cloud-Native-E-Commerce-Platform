"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Play, Trash2, Plus, Minus, ShoppingBag, Heart, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl?: string
  images?: string[]
  quantity?: number
  seller: string | { name: string }
  category: string
  condition: string
  addedAt: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedCart = localStorage.getItem("legato-cart")
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      // Group items by ID and count quantities
      const groupedItems = cart.reduce((acc: CartItem[], item: CartItem) => {
        const existingItem = acc.find((i) => i.id === item.id)
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1
        } else {
          acc.push({ ...item, quantity: 1 })
        }
        return acc
      }, [])
      setCartItems(groupedItems)
    }
    setLoading(false)
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    const updatedItems = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updatedItems)

    // Update localStorage
    const flatCart: CartItem[] = []
    updatedItems.forEach((item) => {
      for (let i = 0; i < (item.quantity || 1); i++) {
        flatCart.push({ ...item, quantity: 1 })
      }
    })
    localStorage.setItem("legato-cart", JSON.stringify(flatCart))
  }

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedItems)

    // Update localStorage
    const flatCart: CartItem[] = []
    updatedItems.forEach((item) => {
      for (let i = 0; i < (item.quantity || 1); i++) {
        flatCart.push({ ...item, quantity: 1 })
      }
    })
    localStorage.setItem("legato-cart", JSON.stringify(flatCart))
    toast.success("Item removed from cart")
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("legato-cart")
    toast.success("Cart cleared")
  }

  const moveToWishlist = (item: CartItem) => {
    // Add to wishlist
    const savedWishlist = localStorage.getItem("legato-wishlist")
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []
    const exists = wishlist.find((wishItem: CartItem) => wishItem.id === item.id)
    if (!exists) {
      wishlist.push(item)
      localStorage.setItem("legato-wishlist", JSON.stringify(wishlist))
    }

    // Remove from cart
    removeItem(item.id)
    toast.success("Moved to wishlist")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const shipping = subtotal > 50000 ? 0 : 500 // Free shipping over ₹50,000
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-16 w-16 animate-spin text-white mx-auto" />
          <p className="mt-4 text-white/80">Loading cart...</p>
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
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
            </div>
            <h1 className="text-xl font-semibold">Shopping Cart</h1>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-white/60 mb-6">Add some instruments to get started</p>
            <Link href="/marketplace">
              <Button className="bg-white text-black hover:bg-gray-200">Continue Shopping</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                className="flex items-center justify-between mb-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <h2 className="text-2xl font-bold text-white">
                  Cart ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)
                </h2>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Clear Cart
                </Button>
              </motion.div>

              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Link href={`/product/${item.id}`}>
                              <img
                                src={
                                  item.imageUrl ||
                                  item.images?.[0] ||
                                  "/placeholder.svg?height=120&width=120&text=Product"
                                }
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                              />
                            </Link>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Link href={`/product/${item.id}`}>
                                    <h3 className="text-lg font-semibold text-white hover:text-white/80 cursor-pointer line-clamp-2">
                                      {item.name}
                                    </h3>
                                  </Link>
                                  <p className="text-white/60 text-sm mt-1">
                                    {typeof item.seller === "string" ? item.seller : item.seller.name}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                                      {item.category}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                                      {item.condition}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xl font-bold text-white">₹{item.price.toLocaleString()}</p>
                                  <p className="text-sm text-white/60">per item</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center border border-white/20 rounded-lg">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                      disabled={(item.quantity || 1) <= 1}
                                      className="hover:bg-white/10 rounded-r-none"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 text-white min-w-[3rem] text-center">
                                      {item.quantity || 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                      className="hover:bg-white/10 rounded-l-none"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <span className="text-white/60 text-sm">
                                    Total: ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveToWishlist(item)}
                                    className="hover:bg-white/10 text-white/60 hover:text-white"
                                  >
                                    <Heart className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Order Summary */}
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-white/80">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString()}`}</span>
                  </div>

                  <div className="flex justify-between text-white/80">
                    <span>GST (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>

                  {shipping === 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-400 text-sm text-center">🎉 You saved ₹500 on shipping!</p>
                    </div>
                  )}

                  <motion.div className="space-y-3 pt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/checkout">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold py-3 text-lg">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Link href="/marketplace">
                      <Button
                        variant="outline"
                        className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
