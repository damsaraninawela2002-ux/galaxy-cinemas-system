-- ==========================================================
-- GALAXY CINEMA: MOVIE SCHEMA UPGRADE & SEED SCRIPT
-- ==========================================================

USE `galaxy cinemas system`;

-- 1. Upgrade `movies` table structure with full professional fields
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

-- 2. Populate / Replace with Full Professional Seed Data
INSERT INTO `movies` (
  `movie_id`,
  `title`,
  `description`,
  `genre`,
  `release_date`,
  `duration`,
  `language`,
  `age_rating`,
  `director`,
  `cast`,
  `poster_url`,
  `backdrop_url`,
  `trailer_url`,
  `status`,
  `rating`
) VALUES
(
  1,
  'Spider-Man: Brand New Day',
  'The culmination of the Multiverse Saga. Heroes from across the multiverse unite to defend reality from total collapse in a desperate final battle.',
  'Action, Sci-Fi, Adventure',
  NULL,
  180,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/1.jfif',
  '/images/1.jfif',
  NULL,
  'now_showing',
  '4.9'
),
(
  2,
  'Avengers: Doomsday',
  'Jake Sully and Neytiri encounter a hostile clan of Na''vi known as the ''Ash People'', discovering new fiery volcanic regions of Pandora.',
  'Adventure, Fantasy, Action',
  NULL,
  190,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/pp.jfif',
  '/images/pp.jfif',
  NULL,
  'now_showing',
  '4.8'
),
(
  3,
  'The Odyssey',
  'A probe detects an ancient transmission from the far reaches of the solar system, sending a crew on a mind-bending exploration beyond our stars.',
  'Sci-Fi, Drama, Mystery',
  NULL,
  165,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/77.jfif',
  '/images/77.jfif',
  NULL,
  'now_showing',
  '4.7'
),
(
  4,
  'Toy Story 5',
  'Miles Morales travels across dimensions to confront the ultimate threat to his family and save the multiverse alongside Gwen Stacy.',
  'Animation, Action, Adventure',
  NULL,
  140,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/ff.jfif',
  '/images/ff.jfif',
  NULL,
  'upcoming',
  '4.9'
),
(
  5,
  'Frozen 3',
  'In a neon-drenched futuristic metropolis, a cyborg mercenary fights for survival against a corrupt corporate empire control system.',
  'Sci-Fi, Thriller, Action',
  NULL,
  155,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/rr.jfif',
  '/images/rr.jfif',
  NULL,
  'upcoming',
  '4.6'
),
(
  6,
  'Shrek 5',
  'A young girl discovers a hidden gateway in her garden that leads to a mystical, magical forest filled with whimsical creature guides.',
  'Fantasy, Family, Adventure',
  NULL,
  110,
  'English',
  NULL,
  NULL,
  NULL,
  '/images/hh.jfif',
  '/images/hh.jfif',
  NULL,
  'upcoming',
  '4.4'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `genre` = VALUES(`genre`),
  `release_date` = VALUES(`release_date`),
  `duration` = VALUES(`duration`),
  `language` = VALUES(`language`),
  `age_rating` = VALUES(`age_rating`),
  `director` = VALUES(`director`),
  `cast` = VALUES(`cast`),
  `poster_url` = VALUES(`poster_url`),
  `backdrop_url` = VALUES(`backdrop_url`),
  `trailer_url` = VALUES(`trailer_url`),
  `status` = VALUES(`status`),
  `rating` = VALUES(`rating`);
