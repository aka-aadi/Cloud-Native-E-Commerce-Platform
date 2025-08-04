"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MinusIcon, PlusIcon, XIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Wireless Headphones",
      price: 120.0,
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
    },
    {
      id: "2",
      name: "Smartwatch",
      price: 250.0,
      image: "/placeholder.svg?height=100&width=100",
      quantity: 2,
    },
    {
      id: "3",
      name: "Gaming Mouse",
      price: 50.0,
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
    },
  ])

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 10.0 // Example shipping cost
  const taxRate = 0.08 // Example tax rate
  const tax = subtotal * taxRate
  const total = subtotal + shipping + tax

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Your cart is empty.{" "}
          <Link href="/marketplace" className="text-blue-600 hover:underline">
            Start shopping!
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 sm:gap-6 md:p-6">
                    <Image
                      alt={item.name}
                      className="aspect-square rounded-md object-cover"
                      height={100}
                      src={item.image || "/placeholder.svg"}
                      width={100}
                    />
                    <div className="grid flex-1 gap-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-lg font-medium">{item.quantity}</span>
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                      <XIcon className="h-5 w-5 text-gray-500" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax ({taxRate * 100}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
