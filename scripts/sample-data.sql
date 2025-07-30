-- Insert sample categories
INSERT INTO categories (name, slug, description, icon_name, color, sort_order) VALUES
('Guitars', 'guitars', 'Acoustic and electric guitars', 'guitar', 'bg-orange-500', 1),
('Keyboards', 'keyboards', 'Digital pianos and synthesizers', 'piano', 'bg-blue-500', 2),
('Drums', 'drums', 'Acoustic and electronic drum kits', 'drum', 'bg-red-500', 3),
('Audio Gear', 'audio-gear', 'Microphones and recording equipment', 'mic', 'bg-green-500', 4),
('Traditional', 'traditional', 'Tabla, sitar, and classical instruments', 'music', 'bg-yellow-500', 5),
('Strings', 'strings', 'Violin, cello, and string instruments', 'violin', 'bg-purple-500', 6);

-- Insert sample users
INSERT INTO users (email, name, phone, location, bio, verified) VALUES
('seller1@legato.com', 'Mumbai Music Store', '+91-9876543210', 'Mumbai, Maharashtra', 'Premium music instruments dealer since 1995', true),
('seller2@legato.com', 'Delhi Instruments', '+91-9876543211', 'New Delhi, Delhi', 'Authorized dealer for top music brands', true),
('seller3@legato.com', 'Bangalore Audio Hub', '+91-9876543212', 'Bangalore, Karnataka', 'Professional audio equipment specialists', true),
('seller4@legato.com', 'Chennai Drums', '+91-9876543213', 'Chennai, Tamil Nadu', 'Complete drum solutions and accessories', true),
('seller5@legato.com', 'Kolkata Classical', '+91-9876543214', 'Kolkata, West Bengal', 'Traditional Indian instruments expert', true),
('seller6@legato.com', 'Pune Guitar Center', '+91-9876543215', 'Pune, Maharashtra', 'Guitar specialists with repair services', true),
('buyer1@legato.com', 'Rahul Sharma', '+91-9876543216', 'Gurgaon, Haryana', 'Music enthusiast and guitarist', false),
('buyer2@legato.com', 'Priya Patel', '+91-9876543217', 'Ahmedabad, Gujarat', 'Classical music student', false),
('admin@legato.com', 'Legato Admin', '+91-9876543218', 'Mumbai, Maharashtra', 'Platform administrator', true);

