"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  condition: string
  description: string
  specifications: { [key: string]: string }
  features: string[]
  images: string[]
  shipping: {
    method: string
    cost: number
    estimatedDelivery: string
  }
  warranty: string
  returnPolicy: string
  contactName: string
  contactMethod: string
  contactDetails: string
  inStock: boolean
  location: string
  submittedAt: string
  status: string
  category: string
}

interface Review {
  id: string
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
  verified: boolean
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setProduct(data.product)
        setReviews(data.reviews)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const addToCart = () => {
    if (!product) return

    const savedCart = localStorage.getItem("legato-cart")
    const cart = savedCart ? JSON.parse(savedCart) : []

    // Add product with quantity
    for (let i = 0; i < quantity; i++) {
      cart.push({ ...product, addedAt: new Date().toISOString() })
    }

    localStorage.setItem("legato-cart", JSON.stringify(cart))
    setCartCount(cart.length)
    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const buyNow = () => {
    if (!product) return

    // Add to cart first
    addToCart()

    // Navigate to checkout
    router.push("/checkout")
  }

  const toggleWishlist = () => {
    if (!product) return

    const savedWishlist = localStorage.getItem("legato-wishlist")
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : []

    if (isWishlisted) {
      const updatedWishlist = wishlist.filter((item: any) => item.id !== product.id)
      localStorage.setItem("legato-wishlist", JSON.stringify(updatedWishlist))
      setIsWishlisted(false)
      toast.success("Removed from wishlist")
    } else {
      wishlist.push(product)
      localStorage.setItem("legato-wishlist", JSON.stringify(wishlist))
      setIsWishlisted(true)
      toast.success("Added to wishlist")
    }
  }

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out this ${product?.name} on Legato`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>
  }

  if (!product) {
    return <div className="text-center text-gray-500">Product not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
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
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <motion.path d="M19 12H6M12 5l-7 7m7-7l7 7" />
                </motion.svg>
              </Button>
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  className="h-10 w-10 bg-gradient-to-br from-white to-gray-300 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-black ml-0.5"
                  >
                    <motion.path d="M12 2L2 22h20L12 2z" />
                  </motion.svg>
                </motion.div>
                <motion.span
                  className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  Legato
                </motion.span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <motion.path d="M6 2L18 22M18 2L6 22M12 12L18 2M6 22L12 18M12 18L6 2" />
                </motion.svg>
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
              <Link href="/auth">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center">
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      alt={`Product image ${index + 1}`}
                      className="object-cover"
                      src={image || "/placeholder.svg"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">{product.brand}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through dark:text-gray-400">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Condition: <span className="font-semibold capitalize">{product.condition}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Location: <span className="font-semibold">{product.location}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Status: <span className="font-semibold capitalize">{product.status}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Category: <span className="font-semibold capitalize">{product.category}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Submitted: <span className="font-semibold">{new Date(product.submittedAt).toLocaleDateString()}</span>
            </p>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            <Button size="lg" className="flex-1" onClick={addToCart}>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-5 w-5"
              >
                <motion.path d="M6 2L18 22M18 2L6 22M12 12L18 2M6 22L12 18M12 18L6 2" />
              </motion.svg>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1 bg-transparent" onClick={buyNow}>
              Buy Now
            </Button>
          </div>
          <Separator />
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <div className="prose dark:prose-invert">
                <p>{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <>
                    <h3 className="mt-4 text-lg font-semibold">Features:</h3>
                    <ul className="list-disc pl-5">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="pt-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.specifications &&
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Shipping Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Method: {product.shipping.method} (Cost: ${product.shipping.cost.toFixed(2)})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated Delivery: {product.shipping.estimatedDelivery}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold">Warranty</h3>
                  <p className="text-sm text-muted-foreground">{product.warranty}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold">Return Policy</h3>
                  <p className="text-sm text-muted-foreground">{product.returnPolicy}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold">Seller Information</h3>
            <p className="text-sm text-muted-foreground">Name: {product.contactName}</p>
            <p className="text-sm text-muted-foreground">
              Contact: {product.contactDetails} ({product.contactMethod})
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
