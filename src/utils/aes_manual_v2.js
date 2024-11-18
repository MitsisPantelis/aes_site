// aes_manual_v2.js

// AES S-box for SubBytes step
export const sBox = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

const rCon = [
  0x00, // not used, but keeps array indexing simple
  0x01, 0x02, 0x04, 0x08, 0x10,
  0x20, 0x40, 0x80, 0x1B, 0x36,
  0x6C, 0xD8, 0xAB, 0x4D, 0x9A,
  0x2F, 0x5E, 0xBC, 0x63, 0xC6,
  0x97, 0x35, 0x6A, 0xD4, 0xB3,
  0x7D, 0xFA, 0xEF, 0xC5, 0x91
];

export const padPKCS7 = (data, blockSize) => {
  const padding = blockSize - (data.length % blockSize);
  if (padding === 0 || padding === blockSize) {
    return data;
  }
  const paddedData = [...data, ...Array(padding).fill(padding)];
  return paddedData;
};

// Function to perform SubBytes step
export const subBytes = (state) => {
  return state.map(byte => sBox[byte]);
};

// Function to perform ShiftRows step
export const shiftRows = (state) => {
  return [
      state[0], state[5], state[10], state[15],  // Row 0 (no shift)
      state[4], state[9], state[14], state[3],   // Row 1 (shift left by 1)
      state[8], state[13], state[2], state[7],   // Row 2 (shift left by 2)
      state[12], state[1], state[6], state[11]   // Row 3 (shift left by 3)
  ];
};

// Helper function for Galois Field multiplication
const gMul = (a, b) => {
  let p = 0;
  for (let i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      const hiBitSet = a & 0x80;
      a = (a << 1) & 0xFF;
      if (hiBitSet) a ^= 0x1b;
      b >>= 1;
  }
  return p;
};

// Function to perform MixColumns step
export const mixColumns = (state) => {
  const temp = state.slice();
  for (let i = 0; i < 4; i++) {
    const col = temp.slice(i * 4, i * 4 + 4);
    console.log(`Slice ${i}:`, col.map(byte => byte.toString(16).padStart(2, '0')));

    state[i * 4]     = gMul(col[0], 2) ^ gMul(col[1], 3) ^ col[2] ^ col[3];
    console.log(`state[${i * 4}] = gMul(${col[0].toString(16).padStart(2, '0')}, 2) ^ gMul(${col[1].toString(16).padStart(2, '0')}, 3) ^ ${col[2].toString(16).padStart(2, '0')} ^ ${col[3].toString(16).padStart(2, '0')} = ${state[i * 4].toString(16).padStart(2, '0')}`);

    state[i * 4 + 1] = col[0] ^ gMul(col[1], 2) ^ gMul(col[2], 3) ^ col[3];
    console.log(`state[${i * 4 + 1}] = ${col[0].toString(16).padStart(2, '0')} ^ gMul(${col[1].toString(16).padStart(2, '0')}, 2) ^ gMul(${col[2].toString(16).padStart(2, '0')}, 3) ^ ${col[3].toString(16).padStart(2, '0')} = ${state[i * 4 + 1].toString(16).padStart(2, '0')}`);

    state[i * 4 + 2] = col[0] ^ col[1] ^ gMul(col[2], 2) ^ gMul(col[3], 3);
    console.log(`state[${i * 4 + 2}] = ${col[0].toString(16).padStart(2, '0')} ^ ${col[1].toString(16).padStart(2, '0')} ^ gMul(${col[2].toString(16).padStart(2, '0')}, 2) ^ gMul(${col[3].toString(16).padStart(2, '0')}, 3) = ${state[i * 4 + 2].toString(16).padStart(2, '0')}`);

    state[i * 4 + 3] = gMul(col[0], 3) ^ col[1] ^ col[2] ^ gMul(col[3], 2);
    console.log(`state[${i * 4 + 3}] = gMul(${col[0].toString(16).padStart(2, '0')}, 3) ^ ${col[1].toString(16).padStart(2, '0')} ^ ${col[2].toString(16).padStart(2, '0')} ^ gMul(${col[3].toString(16).padStart(2, '0')}, 2) = ${state[i * 4 + 3].toString(16).padStart(2, '0')}`);
  }
  return state;
};

// Function to perform AddRoundKey step
export const addRoundKey = (state, roundKey) => {
  return state.map((byte, idx) => byte ^ roundKey[idx]);
};

// Key Expansion Function
export const keyExpansion = (key, keySize) => {
  const expandedKey = [];
  const Nk = keySize / 32; // Number of 32-bit words in the key
  const Nr = Nk + 6;       // Number of rounds (AES-128: 10, AES-192: 12, AES-256: 14)
  let temp = new Array(4);

  // Initial copy of key into expandedKey
  for (let i = 0; i < Nk * 4; i++) {
    expandedKey[i] = key[i];
  }

  // Key expansion loop
  for (let i = Nk; i < 4 * (Nr + 1); i++) {
    temp = expandedKey.slice((i - 1) * 4, i * 4);

    // Apply key schedule core every Nk words
    if (i % Nk === 0) {
      // Rotate the word
      temp = [temp[1], temp[2], temp[3], temp[0]];

      // Substitute each byte using the S-box
      for (let j = 0; j < 4; j++) {
        temp[j] = sBox[temp[j]];
      }

      // XOR with round constant
      temp[0] ^= rCon[i / Nk];
    } else if (Nk > 6 && i % Nk === 4) {
      // Additional substitution step for AES-256
      for (let j = 0; j < 4; j++) {
        temp[j] = sBox[temp[j]];
      }
    }

    // XOR temp with the previous word and store in expanded key
    for (let j = 0; j < 4; j++) {
      expandedKey[i * 4 + j] = expandedKey[(i - Nk) * 4 + j] ^ temp[j];
    }
  }

  return expandedKey;
};

// Function to perform AES encryption step by step
export const aesEncryptStepByStep = (inputText, key, keySize) => {
  const steps = [];
  let state = inputText.split('').map(char => char.charCodeAt(0)); // Convert input text to byte array
  let expandedKey = keyExpansion(key.split('').map(char => char.charCodeAt(0)), keySize); // Convert key to byte array
  const numberOfRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;

  // Perform initial AddRoundKey
  state = addRoundKey(state, expandedKey.slice(0, 16));
  steps.push({ round: 0, state: state.map(b => b.toString(16).padStart(2, '0')) });

  // Main rounds
  for (let round = 1; round <= numberOfRounds; round++) {
      state = subBytes(state);
      steps.push({ round, step: 'SubBytes', state: state.map(b => b.toString(16).padStart(2, '0')) });

      state = shiftRows(state);
      steps.push({ round, step: 'ShiftRows', state: state.map(b => b.toString(16).padStart(2, '0')) });

      if (round !== numberOfRounds) {
          state = mixColumns(state);
          steps.push({ round, step: 'MixColumns', state: state.map(b => b.toString(16).padStart(2, '0')) });
      }

      state = addRoundKey(state, expandedKey.slice(round * 16, (round + 1) * 16));
      steps.push({ round, step: 'AddRoundKey', state: state.map(b => b.toString(16).padStart(2, '0')) });
  }

  console.log('AES Encryption Steps:', steps); // Log the steps for debugging
  return steps;
};
