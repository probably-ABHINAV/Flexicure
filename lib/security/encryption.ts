import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Generate encryption key from password
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, "sha256")
}

// Encrypt sensitive data
export function encrypt(text: string, password: string): string {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = deriveKey(password, salt)

  const cipher = crypto.createCipher(ALGORITHM, key)
  cipher.setAAD(salt)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const tag = cipher.getAuthTag()

  // Combine salt + iv + tag + encrypted data
  const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, "hex")])
  return combined.toString("base64")
}

// Decrypt sensitive data
export function decrypt(encryptedData: string, password: string): string {
  const combined = Buffer.from(encryptedData, "base64")

  const salt = combined.subarray(0, 16)
  const iv = combined.subarray(16, 16 + IV_LENGTH)
  const tag = combined.subarray(16 + IV_LENGTH, 16 + IV_LENGTH + TAG_LENGTH)
  const encrypted = combined.subarray(16 + IV_LENGTH + TAG_LENGTH)

  const key = deriveKey(password, salt)

  const decipher = crypto.createDecipher(ALGORITHM, key)
  decipher.setAAD(salt)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, undefined, "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// Hash passwords securely
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256")
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

// Verify password against hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, hashHex] = hashedPassword.split(":")
  const salt = Buffer.from(saltHex, "hex")
  const hash = Buffer.from(hashHex, "hex")

  const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256")
  return crypto.timingSafeEqual(hash, computedHash)
}

// Generate secure random tokens
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Generate CSRF tokens
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

// Verify CSRF tokens
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  return crypto.timingSafeEqual(Buffer.from(token, "base64url"), Buffer.from(expectedToken, "base64url"))
}
