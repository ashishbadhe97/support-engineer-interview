import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// In production this should come from a secure key management service (e.g. AWS KMS).
// For this demo we derive a 32-byte key from the env variable.
function getEncryptionKey(): Buffer {
  const secret = process.env.SSN_ENCRYPTION_KEY || "default-ssn-key-change-in-production";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext SSN.
 * Returns a hex string of: IV + authTag + ciphertext
 */
export function encryptSSN(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Concatenate iv + authTag + ciphertext for storage
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

/**
 * Decrypt an encrypted SSN string back to plaintext.
 */
export function decryptSSN(encrypted: string): string {
  const key = getEncryptionKey();

  const ivHex = encrypted.slice(0, IV_LENGTH * 2);
  const authTagHex = encrypted.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);
  const ciphertext = encrypted.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Mask an SSN for display: "123456789" → "***-**-6789"
 */
export function maskSSN(ssn: string): string {
  const last4 = ssn.slice(-4);
  return `***-**-${last4}`;
}
