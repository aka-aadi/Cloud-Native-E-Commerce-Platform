"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, Play, Home, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

export default function OrderSuccessPage() {
  const [orderNumber] = useState(
    () =>
      `LGT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0")}`,
  )

  useEffect(() => {
    // Clear cart on successful order
    localStorage.removeItem("legato-cart")
  }, [])

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
          <div className="flex items-center justify-center">
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
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-12 w-12 text-green-400" />
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-white mb-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            Order Placed Successfully!
          </motion.h1>

          <motion.p
            className="text-xl text-white/70 mb-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </motion.p>

          {/* Order Details Card */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.6 }}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Order Number:</span>
                  <Badge className="bg-white/10 text-white border-white/20 font-mono">{orderNumber}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Estimated Delivery:</span>
                  <span className="text-white">3-5 business days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Order Status:</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Order Processing</h3>
                <p className="text-white/60 text-sm">Your order is being prepared for shipment</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Shipping</h3>
                <p className="text-white/60 text-sm">You'll receive tracking information via email</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Delivery</h3>
                <p className="text-white/60 text-sm">Your instruments will arrive safely</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8 }}
          >
            <Link href="/">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="mt-12 p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.9 }}
          >
            <h3 className="text-white font-semibold mb-2">Need Help?</h3>
            <p className="text-white/70 text-sm mb-4">
              If you have any questions about your order, feel free to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Email Support
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Live Chat
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Call Us
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
