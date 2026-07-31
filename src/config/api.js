// Centralized API configuration
// Change this one value to point the whole app at a different server

export const BASE_URL = 'https://sangamwholesale.com/api';

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

  // Returns
  RETURN_ORDERS: `${BASE_URL}/return-orders`,

  // Bank Accounts
  BANK_ACCOUNTS: `${BASE_URL}/bank-accounts`,

  // KYC
  KYC_UPLOAD: `${BASE_URL}/kyc/upload`,
  KYC_ME: `${BASE_URL}/kyc/me`,
};

// Image base URLs
export const IMAGE_BASE = {
  PRODUCTS: 'https://sangamwholesale.com/products/',
  CATEGORIES: 'https://sangamwholesale.com/categories/',
  SUBCATEGORIES: 'https://sangamwholesale.com/subcategories/',
  BANNERS: 'https://sangamwholesale.com/',
  BUSINESS: 'https://sangamwholesale.com/business/',
};
