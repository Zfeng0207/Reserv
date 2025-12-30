import { customAlphabet } from "nanoid"

// Use nanoid with base62 alphabet (a-zA-Z0-9)
const generateCode = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6)

/**
 * Generate a random short code (6 characters, base62)
 * Uses nanoid for better collision resistance
 */
export function generateShortCode(): string {
  return generateCode()
}

