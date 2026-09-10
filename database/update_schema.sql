-- Galaxy Cinema Database Enhancement Script
USE `galaxy cinemas system`;

-- 1. Enhance `movies` table with full professional schema fields
ALTER TABLE `movies` 
  ADD COLUMN IF NOT EXISTS `genre` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `duration` int(11) DEFAULT 120,
  ADD COLUMN IF NOT EXISTS `age_rating` varchar(20) DEFAULT 'PG-13',
  ADD COLUMN IF NOT EXISTS `director` varchar(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `cast` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `backdrop_url` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `trailer_url` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rating` varchar(10) DEFAULT '4.5';

ALTER TABLE `movies`
  MODIFY COLUMN `status` enum('now_showing','coming_soon','archived','ended') DEFAULT 'coming_soon';

-- 2. Enhance `theaters` table
ALTER TABLE `theaters`
  ADD COLUMN IF NOT EXISTS `address` varchar(255) DEFAULT '100 Galaxy Boulevard, Cinema City';

-- 3. Enhance `screens` table
ALTER TABLE `screens`
  ADD COLUMN IF NOT EXISTS `screen_type` varchar(50) DEFAULT '2D';

-- 4. Enhance `seats` table
ALTER TABLE `seats`
  ADD COLUMN IF NOT EXISTS `row_label` varchar(10) DEFAULT 'A',
  ADD COLUMN IF NOT EXISTS `price` decimal(10,2) DEFAULT 12.00,
  ADD COLUMN IF NOT EXISTS `status` enum('available','booked','reserved','maintenance') DEFAULT 'available';

-- 5. Enhance `users` table
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `status` enum('active','blocked') DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS `profile_image` varchar(255) DEFAULT NULL;

-- 6. Create `offers` table
CREATE TABLE IF NOT EXISTS `offers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','flat') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. Create `promo_codes` table
CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','flat') NOT NULL DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `usage_limit` int(11) DEFAULT 100,
  `used_count` int(11) DEFAULT 0,
  `expiry_date` date NOT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Create `notifications` table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `target` enum('all','specific') NOT NULL DEFAULT 'all',
  `user_id` int(11) DEFAULT NULL,
  `status` enum('sent','delivered','pending') DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. Create `settings` table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed default settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'Galaxy Cinema'),
('site_logo', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=80'),
('currency_symbol', '$'),
('tax_rate', '8.5'),
('max_seats_per_booking', '8'),
('cancellation_window_hours', '2'),
('admin_email', 'admin@galaxycinema.com'),
('contact_phone', '+1 (555) 382-4400'),
('contact_address', '49C, Rathnapura Road, Poruwadanda')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Seed default Genres if empty
INSERT IGNORE INTO `genres` (`genre_id`, `genre_name`) VALUES
(1, 'Action'),
(2, 'Sci-Fi'),
(3, 'Adventure'),
(4, 'Drama'),
(5, 'Comedy'),
(6, 'Thriller'),
(7, 'Animation'),
(8, 'Horror');

-- Seed Theaters / Cinemas if none
INSERT IGNORE INTO `theaters` (`theater_id`, `name`, `location`, `address`, `contact_number`) VALUES
(1, 'Galaxy Cinema Poruwadanda', 'Poruwadanda', '49C, Rathnapura Road, Poruwadanda', '+1 (555) 382-4400'),
(2, 'Galaxy Cinema Poruwadanda IMAX', 'Poruwadanda', '49C, Rathnapura Road, Poruwadanda', '+1 (555) 382-4400'),
(3, 'Galaxy Cinema Poruwadanda Luxe', 'Poruwadanda', '49C, Rathnapura Road, Poruwadanda', '+1 (555) 382-4400');

-- Seed Screens / Halls if none
INSERT IGNORE INTO `screens` (`screen_id`, `theater_id`, `screen_name`, `total_seats`, `screen_type`) VALUES
(1, 1, 'Hall 1 (IMAX Laser)', 60, 'IMAX'),
(2, 1, 'Hall 2 (Dolby Atmos)', 48, 'Dolby 3D'),
(3, 2, 'Hall A (MegaScreen)', 50, '3D'),
(4, 2, 'Hall B (Prime 2D)', 40, '2D'),
(5, 3, 'Hall VIP Gold Lounge', 30, 'VIP 4DX');

-- Seed Movies if few
INSERT IGNORE INTO `movies` (`movie_id`, `title`, `description`, `duration_minutes`, `language`, `release_date`, `poster_url`, `trailer_url`, `cast`, `rating`, `status`) VALUES
(1, 'Spider-Man: Brand New Day', 'The culmination of the Multiverse Saga. Heroes from across the multiverse unite to defend reality from total collapse in a desperate final battle.', 180, 'English', NULL, '/images/1.jfif', NULL, NULL, '4.9', 'now_showing'),
(2, 'Avengers: Doomsday', 'Jake Sully and Neytiri encounter a hostile clan of Na\'vi known as the \'Ash People\', discovering new fiery volcanic regions of Pandora.', 190, 'English', NULL, '/images/pp.jfif', NULL, NULL, '4.8', 'now_showing'),
(3, 'The Odyssey', 'A probe detects an ancient transmission from the far reaches of the solar system, sending a crew on a mind-bending exploration beyond our stars.', 165, 'English', NULL, '/images/77.jfif', NULL, NULL, '4.7', 'now_showing'),
(4, 'Toy Story 5', 'Miles Morales travels across dimensions to confront the ultimate threat to his family and save the multiverse alongside Gwen Stacy.', 140, 'English', NULL, '/images/ff.jfif', NULL, NULL, '4.9', 'coming_soon'),
(5, 'Frozen 3', 'In a neon-drenched futuristic metropolis, a cyborg mercenary fights for survival against a corrupt corporate empire control system.', 155, 'English', NULL, '/images/rr.jfif', NULL, NULL, '4.6', 'coming_soon'),
(6, 'Shrek 5', 'A young girl discovers a hidden gateway in her garden that leads to a mystical, magical forest filled with whimsical creature guides.', 110, 'English', NULL, '/images/hh.jfif', NULL, NULL, '4.4', 'coming_soon');

-- Link movies to genres
INSERT IGNORE INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 6),
(3, 1), (3, 2),
(4, 1), (4, 7),
(5, 2), (5, 3);

