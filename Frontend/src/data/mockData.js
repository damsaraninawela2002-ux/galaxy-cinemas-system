// Centralized mock data for Galaxy Cinema customer platform
import movies from './movies';

export const MOCK_CINEMAS = [
  {
    theater_id: 1,
    name: "Galaxy Cinema Poruwadanda",
    location: "Poruwadanda",
    address: "49C, Rathnapura Road, Poruwadanda",
    contact_number: "+1 (555) 382-4400",
    amenities: ["IMAX Laser", "Dolby Atmos 7.1", "VIP Leather Recliners", "Gourmet Kitchen", "Valet Parking"],
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80"
  },
  {
    theater_id: 2,
    name: "Galaxy Cinema Poruwadanda IMAX",
    location: "Poruwadanda",
    address: "49C, Rathnapura Road, Poruwadanda",
    contact_number: "+1 (555) 382-4400",
    amenities: ["Dual 4K Laser IMAX", "4DX Motion Chairs", "Dolby Atmos", "Arcade Lounge", "Reserved Parking"],
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80"
  },
  {
    theater_id: 3,
    name: "Galaxy Cinema Poruwadanda Luxe",
    location: "Poruwadanda",
    address: "49C, Rathnapura Road, Poruwadanda",
    contact_number: "+1 (555) 382-4400",
    amenities: ["In-Seat Waiter Service", "Heated Recliners", "Wine & Cocktail Bar", "Intimate 40-Seat Auditoriums"],
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80"
  }
];

export const MOCK_SHOWTIMES = [
  {
    showtime_id: 101,
    movie_id: 1,
    theater_id: 1,
    screen_name: "Auditorium 1 (IMAX Laser)",
    screen_type: "IMAX Laser",
    start_time: "10:30 AM",
    end_time: "01:30 PM",
    period: "Morning",
    ticket_price: 18.50,
    available_seats: 42,
    total_seats: 120
  },
  {
    showtime_id: 102,
    movie_id: 1,
    theater_id: 1,
    screen_name: "Auditorium 2 (Dolby Atmos)",
    screen_type: "Dolby Atmos",
    start_time: "02:15 PM",
    end_time: "05:15 PM",
    period: "Afternoon",
    ticket_price: 16.00,
    available_seats: 18,
    total_seats: 90
  },
  {
    showtime_id: 103,
    movie_id: 1,
    theater_id: 1,
    screen_name: "Auditorium 1 (IMAX Laser)",
    screen_type: "IMAX Laser",
    start_time: "06:45 PM",
    end_time: "09:45 PM",
    period: "Evening",
    ticket_price: 22.00,
    available_seats: 8,
    total_seats: 120
  },
  {
    showtime_id: 104,
    movie_id: 1,
    theater_id: 1,
    screen_name: "Auditorium 3 (VIP Luxe)",
    screen_type: "VIP Luxe",
    start_time: "10:15 PM",
    end_time: "01:15 AM",
    period: "Night",
    ticket_price: 25.00,
    available_seats: 0,
    total_seats: 40,
    sold_out: true
  },
  {
    showtime_id: 201,
    movie_id: 2,
    theater_id: 1,
    screen_name: "Auditorium 1 (IMAX Laser)",
    screen_type: "IMAX Laser",
    start_time: "11:00 AM",
    end_time: "02:00 PM",
    period: "Morning",
    ticket_price: 18.50,
    available_seats: 55,
    total_seats: 120
  },
  {
    showtime_id: 202,
    movie_id: 2,
    theater_id: 1,
    screen_name: "Auditorium 1 (IMAX Laser)",
    screen_type: "IMAX Laser",
    start_time: "07:30 PM",
    end_time: "10:30 PM",
    period: "Evening",
    ticket_price: 22.00,
    available_seats: 12,
    total_seats: 120
  }
];

export const MOCK_SNACKS = [
  {
    id: "popcorn-caramel",
    name: "Artisan Caramel Popcorn (Large)",
    category: "Popcorn",
    price: 8.50,
    calories: "620 kcal",
    image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop&q=80",
    description: "Crispy freshly-popped golden kernels coated in handcrafted brown sugar caramel."
  },
  {
    id: "popcorn-butter",
    name: "Classic Movie Theater Butter Popcorn",
    category: "Popcorn",
    price: 7.00,
    calories: "510 kcal",
    image: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=300&auto=format&fit=crop&q=80",
    description: "Warm, fluffy popcorn tossed in creamy melted cinema butter seasoning."
  },
  {
    id: "nachos-loaded",
    name: "Ultimate Loaded Queso Nachos",
    category: "Hot Food",
    price: 9.50,
    calories: "740 kcal",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&auto=format&fit=crop&q=80",
    description: "Crunchy tortilla crisps served with warm jalapeño cheddar queso and house salsa."
  },
  {
    id: "soda-ice",
    name: "Ice Cold Fountain Soda (32oz)",
    category: "Beverages",
    price: 5.50,
    calories: "220 kcal",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    description: "Coca-Cola, Coke Zero, Sprite, Fanta, or Dr Pepper with free self-serve refills."
  },
  {
    id: "churro-bites",
    name: "Cinnamon Sugar Churro Bites",
    category: "Sweets",
    price: 6.50,
    calories: "450 kcal",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80",
    description: "Golden fried churros dusted in Saigon cinnamon and served with dark chocolate dip."
  }
];

