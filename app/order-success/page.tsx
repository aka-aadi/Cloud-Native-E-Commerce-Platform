"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircleIcon } from "lucide-react"
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-white mb-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            Order Placed Successfully!
          </motion.h1>
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.6 }}>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-center">
                    {/* Order Details Card */}
                    <motion.div
                      className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <motion.div className="h-6 w-6 text-blue-400">{/* Package Icon */}</motion.div>
                    </motion.div>
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Order Number:</span>
                    <motion.div className="bg-white/10 text-white border-white/20 font-mono">
                      {/* Badge Component */}
                      {orderNumber}
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Estimated Delivery:</span>
                    <span className="text-white">3-5 business days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Order Status:</span>
                    <motion.div className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                      {/* Badge Component */}
                      Processing
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <motion.div className="h-6 w-6 text-orange-400">{/* Truck Icon */}</motion.div>
                </motion.div>
                <motion.h3
                  className="text-white font-semibold mb-2"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  Shipping
                </motion.h3>
                <motion.p
                  className="text-white/60 text-sm"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                >
                  You'll receive tracking information via email
                </motion.p>
              </CardContent>
            </motion.div>
            <motion.div className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <motion.div className="h-6 w-6 text-green-400">{/* CheckCircle Icon */}</motion.div>
                </motion.div>
                <motion.h3
                  className="text-white font-semibold mb-2"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                >
                  Delivery
                </motion.h3>
                <motion.p
                  className="text-white/60 text-sm"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.5 }}
                >
                  Your instruments will arrive safely
                </motion.p>
              </CardContent>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8 }}
          >
            <Link href="/">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                {/* Back to Home Button */}
                Home
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
              >
                {/* Continue Shopping Button */}
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
              >
                {/* View Order Details Button */}
                View Order Details
              </Button>
            </Link>
          </motion.div>
          <motion.div
            className="mt-12 p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.9 }}
          >
            <motion.h3
              className="text-white font-semibold mb-2"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              Need Help?
            </motion.h3>
            <motion.p
              className="text-white/70 text-sm mb-4"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              If you have any questions about your order, feel free to contact us.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.8 }}
            >
              <Button variant="ghost" className="text-white hover:bg-white/10">
                {/* Email Support Button */}
                Email Support
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                {/* Live Chat Button */}
                Live Chat
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                {/* Call Us Button */}
                Call Us
              </Button>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.p
            className="text-lg font-semibold"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            Order ID: #{orderNumber}
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
            You will receive an email confirmation with details of your order.
          </motion.p>
          <motion.div
            className="flex flex-col gap-2"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8 }}
          >
            <Link href="/marketplace">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                {/* Continue Shopping Button */}
                Continue Shopping
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8"
              >
                {/* View Order Details Button */}
                View Order Details
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
