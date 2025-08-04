import { type NextRequest, NextResponse } from "next/server"

// Mock product data - in a real app, this would come from a database
const products = [
  {
    id: "1",
    name: "Yamaha FG830 Acoustic Guitar",
    brand: "Yamaha",
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
    contactName: "MusicStore Delhi",
    contactMethod: "Email",
    contactDetails: "delhi@musicstore.com",
    location: "New Delhi, India",
    submittedAt: "2 days ago",
    status: "approved",
  },
  {
    id: "2",
    name: "Roland TD-17KVX Electronic Drums",
    brand: "Roland",
    price: 85000,
    originalPrice: 95000,
    images: [
      "/placeholder.svg?height=600&width=600&text=Roland+Drums+Front",
      "/placeholder.svg?height=600&width=600&text=Roland+Drums+Side",
      "/placeholder.svg?height=600&width=600&text=Roland+Drums+Detail",
      "/placeholder.svg?height=600&width=600&text=Roland+Drums+Setup",
    ],
    rating: 4.9,
    reviews: 67,
    category: "Drums",
    condition: "Like New",
    description:
      "Professional electronic drum kit with mesh heads for realistic playing feel. The TD-17KVX features Roland's advanced V-Drums technology with high-quality sounds and responsive playing dynamics. Perfect for practice, recording, and live performance.",
    specifications: {
      "Kit Configuration": "5-piece electronic kit",
      "Sound Module": "TD-17",
      "Kick Pad": "KD-10 with fabric beater",
      "Snare Pad": "PDX-12 mesh head",
      "Tom Pads": "3x PDX-8 mesh heads",
      "Hi-Hat": "VH-10 with stand",
      "Crash Cymbal": "CY-12C",
      "Ride Cymbal": "CY-13R",
      Rack: "MDS-4V drum stand",
    },
    features: [
      "Mesh head pads for realistic feel",
      "Over 310 drum and percussion sounds",
      "50 preset drum kits",
      "Coach mode for skill development",
      "USB audio/MIDI connectivity",
      "Bluetooth audio streaming",
    ],
    inStock: 2,
    shipping: {
      free: false,
      cost: 2000,
      estimatedDays: "5-7 business days",
    },
    returnPolicy: "15-day return policy",
    warranty: "2 year manufacturer warranty",
    contactName: "DrumWorld Mumbai",
    contactMethod: "Phone",
    contactDetails: "9876543210",
    location: "Mumbai, India",
    submittedAt: "1 day ago",
    status: "approved",
  },
]

const reviews = [
  {
    id: "1",
    productId: "1",
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
    productId: "1",
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
    productId: "2",
    user: {
      name: "Amit Kumar",
      avatar: "/placeholder.svg?height=40&width=40&text=AK",
    },
    rating: 5,
    comment:
      "Amazing electronic drum kit! The mesh heads feel so realistic and the sound quality is outstanding. Perfect for apartment practice.",
    date: "3 weeks ago",
    verified: true,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const product = products.find((p) => p.id === productId)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const productReviews = reviews.filter((r) => r.productId === productId)

    return NextResponse.json({
      product,
      reviews: productReviews,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
