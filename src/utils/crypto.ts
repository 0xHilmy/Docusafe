import CryptoJS from 'crypto-js';

export function generateSHA256Hash(content: string): string {
  return CryptoJS.SHA256(content).toString();
}

export function generateDocumentId(): string {
  return Math.random().toString(36).substr(2, 9);
}
