import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const DEFAULT_SECRET = "open-dash-project-config-default-secret";
const ENCRYPTION_ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function getProjectConfigSecret(): string {
  console.log("Debug flow: getProjectConfigSecret fired");
  return process.env.PROJECT_CONFIG_SECRET?.trim() || DEFAULT_SECRET;
}

function createEncryptionKey(): Buffer {
  console.log("Debug flow: createEncryptionKey fired");
  const secret = getProjectConfigSecret();
  return createHash("sha256").update(secret).digest();
}

export function encryptProjectConfigValue(plainText: string): string {
  console.log("Debug flow: encryptProjectConfigValue fired", { plainTextLength: plainText.length });
  if (!plainText) {
    return "";
  }
  const iv = randomBytes(IV_LENGTH);
  const key = createEncryptionKey();
  const cipher = createCipheriv(ENCRYPTION_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptProjectConfigValue(encryptedPayload: string): string {
  console.log("Debug flow: decryptProjectConfigValue fired", { payloadLength: encryptedPayload.length });
  if (!encryptedPayload) {
    return "";
  }

  const [ivHex, authTagHex, contentHex] = encryptedPayload.split(":");
  if (!ivHex || !authTagHex || !contentHex) {
    throw new Error("Invalid encrypted project config payload");
  }

  const key = createEncryptionKey();
  const decipher = createDecipheriv(ENCRYPTION_ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