-- Get category and user IDs for foreign key references
DO $$
DECLARE
    guitar_cat_id UUID;
    keyboard_cat_id UUID;
    drum_cat_id UUID;
    audio_cat_id UUID;
    traditional_cat_id UUID;
    strings_cat_id UUID;
    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
    seller4_id UUID;
    seller5_id UUID;
    seller6_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO guitar_cat_id FROM categories WHERE slug = 'guitars';
    SELECT id INTO keyboard_cat_id FROM categories WHERE slug = 'keyboards';
    SELECT id INTO drum_cat_id FROM categories WHERE slug = 'drums';
    SELECT id INTO audio_cat_id FROM categories WHERE slug = 'audio-gear';
    SELECT id INTO traditional_cat_id FROM categories WHERE slug = 'traditional';
    SELECT id INTO strings_cat_id FROM categories WHERE slug = 'strings';
    
    -- Get seller IDs
    SELECT id INTO seller1_id FROM users WHERE email = 'seller1@legato.com';
    SELECT id INTO seller2_id FROM users WHERE email = 'seller2@legato.com';
    SELECT id INTO seller3_id FROM users WHERE email = 'seller3@legato.com';
    SELECT id INTO seller4_id FROM users WHERE email = 'seller4@legato.com';
    SELECT id INTO seller5_id FROM users WHERE email = 'seller5@legato.com';
    SELECT id INTO seller6_id FROM users WHERE email = 'seller6@legato.com';

    -- Insert sample products
    INSERT INTO products (name, description, price, original_price, condition, category_id, seller_id, image_url, rating, review_count, featured, specifications) VALUES
    
    -- Guitars
    ('Yamaha F310 Acoustic Guitar', 'Perfect beginner acoustic guitar with excellent sound quality. Spruce top with nato back and sides.', 1299900, 1599900, 'New', guitar_cat_id, seller1_id, '/placeholder.svg?height=400&width=400&text=Yamaha+F310', 4.8, 324, true, '{"brand": "Yamaha", "model": "F310", "type": "Acoustic", "body": "Dreadnought", "top": "Spruce", "back": "Nato", "strings": 6}'),
    
    ('Fender Player Stratocaster Electric Guitar', 'Classic Stratocaster sound with modern playability. Alder body with maple neck.', 8999900, 10999900, 'Excellent', guitar_cat_id, seller6_id, '/placeholder.svg?height=400&width=400&text=Fender+Strat', 4.9, 156, true, '{"brand": "Fender", "model": "Player Stratocaster", "type": "Electric", "body": "Alder", "neck": "Maple", "pickups": "Single Coil", "strings": 6}'),
    
    ('Gibson Les Paul Standard', 'Iconic Les Paul with mahogany body and maple cap. Humbucker pickups for rich tone.', 22999900, 27999900, 'Like New', guitar_cat_id, seller1_id, '/placeholder.svg?height=400&width=400&text=Gibson+Les+Paul', 4.7, 89, true, '{"brand": "Gibson", "model": "Les Paul Standard", "type": "Electric", "body": "Mahogany", "top": "Maple", "pickups": "Humbucker", "strings": 6}'),
    
    -- Keyboards
    ('Casio CT-X700 Keyboard', 'Feature-rich keyboard with 61 keys and hundreds of tones. Perfect for learning and performance.', 1899900, 2299900, 'New', keyboard_cat_id, seller2_id, '/placeholder.svg?height=400&width=400&text=Casio+CTX700', 4.7, 189, true, '{"brand": "Casio", "model": "CT-X700", "keys": 61, "voices": 600, "rhythms": 195, "effects": "Yes"}'),
    
    ('Yamaha P-125 Digital Piano', 'Weighted keys digital piano with authentic piano sound. Compact and portable design.', 6499900, 7999900, 'Excellent', keyboard_cat_id, seller2_id, '/placeholder.svg?height=400&width=400&text=Yamaha+P125', 4.8, 267, false, '{"brand": "Yamaha", "model": "P-125", "keys": 88, "weighted": true, "voices": 24, "type": "Digital Piano"}'),
    
    -- Drums
    ('Pearl Roadshow Drum Kit', 'Complete 5-piece drum kit perfect for beginners. Includes cymbals and hardware.', 4599900, 5299900, 'New', drum_cat_id, seller4_id, '/placeholder.svg?height=400&width=400&text=Pearl+Roadshow', 4.6, 134, true, '{"brand": "Pearl", "model": "Roadshow", "pieces": 5, "shells": "Poplar", "hardware": "Included", "cymbals": "Included"}'),
    
    ('Roland TD-17KVX Electronic Drum Kit', 'Professional electronic drum kit with mesh heads and advanced sound module.', 12999900, 15999900, 'Like New', drum_cat_id, seller4_id, '/placeholder.svg?height=400&width=400&text=Roland+TD17', 4.9, 78, false, '{"brand": "Roland", "model": "TD-17KVX", "type": "Electronic", "pads": "Mesh", "sounds": 310, "songs": 15}'),
    
    -- Audio Gear
    ('Audio-Technica ATR2100x Microphone', 'Professional dynamic microphone for vocals and instruments. USB and XLR connectivity.', 899900, null, 'New', audio_cat_id, seller3_id, '/placeholder.svg?height=400&width=400&text=Audio+Technica+Mic', 4.9, 156, false, '{"brand": "Audio-Technica", "model": "ATR2100x", "type": "Dynamic", "connectivity": "USB/XLR", "frequency": "20Hz-20kHz"}'),
    
    ('Shure SM58 Dynamic Microphone', 'Industry standard vocal microphone. Legendary reliability and sound quality.', 1099900, 1199900, 'Excellent', audio_cat_id, seller3_id, '/placeholder.svg?height=400&width=400&text=Shure+SM58', 4.8, 423, true, '{"brand": "Shure", "model": "SM58", "type": "Dynamic", "pattern": "Cardioid", "frequency": "50Hz-15kHz"}'),
    
    ('Focusrite Scarlett 2i2 Audio Interface', 'Professional 2-input audio interface for home recording. Studio-quality preamps.', 1699900, 1999900, 'Like New', audio_cat_id, seller3_id, '/placeholder.svg?height=400&width=400&text=Focusrite+2i2', 4.7, 234, false, '{"brand": "Focusrite", "model": "Scarlett 2i2", "inputs": 2, "outputs": 2, "resolution": "24-bit/192kHz", "preamps": "Scarlett"}'),
    
    -- Traditional Instruments
    ('Professional Tabla Set', 'Handcrafted tabla set with dayan and bayan. Premium quality wood and skin.', 1599900, 1899900, 'New', traditional_cat_id, seller5_id, '/placeholder.svg?height=400&width=400&text=Tabla+Set', 4.8, 67, false, '{"type": "Tabla", "material": "Wood", "skin": "Goat", "size": "5.5 inch", "accessories": "Hammer, Paste"}'),
    
    ('Concert Sitar', 'Professional sitar with 20 strings. Seasoned tun wood with bone bridge.', 4999900, 5999900, 'Excellent', traditional_cat_id, seller5_id, '/placeholder.svg?height=400&width=400&text=Sitar', 4.9, 34, true, '{"type": "Sitar", "strings": 20, "wood": "Tun", "bridge": "Bone", "frets": "Movable"}'),
    
    ('Harmonium 39 Keys', 'Traditional harmonium with 39 keys. Rich sound quality for classical music.', 899900, 1099900, 'Good', traditional_cat_id, seller5_id, '/placeholder.svg?height=400&width=400&text=Harmonium', 4.6, 89, false, '{"type": "Harmonium", "keys": 39, "octaves": 3, "reeds": "Steel", "bellows": "Double"}'),
    
    -- String Instruments
    ('Stentor Student Violin 4/4', 'Quality student violin with bow and case. Perfect for beginners and intermediate players.', 1299900, 1599900, 'New', strings_cat_id, seller6_id, '/placeholder.svg?height=400&width=400&text=Stentor+Violin', 4.7, 123, false, '{"brand": "Stentor", "size": "4/4", "wood": "Spruce/Maple", "accessories": "Bow, Case, Rosin", "strings": "Steel"}'),
    
    ('Cello 4/4 Full Size', 'Professional cello with ebony fingerboard. Warm and rich tone quality.', 7999900, 9999900, 'Very Good', strings_cat_id, seller6_id, '/placeholder.svg?height=400&width=400&text=Cello', 4.8, 45, false, '{"type": "Cello", "size": "4/4", "top": "Spruce", "back": "Maple", "fingerboard": "Ebony", "strings": 4}');

