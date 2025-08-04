"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2Icon } from "lucide-react"

interface Category {
  id: string
  name: string
}

export default function SellPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    originalPrice: "",
    condition: "",
    description: "",
    specifications: [{ key: "", value: "" }],
    features: [""],
    images: [""], // Placeholder for image URLs
    shippingInfo: { method: "", cost: "", estimatedDelivery: "" },
    warranty: "",
    returnPolicy: "",
    contactName: "",
    contactMethod: "",
    contactDetails: "",
    inStock: true,
    location: "",
    categoryId: "",
    sellerId: "seller_123", // Placeholder for actual seller ID from auth
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setCategories(data)
      } catch (e: any) {
        toast({
          title: "Error fetching categories",
          description: e.message,
          variant: "destructive",
        })
      }
    }
    fetchCategories()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSpecificationChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...formData.specifications]
    newSpecs[index] = { ...newSpecs[index], [field]: value }
    setFormData((prev) => ({ ...prev, specifications: newSpecs }))
  }

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }))
  }

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData((prev) => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({ ...prev, images: newImages }))
  }

  const addImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [id]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        // Filter out empty specifications, features, and images
        specifications: formData.specifications.filter((s) => s.key && s.value),
        features: formData.features.filter((f) => f),
        images: formData.images.filter((img) => img),
        // Convert shipping cost to number if it's not empty
        shippingInfo: {
          ...formData.shippingInfo,
          cost: formData.shippingInfo.cost ? Number.parseFloat(formData.shippingInfo.cost) : 0,
        },
      }

      const res = await fetch("/api/products/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      toast({
        title: "Product Submitted!",
        description: data.message,
      })
      // Optionally reset form
      setFormData({
        name: "",
        brand: "",
        price: "",
        originalPrice: "",
        condition: "",
        description: "",
        specifications: [{ key: "", value: "" }],
        features: [""],
        images: [""],
        shippingInfo: { method: "", cost: "", estimatedDelivery: "" },
        warranty: "",
        returnPolicy: "",
        contactName: "",
        contactMethod: "",
        contactDetails: "",
        inStock: true,
        location: "",
        categoryId: "",
        sellerId: "seller_123",
      })
    } catch (e: any) {
      toast({
        title: "Submission Failed",
        description: e.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold">Sell Your Product</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Provide basic information about your product.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="e.g., Wireless Bluetooth Headphones"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., Sony, Apple, Generic"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="99.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price ($) (Optional)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                placeholder="129.99"
                value={formData.originalPrice}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your product..."
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location (City, State/Country)</Label>
              <Input
                id="location"
                placeholder="e.g., New York, NY, USA"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, inStock: Boolean(checked) }))}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Add URLs for your product images (at least one).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Image URL"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  required={index === 0} // Make first image required
                />
                {formData.images.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)}>
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addImage}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Another Image
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Add key-value pairs for product specifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Key (e.g., Color)"
                  value={spec.key}
                  onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                />
                <Input
                  placeholder="Value (e.g., Black)"
                  value={spec.value}
                  onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                />
                {formData.specifications.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeSpecification(index)}>
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSpecification}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Specification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>List key features of your product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Feature description"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                />
                {formData.features.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Details about shipping for this product.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shippingMethod">Method</Label>
              <Input
                id="method"
                placeholder="e.g., Standard, Express"
                value={formData.shippingInfo.method}
                onChange={handleShippingInfoChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingCost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="5.00"
                value={formData.shippingInfo.cost}
                onChange={handleShippingInfoChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
              <Input
                id="estimatedDelivery"
                placeholder="e.g., 3-5 business days"
                value={formData.shippingInfo.estimatedDelivery}
                onChange={handleShippingInfoChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warranty & Returns</CardTitle>
            <CardDescription>Information about product warranty and return policy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty</Label>
              <Textarea
                id="warranty"
                placeholder="e.g., 1-year manufacturer warranty"
                value={formData.warranty}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnPolicy">Return Policy</Label>
              <Textarea
                id="returnPolicy"
                placeholder="e.g., 30-day free returns"
                value={formData.returnPolicy}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How buyers can contact you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Your Name"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.contactMethod}
                onValueChange={(value) => handleSelectChange("contactMethod", value)}
              >
                <SelectTrigger id="contactMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactDetails">Contact Details</Label>
              <Input
                id="contactDetails"
                placeholder="e.g., your@email.com or +1234567890"
                value={formData.contactDetails}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:col-span-2 lg:col-span-3" disabled={loading}>
          {loading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Product for Review"
          )}
        </Button>
      </form>
    </div>
  )
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}
