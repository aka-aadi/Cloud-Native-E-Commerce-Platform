"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Truck,
  ArrowLeft,
  Play,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Loader2,
} from "lucide-react"
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
  addedAt: string
}

interface ShippingAddress {
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  country: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const shipping = subtotal > 50000 ? 0 : 500 // Free shipping over ₹50,000
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + shipping + tax

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const required = ["fullName", "phone", "email", "addressLine1", "city", "state", "pincode"]
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return false
      }
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return false
    }

    return true
  }

  const processPayment = async () => {
    if (!validateForm()) return

    setProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Clear cart
      localStorage.removeItem("legato-cart")

      // Show success and redirect
      toast.success("Payment successful! Order placed.")
      router.push("/order-success")
    } catch (error) {
      toast.error("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
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
          <Loader2 className="h-16 w-16 animate-spin text-white mx-auto" />
          <p className="mt-4 text-white/80">Loading checkout...</p>
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
            <h1 className="text-xl font-semibold">Secure Checkout</h1>
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
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-white/80">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) => handleAddressChange("fullName", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white/80">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => handleAddressChange("phone", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white/80">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange("email", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine1" className="text-white/80">
                        Address Line 1 *
                      </Label>
                      <Input
                        id="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="House/Flat No., Street Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine2" className="text-white/80">
                        Address Line 2
                      </Label>
                      <Input
                        id="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        placeholder="Landmark, Area (Optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-white/80">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-white/80">
                          State *
                        </Label>
                        <Select
                          value={shippingAddress.state}
                          onValueChange={(value) => handleAddressChange("state", value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="chennai">Chennai</SelectItem>
                            <SelectItem value="kolkata">Kolkata</SelectItem>
                            <SelectItem value="hyderabad">Hyderabad</SelectItem>
                            <SelectItem value="pune">Pune</SelectItem>
                            <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-white/80">
                          Pincode *
                        </Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => handleAddressChange("pincode", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          placeholder="000000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">Credit/Debit Card</div>
                            <div className="text-white/60 text-sm">Visa, Mastercard, RuPay</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <Smartphone className="h-5 w-5 text-green-400" />
                          <div>
                            <div className="text-white font-medium">UPI</div>
                            <div className="text-white/60 text-sm">PhonePe, Google Pay, Paytm</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Label htmlFor="netbanking" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <Building2 className="h-5 w-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">Net Banking</div>
                            <div className="text-white/60 text-sm">All major banks supported</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <Truck className="h-5 w-5 text-orange-400" />
                          <div>
                            <div className="text-white font-medium">Cash on Delivery</div>
                            <div className="text-white/60 text-sm">Pay when you receive</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Payment Form Fields */}
                    <AnimatePresence>
                      {paymentMethod === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 space-y-4"
                        >
                          <div>
                            <Label htmlFor="cardNumber" className="text-white/80">
                              Card Number
                            </Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry" className="text-white/80">
                                Expiry Date
                              </Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv" className="text-white/80">
                                CVV
                              </Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="cardName" className="text-white/80">
                              Cardholder Name
                            </Label>
                            <Input
                              id="cardName"
                              placeholder="Name on card"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                        </motion.div>
                      )}

                      {paymentMethod === "upi" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6"
                        >
                          <Label htmlFor="upiId" className="text-white/80">
                            UPI ID
                          </Label>
                          <Input
                            id="upiId"
                            placeholder="yourname@paytm"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <motion.div
              className="space-y-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              {/* Cart Items */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <img
                        src={item.imageUrl || item.images?.[0] || "/placeholder.svg?height=60&width=60&text=Product"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-medium line-clamp-2">{item.name}</h3>
                        <p className="text-white/60 text-sm">
                          {typeof item.seller === "string" ? item.seller : item.seller.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-white font-semibold">₹{item.price.toLocaleString()}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              className="h-8 w-8 p-0 hover:bg-white/10"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-white w-8 text-center">{item.quantity || 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="h-8 w-8 p-0 hover:bg-white/10"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
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
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>You saved ₹500 on shipping!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Badge */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Secure Payment</div>
                      <div className="text-white/60 text-sm">Your payment information is encrypted and secure</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold py-4 text-lg"
                  onClick={processPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Place Order - ₹${total.toLocaleString()}`
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
