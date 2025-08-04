"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [id]: value }))
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setCardDetails((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Shipping Address:", shippingAddress)
    console.log("Payment Method:", paymentMethod)
    if (paymentMethod === "credit_card") {
      console.log("Card Details:", cardDetails)
    }
    // Simulate order placement
    alert("Order placed successfully!")
    // Redirect to order success page
    window.location.href = "/order-success"
  }

  // Dummy cart items for summary
  const cartItems = [
    { id: "1", name: "Wireless Headphones", price: 120.0, quantity: 1 },
    { id: "2", name: "Smartwatch", price: 250.0, quantity: 2 },
  ]
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = 10.0
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const total = subtotal + shippingCost + tax

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your shipping address details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={shippingAddress.fullName}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  placeholder="123 Main St"
                  value={shippingAddress.address1}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                  id="address2"
                  placeholder="Apartment, suite, unit, etc."
                  value={shippingAddress.address2}
                  onChange={handleShippingChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Zip / Postal Code</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  value={shippingAddress.zip}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Select your preferred payment method.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "credit_card" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="XXX" value={cardDetails.cvv} onChange={handleCardChange} required />
                  </div>
                </div>
              )}
              {paymentMethod === "paypal" && (
                <div className="text-center py-4">
                  <Button variant="outline">Pay with PayPal</Button>
                </div>
              )}
              {paymentMethod === "bank_transfer" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Please transfer the total amount to the following bank details:
                  </p>
                  <Textarea readOnly value="Bank Name: Example Bank\nAccount: 1234567890\nSWIFT: EXABANK" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex items-center justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax ({taxRate * 100}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
