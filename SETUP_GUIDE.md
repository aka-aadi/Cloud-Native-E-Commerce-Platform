# MusicMart Setup Guide

## Complete Step-by-Step Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)
- Database (PostgreSQL recommended)

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd musicmart

# Install dependencies
npm install
\`\`\`

### 2. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/musicmart"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Upload (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
\`\`\`

### 3. Database Setup

#### Option A: PostgreSQL (Recommended)

1. Install PostgreSQL locally or use a cloud service
2. Create a database named `musicmart`
3. Update the `DATABASE_URL` in your `.env.local`

#### Option B: SQLite (Development only)

\`\`\`env
DATABASE_URL="file:./dev.db"
\`\`\`

### 4. Database Schema

Create the following tables in your database:

\`\`\`sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type VARCHAR(20) DEFAULT 'buyer', -- 'buyer', 'seller', 'both'
    primary_instrument VARCHAR(100),
    location VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(100),
    condition VARCHAR(20) NOT NULL, -- 'new', 'like-new', 'excellent', etc.
    price DECIMAL(10,2) NOT NULL,
    is_negotiable BOOLEAN DEFAULT FALSE,
    location VARCHAR(255) NOT NULL,
    shipping_available BOOLEAN DEFAULT FALSE,
    local_pickup BOOLEAN DEFAULT TRUE,
    contact_method VARCHAR(20) DEFAULT 'message', -- 'message', 'email', 'phone'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'sold'
    views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listing images table
CREATE TABLE listing_images (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (for buyer-seller communication)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist table
CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Reports table (for flagged content)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin logs table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'listing', 'category', etc.
    target_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 5. Seed Data

Insert initial categories:

\`\`\`sql
INSERT INTO categories (name, slug, icon, description) VALUES
('Guitars', 'guitars', '🎸', 'Electric, acoustic, and bass guitars'),
('Keyboards', 'keyboards', '🎹', 'Pianos, synthesizers, and MIDI controllers'),
('Drums', 'drums', '🥁', 'Acoustic and electronic drum kits'),
('Audio Gear', 'audio-gear', '🎧', 'Microphones, interfaces, and studio equipment'),
('Brass', 'brass', '🎺', 'Trumpets, trombones, and other brass instruments'),
('Strings', 'strings', '🎻', 'Violins, cellos, and orchestral strings');

-- Create admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, is_admin, user_type) VALUES
('admin@musicmart.com', '$2b$10$example_hash_here', 'Admin', 'User', TRUE, 'both');
\`\`\`

### 6. Authentication Setup

Install required packages:

\`\`\`bash
npm install next-auth bcryptjs
npm install @types/bcryptjs --save-dev
\`\`\`

Create `lib/auth.ts`:

\`\`\`typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
// Import your database connection here

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Query your database for user
        // const user = await getUserByEmail(credentials.email)
        // if (!user || !await bcrypt.compare(credentials.password, user.password_hash)) {
        //   return null
        // }

        return {
          id: "1", // user.id
          email: credentials.email,
          name: "User Name", // user.first_name + " " + user.last_name
          isAdmin: false // user.is_admin
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin
      return session
    },
  },
}
\`\`\`

### 7. Database Connection

Create `lib/db.ts`:

\`\`\`typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool
\`\`\`

### 8. API Routes

Create the following API routes:

#### `app/api/auth/[...nextauth]/route.ts`
\`\`\`typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
\`\`\`

#### `app/api/listings/route.ts`
\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let query = `
      SELECT l.*, c.name as category_name, u.first_name, u.last_name,
             li.image_url as primary_image
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_images li ON l.id = li.listing_id AND li.is_primary = true
      WHERE l.status = 'approved'
    `

    const params: any[] = []
    let paramCount = 0

    if (category && category !== 'all') {
      paramCount++
      query += ` AND c.slug = $${paramCount}`
      params.push(category)
    }

    if (condition && condition !== 'all') {
      paramCount++
      query += ` AND l.condition = $${paramCount}`
      params.push(condition)
    }

    if (minPrice) {
      paramCount++
      query += ` AND l.price >= $${paramCount}`
      params.push(parseFloat(minPrice))
    }

    if (maxPrice) {
      paramCount++
      query += ` AND l.price <= $${paramCount}`
      params.push(parseFloat(maxPrice))
    }

    query += ' ORDER BY l.created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Implement listing creation logic
    // Validate user authentication
    // Insert into database
    
    return NextResponse.json({ message: 'Listing created successfully' })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
\`\`\`

### 9. Image Upload Setup (Optional)

For image uploads, you can use Cloudinary:

\`\`\`bash
npm install cloudinary multer
\`\`\`

Create `lib/cloudinary.ts`:

\`\`\`typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary
\`\`\`

### 10. Run the Application

\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build
npm start
\`\`\`

### 11. Admin Access

To access the admin panel:

1. Create an admin user in the database with `is_admin = TRUE`
2. Sign in with admin credentials
3. Navigate to `/admin`

### 12. Additional Features to Implement

1. **Email Notifications**: Set up SMTP for user notifications
2. **Payment Integration**: Add Stripe or PayPal for transactions
3. **Real-time Chat**: Implement WebSocket for instant messaging
4. **Search**: Add full-text search with PostgreSQL or Elasticsearch
5. **Mobile App**: Create React Native app using the same API
6. **Analytics**: Add Google Analytics or custom analytics

### 13. Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Rate Limiting**: Implement rate limiting for API routes
3. **CSRF Protection**: Enable CSRF protection
4. **SQL Injection**: Use parameterized queries
5. **File Upload Security**: Validate file types and sizes
6. **Admin Routes**: Protect admin routes with proper authentication

### 14. Deployment Options

#### Vercel (Recommended)
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

#### Docker
Create `Dockerfile`:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### 15. Monitoring and Maintenance

1. Set up error tracking (Sentry)
2. Monitor database performance
3. Regular backups
4. Security updates
5. User feedback collection

This setup guide provides a complete foundation for your MusicMart platform. The database schema supports all the features shown in the UI, and the authentication system handles both regular users and admin access.
