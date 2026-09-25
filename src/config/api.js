// Centralized API configuration
// Change HOST in this one place to point the whole app at a different server.
//
// LOCAL DEV (current): backend on this PC at port 5000, reached over USB.
//   Run once:  adb reverse tcp:5000 tcp:5000
//   Then the phone's localhost:5000 tunnels to this PC's backend over USB.
//   (No WiFi / LAN IP / firewall needed with adb reverse.)
// PRODUCTION: set HOST back to 'https://sangamwholesale.com'.
export const HOST = 'https://sangamwholesale.com';

export const BASE_URL = `${HOST}/api`;

// Razorpay
export const RAZORPAY_KEY_ID = 'rzp_live_TadrWdNN9MTuis';

export const ENDPOINTS = {
  // Auth
  SEND_OTP: `${BASE_URL}/user/send-otp`,
  VERIFY_OTP: `${BASE_URL}/user/verify-otp`,
  USER_PROFILE: `${BASE_URL}/user/profile`,
  DELETE_ACCOUNT: `${BASE_URL}/user/delete`,

  // Business
  BUSINESS_GET: `${BASE_URL}/business/get`,
  BUSINESS_CREATE: `${BASE_URL}/business/create`,
  BUSINESS_UPDATE: `${BASE_URL}/business/update`,

  // Products & Categories
  CATEGORIES: `${BASE_URL}/categories/`,
  SUBCATEGORIES: `${BASE_URL}/subcategories/`,
  PRODUCTS: `${BASE_URL}/products/`,
  BANNERS: `${BASE_URL}/banners/`,

  // Cart
  CART: `${BASE_URL}/cart`,

  // Wishlist
  WISHLIST: `${BASE_URL}/wishlist`,

  // Orders
  ORDERS: `${BASE_URL}/orders/`,

  // Addresses
  ADDRESSES: `${BASE_URL}/addresses/`,

  // Notifications
  USER_NOTIFICATIONS: `${BASE_URL}/user/notifications`,

  // Returns
  RETURN_ORDERS: `${BASE_URL}/return-orders`,

  // Payments
  PAYMENTS_CREATE_ORDER: `${BASE_URL}/payments/create-order`,
  PAYMENTS_VERIFY: `${BASE_URL}/payments/verify-payment`,

  // Bank Accounts
  BANK_ACCOUNTS: `${BASE_URL}/bank-accounts`,

  // KYC
  KYC_UPLOAD: `${BASE_URL}/kyc/upload`,
  KYC_ME: `${BASE_URL}/kyc/me`,
};

// Image base URLs
export const IMAGE_BASE = {
  PRODUCTS: `${HOST}/products/`,
  CATEGORIES: `${HOST}/categories/`,
  SUBCATEGORIES: `${HOST}/subcategories/`,
  BANNERS: `${HOST}/`,
  BUSINESS: `${HOST}/business/`,
};
