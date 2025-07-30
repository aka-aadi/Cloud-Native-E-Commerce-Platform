"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Music, Upload, DollarSign, Camera, MapPin, Package } from "lucide-react"
import Link from "next/link"

export default function SellPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulate image upload
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, 8)) // Max 8 images
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <Music className="h-6 w-6 mr-2 text-blue-400" />
              MusicMart
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/marketplace">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Sell Your Music Gear</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Turn your unused instruments and equipment into cash. Join thousands of musicians trading gear on
              MusicMart.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-6">
                <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Best Prices</h3>
                <p className="text-gray-400">Get top dollar for your gear with our competitive marketplace</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-6">
                <Package className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Easy Listing</h3>
                <p className="text-gray-400">List your items in minutes with our simple selling process</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Local & Global</h3>
                <p className="text-gray-400">Reach buyers in your area or ship worldwide</p>
              </CardContent>
            </Card>
          </div>

          {/* Listing Form */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Create Your Listing</CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the details below to list your music gear for sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Basic Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-300">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Fender Player Stratocaster Electric Guitar"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-gray-300">
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        placeholder="e.g., Fender, Gibson, Yamaha"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-300">
                        Category *
                      </Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="guitars">Guitars</SelectItem>
                          <SelectItem value="bass">Bass Guitars</SelectItem>
                          <SelectItem value="keyboards">Keyboards & Pianos</SelectItem>
                          <SelectItem value="drums">Drums & Percussion</SelectItem>
                          <SelectItem value="audio">Audio Equipment</SelectItem>
                          <SelectItem value="brass">Brass Instruments</SelectItem>
                          <SelectItem value="strings">String Instruments</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-gray-300">
                        Condition *
                      </Label>
                      <Select value={condition} onValueChange={setCondition} required>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="very-good">Very Good</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item in detail. Include any modifications, wear, included accessories, etc."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-32"
                      required
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Photos</h3>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">Upload photos of your item</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Add up to 8 photos. First photo will be the main image.
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Photos
                        </Button>
                      </Label>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-600"
                            />
                            {index === 0 && <Badge className="absolute top-1 left-1 bg-blue-600 text-xs">Main</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Pricing & Location</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-300">
                        Price (USD) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-300">
                        Location *
                      </Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="negotiable" />
                      <Label htmlFor="negotiable" className="text-gray-300">
                        Price is negotiable
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="shipping" />
                      <Label htmlFor="shipping" className="text-gray-300">
                        Willing to ship (buyer pays shipping)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="local-pickup" />
                      <Label htmlFor="local-pickup" className="text-gray-300">
                        Local pickup available
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Contact Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-gray-300">
                        Your Name *
                      </Label>
                      <Input
                        id="contact-name"
                        placeholder="How buyers should address you"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-method" className="text-gray-300">
                        Preferred Contact Method *
                      </Label>
                      <Select required>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="How should buyers contact you?" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="message">MusicMart Messages</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-gray-300">
                      I agree to the{" "}
                      <Link href="#" className="text-blue-400 hover:text-blue-300">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-blue-400 hover:text-blue-300">
                        Seller Guidelines
                      </Link>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="authentic" required />
                    <Label htmlFor="authentic" className="text-gray-300">
                      I confirm this item is authentic and accurately described
                    </Label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Listing..." : "Create Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gray-800/50 border-gray-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Selling Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Great Photos</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Use natural lighting when possible</li>
                    <li>• Show all angles and any wear/damage</li>
                    <li>• Include close-ups of important details</li>
                    <li>• Clean your instrument before photographing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Detailed Descriptions</h4>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Include model numbers and specifications</li>
                    <li>• Mention any modifications or repairs</li>
                    <li>• List included accessories and cases</li>
                    <li>• Be honest about condition and wear</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
