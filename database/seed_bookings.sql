USE `galaxy cinemas system`;

-- Ensure user 4 exists or insert demo users
INSERT IGNORE INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `role`, `status`) VALUES
(4, 'Damsarani Nawela', 'damsarani@gmail.com', '$2b$10$joPEVRul0vs8jba3SXl1MuIcMT428ynwdECb2iuoX.anWezeasEbi', '+15551234567', 'customer', 'active'),
(5, 'Marcus Vance', 'marcus.v@example.com', '$2b$10$joPEVRul0vs8jba3SXl1MuIcMT428ynwdECb2iuoX.anWezeasEbi', '+15559876543', 'customer', 'active'),
(6, 'Elena Rostova', 'elena.r@example.com', '$2b$10$joPEVRul0vs8jba3SXl1MuIcMT428ynwdECb2iuoX.anWezeasEbi', '+15554567890', 'customer', 'active'),
(7, 'Liam Chen', 'liam.chen@example.com', '$2b$10$joPEVRul0vs8jba3SXl1MuIcMT428ynwdECb2iuoX.anWezeasEbi', '+15552345678', 'customer', 'active'),
(8, 'Sophia Taylor', 'sophia.t@example.com', '$2b$10$joPEVRul0vs8jba3SXl1MuIcMT428ynwdECb2iuoX.anWezeasEbi', '+15556789012', 'customer', 'blocked');

-- Insert bookings with varied dates for charting
INSERT IGNORE INTO `bookings` (`booking_id`, `user_id`, `showtime_id`, `total_amount`, `booking_status`, `created_at`) VALUES
(1001, 4, 1, 36.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1002, 5, 1, 40.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1003, 6, 2, 60.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1004, 7, 4, 32.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1005, 4, 3, 44.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1006, 5, 5, 39.00, 'pending', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1007, 6, 2, 20.00, 'cancelled', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1008, 7, 6, 30.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1009, 4, 7, 28.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1010, 5, 1, 54.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(1011, 6, 3, 66.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(1012, 7, 4, 48.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(1013, 4, 5, 58.50, 'confirmed', DATE_SUB(NOW(), INTERVAL 65 DAY)),
(1014, 5, 6, 45.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 90 DAY));

-- Insert booking seats
INSERT IGNORE INTO `booking_seats` (`booking_id`, `seat_id`) VALUES
(1001, 1), (1001, 2),
(1002, 3), (1002, 4),
(1003, 8), (1003, 9),
(1004, 5), (1004, 6),
(1005, 10), (1005, 11),
(1006, 7),
(1007, 1),
(1008, 2), (1008, 3),
(1009, 4), (1009, 5);

-- Insert payments matching bookings
INSERT IGNORE INTO `payments` (`payment_id`, `booking_id`, `amount`, `payment_method`, `payment_status`, `paid_at`) VALUES
(501, 1001, 36.00, 'card', 'success', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(502, 1002, 40.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(503, 1003, 60.00, 'card', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(504, 1004, 32.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(505, 1005, 44.00, 'cash', 'success', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(506, 1006, 39.00, 'online', 'failed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(507, 1007, 20.00, 'card', 'refunded', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(508, 1008, 30.00, 'card', 'success', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(509, 1009, 28.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(510, 1010, 54.00, 'card', 'success', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(511, 1011, 66.00, 'card', 'success', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(512, 1012, 48.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(513, 1013, 58.50, 'card', 'success', DATE_SUB(NOW(), INTERVAL 65 DAY)),
(514, 1014, 45.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 90 DAY));
