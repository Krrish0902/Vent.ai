import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'Krrish-app-secure-key-v1';

export const encryptData = (data: string): string => {
  try {
    // Ensure data is properly encoded as UTF-8
    const utf8Data = CryptoJS.enc.Utf8.parse(data);
    return CryptoJS.AES.encrypt(utf8Data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = (encryptedData: string): string => {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    
    // Convert to UTF-8 string with error handling
    try {
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }
      return decrypted;
    } catch (error) {
      console.error('UTF-8 decoding error:', error);
      throw new Error('Invalid API key format');
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
};

export const generateSecureId = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

export const hashString = (str: string): string => {
  return CryptoJS.SHA256(str).toString();
};