"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("legato-cart")
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        setCartCount(cart.length || 0)
      }
    }

    // Initial load
    updateCartCount()

    // Listen for storage changes
    window.addEventListener("storage", updateCartCount)

    // Listen for custom cart update events
    window.addEventListener("cartUpdated", updateCartCount)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", updateCartCount)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
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

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace" className="text-white/80 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/sell" className="text-white/80 hover:text-white transition-colors">
              Sell
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart">
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
            </Link>
            <Link href="/auth">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth?register=true" className="hidden sm:block">
              <Button className="bg-white text-black hover:bg-gray-200">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
