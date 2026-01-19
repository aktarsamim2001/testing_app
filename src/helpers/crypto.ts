import CryptoJS from "crypto-js";

const secret = "my-secret-key"; // Exposed in frontend, for demo only

export function encryptId(id: string | number): string {
  return CryptoJS.AES.encrypt(id.toString(), secret).toString();
}

export function decryptId(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encrypted), secret);
  return bytes.toString(CryptoJS.enc.Utf8);
}