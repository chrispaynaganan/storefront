// Form validation schemas — Zod schemas will be added here
// Install: npm install zod

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  return emailRegex.test(email)
}

export function validatePassword(password: string) {
  return password.length >= 8
}

export function validatePhone(phone: string) {
  return /^(\+63|0)[0-9]{10}$/.test(phone)
}
