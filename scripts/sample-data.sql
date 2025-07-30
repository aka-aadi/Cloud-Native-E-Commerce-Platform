-- Sample data for Legato - Indian Music Marketplace
-- Run this after the main schema to populate with realistic Indian data

-- Insert sample users
INSERT INTO users (email, password_hash, name, phone, user_type, status, email_verified, state, city, pincode, bio) VALUES
('rajesh.kumar@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Rajesh Kumar', '+919876543210', 'seller', 'active', TRUE, 'Maharashtra', 'Mumbai', '400001', 'Professional tabla player and music teacher with 15+ years experience'),
('priya.sharma@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Priya Sharma', '+919876543211', 'buyer', 'active', TRUE, 'Delhi', 'New Delhi', '110001', 'Classical music enthusiast and guitar learner'),
('amit.singh@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Amit Singh', '+919876543212', 'both', 'active', TRUE, 'Karnataka', 'Bangalore', '560001', 'Music producer and sound engineer'),
('sunita.patel@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Sunita Patel', '+919876543213', 'seller', 'active', TRUE, 'Gujarat', 'Ahmedabad', '380001', 'Traditional instrument craftsperson specializing in harmoniums'),
('vikram.reddy@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Vikram Reddy', '+919876543214', 'both', 'active', TRUE, 'Tamil Nadu', 'Chennai', '600001', 'Carnatic music teacher and veena player'),
('anita.joshi@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Anita Joshi', '+919876543215', 'seller', 'active', TRUE, 'West Bengal', 'Kolkata', '700001', 'Sitar player and music composer'),
('rohit.mehta@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Rohit Mehta', '+919876543216', 'both', 'active', TRUE, 'Rajasthan', 'Jaipur', '302001', 'Folk musician and multi-instrumentalist'),
('kavya.nair@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Kavya Nair', '+919876543217', 'buyer', 'active', TRUE, 'Kerala', 'Kochi', '682001', 'Music student learning violin'),
('deepak.gupta@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Deepak Gupta', '+919876543218', 'seller', 'active', TRUE, 'Punjab', 'Chandigarh', '160001', 'Dhol and tabla specialist'),
('meera.agarwal@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Meera Agarwal', '+919876543219', 'both', 'active', TRUE, 'Uttar Pradesh', 'Lucknow', '226001', 'Hindustani classical vocalist and harmonium player');