export const MOCK_OFFERS = [
  {
    code: "GALAXY25",
    title: "25% Off Weekend Blockbusters",
    discount: "25% OFF",
    type: "percentage",
    value: 0.25,
    minSpend: 30,
    expiry: "Valid till end of month",
    description: "Use coupon code GALAXY25 on any booking of 2 or more tickets."
  },
  {
    code: "STUDENT10",
    title: "Student Discount Special",
    discount: "$10 FLAT",
    type: "flat",
    value: 10,
    minSpend: 25,
    expiry: "Everyday 10am - 5pm",
    description: "Instant $10 discount for students on matinee shows."
  },
  {
    code: "VIPLUXE",
    title: "Complimentary Snack Voucher",
    discount: "FREE POPCORN",
    type: "snack",
    value: 7.00,
    minSpend: 40,
    expiry: "For Galaxy VIP Club Members",
    description: "Free large popcorn with any VIP Recliner booking."
  }
];

export const MOCK_USER_BOOKINGS = [
  {
    booking_id: "GC-89421",
    movie_title: movies[0].title,
    poster_url: movies[0].poster_url,
    cinema_name: "Galaxy Cinema Poruwadanda",
    screen_name: "Auditorium 1 (IMAX Laser)",
    show_date: "Tomorrow, Oct 12, 2026",
    show_time: "06:45 PM",
    seats: ["C5", "C6"],
    seat_tier: "VIP Recliner",
    total_amount: 44.00,
    booking_status: "Confirmed",
    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GALAXY-GC-89421-CONFIRMED",
    payment_method: "Apple Pay •••• 9012"
  },
  {
    booking_id: "GC-77409",
    movie_title: movies[1].title,
    poster_url: movies[1].poster_url,
    cinema_name: "Galaxy Cinema Poruwadanda IMAX",
    screen_name: "Auditorium 1 (Dual Laser)",
    show_date: "Sep 28, 2026",
    show_time: "07:30 PM",
    seats: ["D7", "D8"],
    seat_tier: "Standard",
    total_amount: 37.00,
    booking_status: "Completed",
    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GALAXY-GC-77409-COMPLETED",
    payment_method: "Visa •••• 4242"
  },
  {
    booking_id: "GC-65120",
    movie_title: movies[2].title,
    poster_url: movies[2].poster_url,
    cinema_name: "Galaxy Cinema Poruwadanda",
    screen_name: "Auditorium 2",
    show_date: "Aug 14, 2026",
    show_time: "02:15 PM",
    seats: ["E10"],
    seat_tier: "Standard",
    total_amount: 16.00,
    booking_status: "Cancelled",
    qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GALAXY-GC-65120-REFUNDED",
    payment_method: "Mastercard •••• 5510"
  }
];

export const MOCK_FAQS = [
  {
    q: "How early should I arrive before the movie starts?",
    a: "We recommend arriving 15 to 20 minutes before your scheduled showtime. This gives you ample time to collect your tickets or scan your e-ticket on your mobile device, grab snacks and beverages from our concessions counter, and locate your reserved seat comfortably."
  },
  {
    q: "What is Galaxy Cinema's cancellation and refund policy?",
    a: "You can cancel your booking directly from the 'My Bookings' tab up to 2 hours before the scheduled showtime for a 100% instant refund back to your original payment method or as Galaxy Credits."
  },
  {
    q: "What is the difference between IMAX Laser and Dolby Atmos?",
    a: "IMAX Laser delivers an ultra-high resolution custom optical engine with towering aspect ratios (up to 1.43:1) and massive contrast. Dolby Atmos offers a multi-dimensional spatial soundscape where up to 64 individual speaker feeds place audio precisely throughout the auditorium."
  },
  {
    q: "Can I show my digital e-ticket on my mobile phone?",
    a: "Yes! Every booking generates a high-resolution QR code ticket accessible directly from your smartphone or saved to your Apple Wallet / Google Wallet. Simply show the QR code at the hall entrance."
  },
  {
    q: "Do you offer student, senior, or military discounts?",
    a: "Yes, special discounted pricing is available on matinee shows Monday through Thursday. Check the Offers page or enter code STUDENT10 during checkout."
  }
];