END $$;

-- Insert some sample reviews
DO $$
DECLARE
    product_record RECORD;
    buyer1_id UUID;
    buyer2_id UUID;
BEGIN
    SELECT id INTO buyer1_id FROM users WHERE email = 'buyer1@legato.com';
    SELECT id INTO buyer2_id FROM users WHERE email = 'buyer2@legato.com';
    
    -- Add reviews for some products
    FOR product_record IN SELECT id FROM products LIMIT 5 LOOP
        INSERT INTO reviews (product_id, reviewer_id, rating, comment) VALUES
        (product_record.id, buyer1_id, 5, 'Excellent product! Highly recommended.'),
        (product_record.id, buyer2_id, 4, 'Good quality and fast delivery.');
    END LOOP;
END $$;

-- Insert admin stats for the last 30 days
DO $$
DECLARE
    i INTEGER;
    stat_date DATE;
BEGIN
    FOR i IN 0..29 LOOP
        stat_date := CURRENT_DATE - i;
        INSERT INTO admin_stats (date, total_users, total_products, total_orders, total_revenue) VALUES
        (stat_date, 
         1000 + (i * 10), 
         500 + (i * 5), 
         50 + (i * 2), 
         (50 + (i * 2)) * 150000); -- Average order value 1500 INR
    END LOOP;
END $$;

-- Update product view counts randomly
UPDATE products SET view_count = floor(random() * 1000) + 100;

-- Set some products as featured
UPDATE products SET featured = true WHERE rating >= 4.8 LIMIT 6;