-- Insert sample products with realistic Indian pricing and descriptions
DO $$
DECLARE
    traditional_id UUID;
    guitars_id UUID;
    keyboards_id UUID;
    drums_id UUID;
    audio_id UUID;
    strings_id UUID;
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    user4_id UUID;
    user5_id UUID;
    user6_id UUID;
    user7_id UUID;
    user8_id UUID;
    user9_id UUID;
    user10_id UUID;
    product_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO traditional_id FROM categories WHERE slug = 'traditional';
    SELECT id INTO guitars_id FROM categories WHERE slug = 'guitars';
    SELECT id INTO keyboards_id FROM categories WHERE slug = 'keyboards';
    SELECT id INTO drums_id FROM categories WHERE slug = 'drums';
    SELECT id INTO audio_id FROM categories WHERE slug = 'audio';
    SELECT id INTO strings_id FROM categories WHERE slug = 'strings';
    
    -- Get user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'rajesh.kumar@gmail.com';
    SELECT id INTO user2_id FROM users WHERE email = 'amit.singh@gmail.com';
    SELECT id INTO user3_id FROM users WHERE email = 'sunita.patel@gmail.com';
    SELECT id INTO user4_id FROM users WHERE email = 'vikram.reddy@gmail.com';
    SELECT id INTO user5_id FROM users WHERE email = 'anita.joshi@gmail.com';
    SELECT id INTO user6_id FROM users WHERE email = 'rohit.mehta@gmail.com';
    SELECT id INTO user7_id FROM users WHERE email = 'deepak.gupta@gmail.com';
    SELECT id INTO user8_id FROM users WHERE email = 'meera.agarwal@gmail.com';

    -- Insert Traditional Instruments
    INSERT INTO products (seller_id, category_id, title, description, price, original_price, condition, brand, state, city, pincode, status, is_featured, views_count, likes_count, tags, attributes) VALUES
    (user1_id, traditional_id, 'Professional Tabla Set with Cushions and Covers', 'Authentic tabla set handcrafted by master craftsmen from Kolkata. Made with high-quality wood and goatskin. Includes both dayan and bayan with traditional leather straps, cushions, and protective covers. Perfect for classical music performances, practice sessions, and recording. The dayan produces crisp, clear sounds while the bayan provides deep, resonant bass tones. Ideal for students and professional musicians alike.', 8999, 11999, 'new', 'Kolkata Tabla House', 'Maharashtra', 'Mumbai', '400001', 'approved', TRUE, 245, 34, ARRAY['tabla', 'percussion', 'indian', 'classical', 'handmade'], '{"wood_type": "sheesham", "skin_type": "goat", "size": "5.5_inch"}'),
    
    (user3_id, traditional_id, 'Harmonium 39 Keys Double Reed System', 'Beautiful harmonium with 39 keys and double reed system for rich, full sound. Crafted with premium quality wood and fitted with high-grade reeds. Features smooth key action and excellent air circulation system. Comes with a sturdy carrying case and instruction manual. Perfect for classical music, bhajans, devotional songs, and accompaniment. Well-maintained and recently serviced by expert technicians.', 15999, 18999, 'like_new', 'Bina Musical', 'Gujarat', 'Ahmedabad', '380001', 'approved', TRUE, 189, 28, ARRAY['harmonium', 'keyboard', 'indian', 'classical', 'devotional'], '{"keys": 39, "reed_type": "double", "octaves": "3.25"}'),
    
    (user5_id, traditional_id, 'Concert Quality Sitar with Meend and Sympathetic Strings', 'Professional sitar crafted by renowned master luthier from Miraj. Features premium quality tun wood body with intricate bone and brass inlay work. Equipped with 20 sympathetic strings and 7 main strings. Includes all essential accessories: mizrab (plectrum), extra strings, tuning key, and padded carrying case. The instrument produces exceptional meend (gliding notes) and is perfect for serious students and performing artists. Recently set up and tuned by expert sitar technician.', 45999, 52999, 'excellent', 'Miraj Instruments', 'West Bengal', 'Kolkata', '700001', 'approved', FALSE, 156, 22, ARRAY['sitar', 'strings', 'indian', 'classical', 'concert'], '{"strings_main": 7, "strings_sympathetic": 20, "woo  'strings', 'indian', 'classical', 'concert'], '{"strings_main": 7, "strings_sympathetic": 20, "wood_type": "tun", "inlay": "bone_brass"}'),
    
    (user6_id, traditional_id, 'Veena South Indian Classical with Case', 'Authentic South Indian veena (Saraswati veena) made from jackwood with natural finish. Features 24 frets, 4 main strings, and 3 drone strings. Comes with a beautifully carved dragon head and traditional gourd resonator. Includes padded carrying case, extra strings, and plectrum. Perfect for Carnatic music students and performers. The instrument has been blessed and tuned according to traditional methods.', 35999, 42999, 'good', 'Chennai Veena Works', 'Tamil Nadu', 'Chennai', '600001', 'approved', TRUE, 134, 19, ARRAY['veena', 'strings', 'carnatic', 'south_indian', 'classical'], '{"wood_type": "jackwood", "frets": 24, "strings_main": 4, "strings_drone": 3}'),
    
    -- Guitars
    (user1_id, guitars_id, 'Yamaha F310 Acoustic Guitar Natural Finish', 'Popular beginner to intermediate acoustic guitar with excellent build quality. Features laminated spruce top for bright, clear tone and meranti back and sides for warmth. Comfortable neck profile makes it easy to play for extended periods. Includes soft padded gig bag, extra set of strings, picks, and basic maintenance kit. Perfect for learning, practice, and small performances. Well-maintained with no structural damage.', 12999, 15999, 'new', 'Yamaha', 'Maharashtra', 'Mumbai', '400001', 'approved', TRUE, 324, 45, ARRAY['guitar', 'acoustic', 'yamaha', 'beginner', 'steel_strings'], '{"body_type": "dreadnought", "top": "spruce", "back_sides": "meranti"}'),
    
    (user4_id, guitars_id, 'Fender Player Stratocaster Electric Guitar Sunburst', 'Mexican-made Fender Stratocaster in excellent condition. Features alder body with 3-color sunburst finish, maple neck with modern C-shape profile, and three single-coil pickups for versatile tones. 5-way pickup selector and synchronized tremolo bridge. Perfect for rock, blues, pop, and jazz styles. Comes with original hard case, tremolo arm, and cable. Recently professionally set up with new strings and proper intonation.', 65999, 75999, 'like_new', 'Fender', 'Tamil Nadu', 'Chennai', '600001', 'approved', TRUE, 198, 31, ARRAY['guitar', 'electric', 'fender', 'stratocaster', 'professional'], '{"body": "alder", "neck": "maple", "pickups": "single_coil", "bridge": "tremolo"}'),
    
    (user2_id, guitars_id, 'Gibson Les Paul Studio Electric Guitar', 'Classic Gibson Les Paul Studio with mahogany body and maple cap. Features dual humbucker pickups for rich, powerful tone. Rosewood fingerboard with trapezoid inlays. Perfect for rock, blues, and jazz. Some minor cosmetic wear but plays beautifully. Includes original Gibson hard case and documentation. Recently serviced with new electronics and fret polish.', 89999, 105999, 'good', 'Gibson', 'Karnataka', 'Bangalore', '560001', 'approved', FALSE, 167, 23, ARRAY['guitar', 'electric', 'gibson', 'les_paul', 'humbucker'], '{"body": "mahogany", "top": "maple", "pickups": "humbucker", "fingerboard": "rosewood"}'),
    
    -- Keyboards
    (user2_id, keyboards_id, 'Casio CT-X700 Digital Keyboard 61 Keys', '61-key keyboard with 600 high-quality tones and 195 rhythms. Features touch-sensitive keys, built-in speakers, and LCD display. Perfect for learning and performance with lesson function and song bank. Includes music stand, AC adapter, and instruction manual. Excellent condition with all original accessories. Great for beginners and intermediate players.', 18999, 22999, 'new', 'Casio', 'Karnataka', 'Bangalore', '560001', 'approved', TRUE, 267, 38, ARRAY['keyboard', 'digital', 'casio', 'learning', 'portable'], '{"keys": 61, "tones": 600, "rhythms": 195, "touch_sensitive": true}'),
    
    (user3_id, keyboards_id, 'Roland FP-30X Digital Piano 88 Keys', '88-key weighted digital piano with SuperNATURAL Piano sound engine. Bluetooth connectivity for wireless audio and MIDI. Premium feel with progressive hammer action. Perfect for serious piano students and performers. Includes music stand, sustain pedal, and power adapter. Like new condition with minimal use.', 89999, 99999, 'like_new', 'Roland', 'Gujarat', 'Ahmedabad', '380001', 'approved', FALSE, 134, 19, ARRAY['piano', 'digital', 'roland', 'weighted', 'bluetooth'], '{"keys": 88, "action": "weighted", "sounds": "supernatural", "connectivity": "bluetooth"}'),
    
    -- Drums
    (user1_id, drums_id, 'Pearl Roadshow 5-Piece Drum Kit Complete Setup', 'Complete 5-piece drum kit perfect for beginners and intermediate players. Includes bass drum, snare, two toms, floor tom, hi-hat cymbals, crash cymbal, and all necessary hardware. Poplar shells with wrapped finish. Comes with drumsticks, drum key, and setup instructions. Great value for money and perfect for practice or small gigs.', 45999, 52999, 'good', 'Pearl', 'Maharashtra', 'Mumbai', '400001', 'approved', TRUE, 178, 25, ARRAY['drums', 'acoustic', 'pearl', 'complete_kit', 'beginner'], '{"pieces": 5, "shell": "poplar", "cymbals_included": true, "hardware_included": true}'),
    
    (user7_id, drums_id, 'Professional Dhol with Decorative Rope Tensioning', 'Traditional Punjabi dhol made from mango wood with goatskin heads. Features decorative rope tensioning system and beautiful hand-painted designs. Perfect for bhangra, folk music, and celebrations. Comes with wooden sticks (dagga) and instruction guide. Excellent sound quality with deep bass and crisp treble tones.', 12999, 15999, 'new', 'Punjab Dhol House', 'Punjab', 'Chandigarh', '160001', 'approved', TRUE, 145, 21, ARRAY['dhol', 'percussion', 'punjabi', 'folk', 'traditional'], '{"wood": "mango", "heads": "goatskin", "tensioning": "rope", "decorated": true}'),
    
    -- Audio Equipment
    (user2_id, audio_id, 'Audio-Technica ATR2100x Dynamic Microphone', 'Professional dynamic microphone perfect for vocals and instruments. Features both USB and XLR connectivity for versatility. Excellent for home recording, podcasting, and live performances. Includes desktop stand, USB cable, and carrying pouch. Like new condition with original packaging and documentation.', 9999, 12999, 'new', 'Audio-Technica', 'Karnataka', 'Bangalore', '560001', 'approved', TRUE, 234, 33, ARRAY['microphone', 'dynamic', 'usb', 'xlr', 'recording'], '{"type": "dynamic", "connectivity": "usb_xlr", "polar_pattern": "cardioid"}'),
    
    (user4_id, audio_id, 'JBL EON615 15-inch Powered Speaker', 'Professional 15-inch powered speaker with 1000W power output. Perfect for live performances, events, and studio monitoring. Features multiple input options and built-in EQ. Excellent sound quality with clear highs and powerful bass. Includes power cable and user manual. Well-maintained with minimal wear.', 55999, 65999, 'like_new', 'JBL', 'Tamil Nadu', 'Chennai', '600001', 'approved', FALSE, 145, 18, ARRAY['speaker', 'powered', 'jbl', 'professional', 'live_sound'], '{"size": "15_inch", "power": "1000w", "type": "powered", "inputs": "multiple"}'),
    
    -- String Instruments
    (user8_id, strings_id, 'Stentor Student Violin 4/4 Full Size with Bow and Case', 'Quality student violin perfect for beginners and intermediate players. Features solid spruce top and maple back with ebony fingerboard. Comes with bow, rosin, shoulder rest, and hard case. Properly set up and ready to play. Excellent condition with beautiful tone quality.', 25999, 29999, 'like_new', 'Stentor', 'Uttar Pradesh', 'Lucknow', '226001', 'approved', TRUE, 123, 16, ARRAY['violin', 'strings', 'student', 'classical', 'western'], '{"size": "4/4", "top": "spruce", "back": "maple", "fingerboard": "ebony"}');

    -- Insert product images for some products
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Tabla%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Guitar%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Keyboard%' OR p.title LIKE '%Piano%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1571327073757-71d13c24de30?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Drum%' OR p.title LIKE '%Dhol%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Microphone%' OR p.title LIKE '%Speaker%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Violin%' OR p.title LIKE '%Sitar%' OR p.title LIKE '%Veena%';
    
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
    SELECT p.id, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&crop=center', p.title, true, 1
    FROM products p WHERE p.title LIKE '%Harmonium%';

    -- Insert some sample orders
    INSERT INTO orders (buyer_id, seller_id, product_id, unit_price, total_amount, status, payment_status, shipping_address, created_at) 
    SELECT 
        (SELECT id FROM users WHERE email = 'priya.sharma@gmail.com'),
        p.seller_id,
        p.id,
        p.price,
        p.price + 200, -- Adding shipping cost
        'delivered',
        'paid',
        '{"name": "Priya Sharma", "address": "123 Main Street", "city": "New Delhi", "state": "Delhi", "pincode": "110001", "phone": "+919876543211"}',
        NOW() - INTERVAL '15 days'
    FROM products p WHERE p.title LIKE '%Yamaha F310%';
    
    INSERT INTO orders (buyer_id, seller_id, product_id, unit_price, total_amount, status, payment_status, shipping_address, created_at) 
    SELECT 
        (SELECT id FROM users WHERE email = 'kavya.nair@gmail.com'),
        p.seller_id,
        p.id,
        p.price,
        p.price + 300,
        'shipped',
        'paid',
        '{"name": "Kavya Nair", "address": "456 Beach Road", "city": "Kochi", "state": "Kerala", "pincode": "682001", "phone": "+919876543217"}',
        NOW() - INTERVAL '3 days'
    FROM products p WHERE p.title LIKE '%Violin%';

    -- Insert some reviews
    INSERT INTO reviews (order_id, reviewer_id, reviewee_id, product_id, rating, title, comment, is_verified, created_at)
    SELECT 
        o.id,
        o.buyer_id,
        o.seller_id,
        o.product_id,
        5,
        'Excellent guitar for beginners!',
        'Amazing quality guitar. Perfect for learning and the seller was very helpful with setup instructions. Fast delivery and well-packaged. Highly recommended!',
        true,
        NOW() - INTERVAL '10 days'
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE p.title LIKE '%Yamaha F310%';
    
    INSERT INTO reviews (order_id, reviewer_id, reviewee_id, product_id, rating, title, comment, is_verified, created_at)
    SELECT 
        o.id,
        o.buyer_id,
        o.seller_id,
        o.product_id,
        4,
        'Good quality violin',
        'Nice violin for the price. Sound quality is good and came with all accessories as mentioned. Delivery was on time.',
        true,
        NOW() - INTERVAL '5 days'
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE p.title LIKE '%Violin%';

END $$;
