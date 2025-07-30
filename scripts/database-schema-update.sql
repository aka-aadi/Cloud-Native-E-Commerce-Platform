-- Add new columns to products table for seller workflow
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_method VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS contact_details VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_info JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS return_policy VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update status enum to include pending, approved, rejected
ALTER TABLE products ALTER COLUMN status TYPE VARCHAR(20);

-- Create admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_approved_at ON products(approved_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- Update existing products to approved status (for existing data)
UPDATE products SET status = 'approved' WHERE status = 'active';
