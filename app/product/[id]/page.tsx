"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  MapPin,
  Clock,
  Shield,
  Truck,
  RotateCcw,
  Play,
  ArrowLeft,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviews: number
  category: string
  condition: string
  seller: {
    name: string
    avatar: string
    rating: number
    totalSales: number
    joinedDate: string
    verified: boolean
  }
  location: string
  postedDate: string
  badge?: string
  description: string
  specifications: Record<string, string>
  features: string[]
  inStock: number
  shipping: {
    free: boolean
    cost?: number
    estimatedDays: string
  }
  returnPolicy: string
  warranty: string
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

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product)
          setReviews(data.reviews)
        } else {
          // Mock data for demo
          const mockProduct: Product = {
            id: params.id as string,
            name: "Yamaha FG830 Acoustic Guitar",
            price: 25000,
            originalPrice: 30000,
            images: [
              "/placeholder.svg?height=600&width=600&text=Yamaha+Guitar+Front",
              "/placeholder.svg?height=600&width=600&text=Yamaha+Guitar+Back",
              "/placeholder.svg?height=600&width=600&text=Yamaha+Guitar+Side",
              "/placeholder.svg?height=600&width=600&text=Yamaha+Guitar+Detail",
            ],
            rating: 4.8,
            reviews: 124,
            category: "Guitars",
            condition: "Excellent",
            seller: {
              name: "MusicStore Delhi",
              avatar: "/placeholder.svg?height=100&width=100&text=MS",
              rating: 4.9,
              totalSales: 1250,
              joinedDate: "2019",
              verified: true,
            },
            location: "New Delhi, India",
            postedDate: "2 days ago",
            badge: "Hot Deal",
            description:
              "This beautiful Yamaha FG830 acoustic guitar is in excellent condition and perfect for both beginners and intermediate players. The solid spruce top provides rich, resonant tone while the nato back and sides offer warm, balanced sound. Features include a rosewood fingerboard, die-cast tuners for stable tuning, and a comfortable neck profile that makes it easy to play for hours.",
            specifications: {
              "Body Type": "Dreadnought",
              "Top Wood": "Solid Spruce",
              "Back & Sides": "Nato",
              Neck: "Nato",
              Fingerboard: "Rosewood",
              "Scale Length": "25.6 inches",
              "Nut Width": "1.69 inches",
              Tuners: "Die-cast Chrome",
              Finish: "Natural Gloss",
              Strings: "D'Addario EXP16",
            },
            features: [
              "Solid spruce top for superior tone",
              "Scalloped bracing for enhanced resonance",
              "Rosewood fingerboard and bridge",
              "Die-cast tuners for stable tuning",
              "Comfortable neck profile",
              "Professional setup included",
            ],
            inStock: 3,
            shipping: {
              free: true,
              estimatedDays: "3-5 business days",
            },
            returnPolicy: "30-day return policy",
            warranty: "1 year manufacturer warranty",
          }

          const mockReviews: Review[] = [
            {
              id: "1",
              user: {
                name: "Rahul Sharma",
                avatar: "/placeholder.svg?height=40&width=40&text=RS",
              },
              rating: 5,
              comment:
                "Excellent guitar! The sound quality is amazing and it arrived in perfect condition. Highly recommended for anyone looking for a quality acoustic guitar.",
              date: "2 weeks ago",
              verified: true,
            },
            {
              id: "2",
              user: {
                name: "Priya Patel",
                avatar: "/placeholder.svg?height=40&width=40&text=PP",
              },
              rating: 4,
              comment:
                "Great guitar for the price. The tone is rich and the build quality is solid. Only minor issue was the setup could have been better, but overall very satisfied.",
              date: "1 month ago",
              verified: true,
            },
            {
              id: "3",
              user: {
                name: "Amit Kumar",
                avatar: "/placeholder.svg?height=40&width=40&text=AK",
              },
              rating: 5,
              comment:
                "Perfect for beginners and intermediate players. The seller was very responsive and the guitar was exactly as described. Fast shipping too!",
              date: "3 weeks ago",
              verified: false,
            },
          ]

          setProduct(mockProduct)
          setReviews(mockReviews)
        }

        // Check if product is in wishlist
        const savedWishlist = localStorage.getItem("legato-wishlist")
        if (savedWishlist) {
          const wishlist = JSON.parse(savedWishlist)
          setIsWishlisted(wishlist.some((item: any) => item.id === params.id))
        }

        // Get cart count
        const savedCart = localStorage.getItem("legato-cart")
        if (savedCart) {
          const cart = JSON.parse(savedCart)
          setCartCount(cart.length || 0)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-16 w-16 animate-spin text-white mx-auto" />
          <p className="mt-4 text-white/80">Loading product details...</p>
        </motion.div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <Link href="/marketplace">
            <Button className="bg-white text-black hover:bg-gray-200">Back to Marketplace</Button>
          </Link>
        </div>
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
            <div className="flex items-center space-x-4">
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
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-white text-black font-semibold">{product.badge}</Badge>
              )}
              <Badge className="absolute top-4 right-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                {product.condition}
              </Badge>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-white" : "border-white/20"
                  }`}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg text-white/80 ml-1">{product.rating}</span>
                  <span className="text-white/50 ml-1">({product.reviews} reviews)</span>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {product.category}
                </Badge>
              </div>

              <div className="flex items-center space-x-6 text-sm text-white/60 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {product.postedDate}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-white">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-white/50 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {product.originalPrice && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={product.seller.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{product.seller.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{product.seller.name}</h3>
                        {product.seller.verified && <Shield className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {product.seller.rating}
                        </div>
                        <span>{product.seller.totalSales} sales</span>
                        <span>Since {product.seller.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-white/80">Quantity:</span>
                <div className="flex items-center border border-white/20 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-white">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.inStock, quantity + 1))}
                    disabled={quantity >= product.inStock}
                    className="hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-white/60">{product.inStock} in stock</span>
              </div>

              <div className="flex space-x-4">
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold py-3"
                    onClick={buyNow}
                  >
                    Buy Now
                  </Button>
                </motion.div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                  onClick={toggleWishlist}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  onClick={shareProduct}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Shipping & Returns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-green-400" />
                <div>
                  <div className="text-white">
                    {product.shipping.free ? "Free Shipping" : `₹${product.shipping.cost} Shipping`}
                  </div>
                  <div className="text-white/60">{product.shipping.estimatedDays}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-white">Easy Returns</div>
                  <div className="text-white/60">{product.returnPolicy}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="text-white">Warranty</div>
                  <div className="text-white/60">{product.warranty}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Reviews ({product.reviews})
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Shipping
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-white/80 leading-relaxed mb-6">{product.description}</p>
                  <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80">
                        <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">{key}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Rating Summary */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-4xl font-bold text-white">{product.rating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.floor(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/60">{product.reviews} reviews</p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm text-white/60 w-8">{rating}★</span>
                            <Progress value={rating === 5 ? 70 : rating === 4 ? 20 : 5} className="w-24" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{review.user.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-white">{review.user.name}</h4>
                                {review.verified && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                                  >
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-white/60">{review.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Shipping Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">Shipping Cost</span>
                          <span className="text-white">
                            {product.shipping.free ? "Free" : `₹${product.shipping.cost}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Estimated Delivery</span>
                          <span className="text-white">{product.shipping.estimatedDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Ships From</span>
                          <span className="text-white">{product.location}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-white/10" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Return Policy</h3>
                      <p className="text-white/80">{product.returnPolicy}</p>
                    </div>
                    <Separator className="bg-white/10" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Warranty</h3>
                      <p className="text-white/80">{product.warranty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
