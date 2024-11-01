import CryptoJS from 'crypto-js';
export const handleAesOperation = (inputText, key, mode, algorithm, iv, keySize) => {
  // Validate key length
  const keyLength = key.length * 8; // Convert to bits
  if (keyLength !== keySize) {
    throw new Error(`Key length must be ${keySize} bits.`);
  }
  let result;
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const ivHex = CryptoJS.enc.Utf8.parse(iv);
  if (mode === 'encode') {
    if (algorithm === 'ECB') {
      result = CryptoJS.AES.encrypt(inputText, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }).toString();
    } else if (algorithm === 'CBC') {
      result = CryptoJS.AES.encrypt(inputText, keyHex, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivHex,
      }).toString();
    }
  } else if (mode === 'decode') {
    if (algorithm === 'ECB') {
      const bytes = CryptoJS.AES.decrypt(inputText, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      result = bytes.toString(CryptoJS.enc.Utf8);
    } else if (algorithm === 'CBC') {
      const bytes = CryptoJS.AES.decrypt(inputText, keyHex, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: ivHex,
      });
      result = bytes.toString(CryptoJS.enc.Utf8);
    }
  }
  return result;
};