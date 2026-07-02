export const MESSAGES = {
  // Common
  SUCCESS: "Success",
  FAILED: "Failed",

  // Authentication
  REGISTER_SUCCESS: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",

  INVALID_CREDENTIALS: "Invalid email or password",

  UNAUTHORIZED: "Unauthorized",

  FORBIDDEN: "Forbidden",

  ACCESS_TOKEN_REQUIRED: "Access token is required",

  REFRESH_TOKEN_REQUIRED: "Refresh token is required",

  INVALID_TOKEN: "Invalid token",

  TOKEN_EXPIRED: "Token expired",

  // User
  USER_NOT_FOUND: "User not found",

  EMAIL_ALREADY_EXISTS: "Email already exists",

  // Product
  PRODUCT_CREATED: "Product created successfully",

  PRODUCT_UPDATED: "Product updated successfully",

  PRODUCT_DELETED: "Product deleted successfully",

  PRODUCT_NOT_FOUND: "Product not found",

  // Order
  ORDER_CREATED: "Order created successfully",

  ORDER_NOT_FOUND: "Order not found",
} as const;