# FreshCart | Online Grocery Shopping Platform

A modern, responsive, and user-friendly online grocery shopping platform built with semantic HTML5, modern CSS3, and vanilla ES6+ JavaScript. The platform delivers a seamless e-commerce experience where customers can browse high-quality grocery items across multiple categories, view transparent pricing and nutritional data, customize order quantities, apply promo codes, and complete simulated checkouts with persistent state.

---

## 🌟 Key Features

### 🛒 1. Interactive Grocery Catalog
- **Category Browsing**: Dedicated aisles including *Fruits & Vegetables*, *Dairy & Eggs*, *Bakery & Breads*, *Meat & Seafood*, *Pantry Staples*, and *Drinks & Snacks*.
- **Visual Product Badges**: Highlights tags like `Organic`, `Farm Fresh`, `Bestseller`, `Sale -25%`, and `Product of Italy`.
- **Instant Search & Real-Time Filtering**: Search as you type across product names, categories, and ingredients with an instant clear button.
- **Sorting Options**: Sort catalog items by *Featured / Recommended*, *Price: Low to High*, *Price: High to Low*, *Highest Rated*, and *Alphabetical (A-Z)*.

### ⚡ 2. Intuitive Cart & Shopping Experience
- **In-Card Quantity Stepper**: Once an item is added to cart, the button seamlessly morphs into a `[-] [count] [+]` stepper right on the product card.
- **Slide-out Cart Drawer**: Smooth sliding drawer accessible anytime from the top navigation bar with badge counter and real-time total.
- **Dynamic Free Shipping Bar**: Visual progress indicator calculating how much more is needed to reach the `$35.00` free shipping threshold.
- **Promotional Coupon Engine**: Supports promotional codes (e.g., `FRESH20` for 20% off, `GROCERY10` for 10% off, and `WELCOME5` for $5 flat discount).
- **Comprehensive Cost Breakdown**: Automatically calculates Subtotal, Promo Discounts, Delivery Fee, and 5% Estimated Sales Tax.

### 🔍 3. Product Quick View & Nutrition Facts
- Modal popup for each item showing detailed descriptions, high-resolution imagery, stock availability, and a breakdown of nutritional values (Calories, Carbs, Protein, Fats, Fiber).

### ❤️ 4. Wishlist & Favorites
- Save favorite staple groceries with one click on the heart icon.
- Dedicated Wishlist modal to review saved products and quickly transfer them directly into the cart.

### 📦 5. Checkout Flow & Order Confirmation
- Multi-field checkout form capturing customer name, contact phone, street address, and delivery time slot (Express 30-45 mins, Evening, Morning).
- Payment method selector: *Credit/Debit Card*, *Cash on Delivery (COD)*, and *UPI / Digital Wallet*.
- Order confirmation modal with an auto-generated Order ID, itemized receipt breakdown, and a **Print / Save Receipt** button.

### 💾 6. LocalStorage Persistence
- Cart items and wishlist preferences are automatically persisted in the browser's `localStorage`, retaining selections even upon page refresh.

---

## 📁 Project Structure

```
Online Grocery Shopping/
├── index.html            # Semantic HTML5 markup, layout structure & modals
├── css/
│   └── styles.css        # Modern CSS3 with custom properties, flexbox, CSS grid & animations
├── js/
│   ├── products.js       # Product catalog database, categories, and promo code data
│   └── app.js           # Core state management, DOM rendering, cart logic & event handling
└── README.md             # Project documentation and resume summary
```

---

## 🚀 How to Run the Project

1. **Zero Setup Required**: No Node.js, Python, or external build tools are required.
2. Simply double-click **`index.html`** in your file explorer, or right-click `index.html` and choose **Open with > Google Chrome / Microsoft Edge / Firefox / Safari**.
3. Enjoy the complete online grocery shopping experience!

---

## 💼 Resume & Portfolio Description

You can use the following bullet points for your resume, CV, or LinkedIn projects section:

- **Online Grocery Shopping Platform | Front-End Web Application**
  - Designed and developed a responsive, full-featured online grocery shopping web platform using HTML5, modern CSS3, and Vanilla JavaScript (ES6+).
  - Built an intuitive product catalog supporting category filtering across 6+ aisles, multi-parameter sorting, and debounced real-time search functionality.
  - Implemented an interactive shopping cart drawer featuring dynamic quantity steppers, discount promo code validation, a free delivery progress calculator, and automatic cost/tax computation.
  - Engineered state management using browser `localStorage` to ensure cart and wishlist data persist across browser sessions without a backend requirement.
  - Designed responsive, accessible UI components including slide-out drawers, product quick-view modals, toast notifications, and an itemized order receipt generation system.

---

## 🔮 Future Enhancement Ideas

- **Backend Integration**: Connect to Node.js/Express or Python/Django API with a PostgreSQL or MongoDB database.
- **Real Payment Gateway**: Integrate Stripe, PayPal, or Razorpay for real payment processing.
- **User Authentication**: Implement customer sign-up/login with order history tracking.
- **Admin Dashboard**: Provide an administrative view to update product pricing, upload new inventory, and manage order statuses in real-time.
