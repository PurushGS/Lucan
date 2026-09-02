import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1";

function getKey() {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || process.env.LOGTO_COOKIE_SECRET;
  if (!secret) {
    throw new Error("Missing TOKEN_ENCRYPTION_SECRET or LOGTO_COOKIE_SECRET for token encryption.");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSecret(value: string) {
  const [prefix, version, ivText, tagText, encryptedText] = value.split(":");
  if (`${prefix}:${version}` !== PREFIX || !ivText || !tagText || !encryptedText) {
    throw new Error("Stored secret is not in the expected encrypted format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
