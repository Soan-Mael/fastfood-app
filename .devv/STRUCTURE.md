# This file is only for editing file nodes, do not break the structure

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│   ├── Header.tsx  # Main navigation header component with mobile and desktop layouts
│   ├── Footer.tsx  # Site footer with navigation links and copyright information
│   ├── HeroSection.tsx # Hero banner with search functionality for the homepage
│   ├── CategoryFilter.tsx # Horizontal scrollable filter for food categories
│   ├── RestaurantCard.tsx # Card component displaying restaurant information
│   ├── PopularDishes.tsx # Horizontal scrollable list of popular food items
│   ├── Testimonials.tsx # Customer testimonials section
│   └── CartComponent.tsx # Shopping cart component with checkout functionality and detailed address form
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.ts  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions, including the cn function for merging Tailwind class names
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.tsx # Home page with hero banner, categories, featured restaurants and CTA
│   ├── RestaurantsPage.tsx # List of all restaurants with filtering options
│   ├── RestaurantDetailPage.tsx # Individual restaurant detail page with menu items
│   ├── LoginPage.tsx # User login page with email and password authentication
│   ├── UserRegistrationPage.tsx # User registration page for customers
│   ├── RestaurantRegistrationPage.tsx # Registration page for restaurant owners
│   ├── OrdersPage.tsx # Order history page displaying user's orders and order status with detailed address information
│   └── NotFoundPage.tsx # 404 error page component, displays when users access non-existent routes
│
├── store/          # State management directory
│   ├── cart-store.ts # Shopping cart state management using zustand
│   └── order-store.ts # Order history state management using zustand with enhanced address details
│
├── App.tsx         # Root component, with React Router routing system configured
│                   # Routes for homepage, restaurants listing, restaurant details, login, registration, orders
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.tsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modified with food-themed color palette and custom component classes
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
                      # Contains theme customization, plugins, and content paths
                      # Includes shadcn/ui theme configuration 