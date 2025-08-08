import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'Krrish-app-secure-key-v1';

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generateSecureId = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

export const hashString = (str: string): string => {
  return CryptoJS.SHA256(str).toString();
};