-- Seed Showtimes if few
INSERT IGNORE INTO `showtimes` (`showtime_id`, `movie_id`, `screen_id`, `show_date`, `start_time`, `end_time`, `ticket_price`) VALUES
(1, 1, 1, CURDATE(), '13:00:00', '15:45:00', 18.00),
(2, 1, 1, CURDATE(), '17:00:00', '19:45:00', 20.00),
(3, 1, 1, CURDATE(), '20:30:00', '23:15:00', 22.00),
(4, 2, 2, CURDATE(), '14:00:00', '17:00:00', 16.00),
(5, 2, 2, CURDATE(), '18:30:00', '21:30:00', 19.50),
(6, 3, 3, CURDATE(), '15:00:00', '17:30:00', 15.00),
(7, 4, 4, CURDATE(), '16:00:00', '18:20:00', 14.00);

-- Seed Seats for Hall 1 if none
INSERT IGNORE INTO `seats` (`seat_id`, `screen_id`, `seat_number`, `seat_type`, `row_label`, `price`, `status`) VALUES
(1, 1, 'A1', 'standard', 'A', 15.00, 'available'),
(2, 1, 'A2', 'standard', 'A', 15.00, 'available'),
(3, 1, 'A3', 'standard', 'A', 15.00, 'booked'),
(4, 1, 'A4', 'standard', 'A', 15.00, 'booked'),
(5, 1, 'A5', 'standard', 'A', 15.00, 'available'),
(6, 1, 'B1', 'standard', 'B', 15.00, 'available'),
(7, 1, 'B2', 'standard', 'B', 15.00, 'available'),
(8, 1, 'B3', 'vip', 'B', 22.00, 'available'),
(9, 1, 'B4', 'vip', 'B', 22.00, 'available'),
(10, 1, 'C1', 'couple', 'C', 35.00, 'available'),
(11, 1, 'C2', 'couple', 'C', 35.00, 'available'),
(12, 1, 'C3', 'couple', 'C', 35.00, 'maintenance');

-- Seed Offers
INSERT IGNORE INTO `offers` (`id`, `title`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `banner`, `status`) VALUES
(1, 'Blockbuster Tuesday 25% Off', 'Get 25% off all movie tickets every Tuesday with code TUESDAY25.', 'percentage', 25.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80', 'active'),
(2, 'Couple Special Combo', 'Save $10 on couple recliner seats with free popcorn voucher.', 'flat', 10.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&auto=format&fit=crop&q=80', 'active'),
(3, 'IMAX Weekend Extravaganza', 'Experience ultimate cinema immersion with 15% discount on IMAX screenings.', 'percentage', 15.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80', 'active');

-- Seed Promo Codes
INSERT IGNORE INTO `promo_codes` (`id`, `code`, `discount_type`, `discount_value`, `usage_limit`, `used_count`, `expiry_date`, `status`) VALUES
(1, 'GALAXY20', 'percentage', 20.00, 200, 48, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active'),
(2, 'WELCOME5', 'flat', 5.00, 500, 142, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'active'),
(3, 'VIPCINEMA', 'percentage', 30.00, 50, 19, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'active'),
(4, 'SUMMER50', 'flat', 15.00, 100, 100, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'expired');

-- Seed Reviews
INSERT IGNORE INTO `reviews` (`review_id`, `user_id`, `movie_id`, `rating`, `comment`, `created_at`) VALUES
(1, 4, 1, 5, 'Masterpiece of visual storytelling and sound design. IMAX laser projection blew my mind!', NOW()),
(2, 4, 2, 5, 'Incredible performances and tension throughout. Outstanding cinema experience.', NOW()),
(3, 4, 3, 4, 'Fast paced sci-fi action, loved the world building and special effects!', NOW());

-- Seed Notifications
INSERT IGNORE INTO `notifications` (`id`, `title`, `message`, `target`, `user_id`, `status`, `sent_at`) VALUES
(1, 'IMAX Laser Hall Upgraded', 'Experience crystal-clear visuals with our newly calibrated 4K laser projector in Hall 1.', 'all', NULL, 'sent', NOW()),
(2, 'Special Weekend Flash Sale', 'Use code GALAXY20 to get 20% off all tickets this Saturday & Sunday.', 'all', NULL, 'sent', NOW()),
(3, 'Booking Confirmed Reminder', 'Your tickets for Spider-Man: Brand New Day are confirmed. Please arrive 15 minutes prior to showtime.', 'specific', 4, 'delivered', NOW());
