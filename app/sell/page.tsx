"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Play, Upload, DollarSign, Camera, MapPin, Package, Loader2, Plus, Minus, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"

interface Specification {
  key: string
  value: string
}

export default function SellPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: "", value: "" }])
  const [features, setFeatures] = useState<string[]>([""])
  const [shippingMethod, setShippingMethod] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)

    // Collect all form data
    const productData = {
      title: formData.get("title") as string,
      brand: formData.get("brand") as string,
      category: category,
      condition: condition,
      description: formData.get("description") as string,
      price: Number.parseInt(formData.get("price") as string),
      originalPrice: formData.get("original-price") ? Number.parseInt(formData.get("original-price") as string) : null,
      location: formData.get("location") as string,
      negotiable: formData.get("negotiable") === "on",
      shipping: {
        method: shippingMethod,
        freeShipping: formData.get("free-shipping") === "on",
        cost: formData.get("shipping-cost") ? Number.parseInt(formData.get("shipping-cost") as string) : 0,
        estimatedDays: formData.get("estimated-days") as string,
        localPickup: formData.get("local-pickup") === "on",
        nationwide: formData.get("nationwide-shipping") === "on",
      },
      specifications: specifications.filter((spec) => spec.key && spec.value),
      features: features.filter((feature) => feature.trim()),
      images: images,
      warranty: formData.get("warranty") as string,
      returnPolicy: formData.get("return-policy") as string,
      contactName: formData.get("contact-name") as string,
      contactMethod: formData.get("contact-method") as string,
      contactDetails: formData.get("contact-details") as string,
      inStock: Number.parseInt(formData.get("stock-quantity") as string) || 1,
    }

    try {
      const response = await fetch("/api/products/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("Product submitted successfully!", {
          description: `Your listing "${productData.title}" has been submitted for admin review. You'll be notified once it's approved.`,
        })

        // Reset form
        formRef.current?.reset()
        setCategory("")
        setCondition("")
        setImages([])
        setSpecifications([{ key: "", value: "" }])
        setFeatures([""])
        setShippingMethod("")

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        throw new Error("Failed to submit product")
      }
    } catch (error) {
      toast.error("Failed to submit product", {
        description: "Please check all fields and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, 8)) // Max 8 images
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }])
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    setSpecifications((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    setFeatures((prev) => [...prev, ""])
  }

  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((feature, i) => (i === index ? value : feature)))
  }

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
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
            <div className="flex items-center space-x-4">
              <Link href="/marketplace">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">Sell Your Instruments</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Create a detailed listing for your instrument. All submissions are reviewed by our team before going live.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <DollarSign className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Best Prices</h3>
                <p className="text-white/70 text-center">
                  Get top value for your gear with our competitive marketplace
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <Package className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Quality Control</h3>
                <p className="text-white/70 text-center">All listings are reviewed by our team for quality assurance</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2 text-center">Trusted Platform</h3>
                <p className="text-white/70 text-center">Secure transactions with buyer and seller protection</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Listing Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Create Your Listing</CardTitle>
                <CardDescription className="text-white/70">
                  Provide detailed information about your instrument. Complete listings get approved faster.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                      Basic Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white/80">
                          Product Title *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Fender Player Stratocaster Electric Guitar"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand" className="text-white/80">
                          Brand *
                        </Label>
                        <Input
                          id="brand"
                          name="brand"
                          placeholder="e.g., Fender, Gibson, Yamaha"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-white/80">
                          Category *
                        </Label>
                        <Select value={category} name="category" onValueChange={setCategory} required>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="guitars">Guitars</SelectItem>
                            <SelectItem value="bass">Bass Guitars</SelectItem>
                            <SelectItem value="keyboards">Keyboards & Pianos</SelectItem>
                            <SelectItem value="drums">Drums & Percussion</SelectItem>
                            <SelectItem value="traditional">Traditional Instruments</SelectItem>
                            <SelectItem value="audio">Audio Equipment</SelectItem>
                            <SelectItem value="brass">Brass Instruments</SelectItem>
                            <SelectItem value="strings">String Instruments</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-white/80">
                          Condition *
                        </Label>
                        <Select value={condition} name="condition" onValueChange={setCondition} required>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
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
                      <Label htmlFor="description" className="text-white/80">
                        Detailed Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Provide a detailed description of your instrument. Include its history, any modifications, wear and tear, included accessories, etc. The more details, the better!"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-32"
                        required
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Photos *</h3>

                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                        <Camera className="h-12 w-12 text-white/60 mx-auto mb-4" />
                        <p className="text-white/80 mb-2">Upload high-quality photos of your instrument</p>
                        <p className="text-sm text-white/50 mb-4">
                          Add up to 8 photos. Include front, back, sides, and detail shots. First photo will be the main
                          image.
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
                            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Photos
                          </Button>
                        </Label>
                      </div>

                      {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-white/20"
                              />
                              {index === 0 && (
                                <Badge className="absolute top-1 left-1 bg-white text-black text-xs">Main</Badge>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Specifications</h3>
                    <p className="text-white/60 text-sm">Add technical specifications for your instrument</p>

                    <div className="space-y-4">
                      {specifications.map((spec, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-white/80">Specification Name</Label>
                            <Input
                              placeholder="e.g., Body Type, Scale Length"
                              value={spec.key}
                              onChange={(e) => updateSpecification(index, "key", e.target.value)}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/80">Value</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., Dreadnought, 25.5 inches"
                                value={spec.value}
                                onChange={(e) => updateSpecification(index, "value", e.target.value)}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                              />
                              {specifications.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeSpecification(index)}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSpecification}
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Specification
                      </Button>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Key Features</h3>
                    <p className="text-white/60 text-sm">Highlight the main features and selling points</p>

                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="e.g., Solid spruce top for superior tone"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                          {features.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeFeature(index)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFeature}
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                      Pricing & Inventory
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-white/80">
                          Selling Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="100"
                          placeholder="25000"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="original-price" className="text-white/80">
                          Original Price (₹)
                        </Label>
                        <Input
                          id="original-price"
                          name="original-price"
                          type="number"
                          step="100"
                          placeholder="30000"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock-quantity" className="text-white/80">
                          Quantity Available *
                        </Label>
                        <Input
                          id="stock-quantity"
                          name="stock-quantity"
                          type="number"
                          min="1"
                          placeholder="1"
                          defaultValue="1"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="negotiable" name="negotiable" />
                      <Label htmlFor="negotiable" className="text-white/80">
                        Price is negotiable
                      </Label>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                      Shipping & Delivery
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white/80">
                          Your Location *
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="City, State"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping-method" className="text-white/80">
                          Shipping Method *
                        </Label>
                        <Select
                          value={shippingMethod}
                          name="shipping-method"
                          onValueChange={setShippingMethod}
                          required
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select shipping method" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="standard">Standard Shipping</SelectItem>
                            <SelectItem value="express">Express Shipping</SelectItem>
                            <SelectItem value="pickup-only">Local Pickup Only</SelectItem>
                            <SelectItem value="both">Both Shipping & Pickup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shipping-cost" className="text-white/80">
                          Shipping Cost (₹)
                        </Label>
                        <Input
                          id="shipping-cost"
                          name="shipping-cost"
                          type="number"
                          placeholder="500"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimated-days" className="text-white/80">
                          Estimated Delivery *
                        </Label>
                        <Input
                          id="estimated-days"
                          name="estimated-days"
                          placeholder="3-5 business days"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="free-shipping" name="free-shipping" />
                        <Label htmlFor="free-shipping" className="text-white/80">
                          Offer free shipping
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="local-pickup" name="local-pickup" />
                        <Label htmlFor="local-pickup" className="text-white/80">
                          Local pickup available
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="nationwide-shipping" name="nationwide-shipping" />
                        <Label htmlFor="nationwide-shipping" className="text-white/80">
                          Ship nationwide
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Warranty & Returns */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                      Warranty & Returns
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warranty" className="text-white/80">
                          Warranty Information
                        </Label>
                        <Input
                          id="warranty"
                          name="warranty"
                          placeholder="e.g., 1 year manufacturer warranty"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="return-policy" className="text-white/80">
                          Return Policy
                        </Label>
                        <Input
                          id="return-policy"
                          name="return-policy"
                          placeholder="e.g., 7-day return policy"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
                      Contact Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-white/80">
                          Your Name *
                        </Label>
                        <Input
                          id="contact-name"
                          name="contact-name"
                          placeholder="How buyers should address you"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-method" className="text-white/80">
                          Preferred Contact Method *
                        </Label>
                        <Select name="contact-method" required>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="How should buyers contact you?" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="message">Legato Messages</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-details" className="text-white/80">
                        Contact Details *
                      </Label>
                      <Input
                        id="contact-details"
                        name="contact-details"
                        placeholder="Email address, phone number, or WhatsApp number"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" name="terms" required />
                      <Label htmlFor="terms" className="text-white/80">
                        I agree to the{" "}
                        <Link href="#" className="text-white hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-white hover:underline">
                          Seller Guidelines
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="authentic" name="authentic" required />
                      <Label htmlFor="authentic" className="text-white/80">
                        I confirm this item is authentic and accurately described
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="review-policy" name="review-policy" required />
                      <Label htmlFor="review-policy" className="text-white/80">
                        I understand that my listing will be reviewed by admin before going live
                      </Label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold py-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting for Review...
                        </>
                      ) : (
                        "Submit for Review"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      Save as Draft
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
