// Simplified AES implementation for educational purposes
const sBox = [
    // Populate with 256 S-box values
];
const rCon = [
    // Populate with AES Rcon values
];

function subBytes(state) {
    // Perform S-box substitution for each byte in the state
    for (let i = 0; i < state.length; i++) {
        state[i] = sBox[state[i]];
    }
    return state;
}

function shiftRows(state) {
    // Perform row shifting to simulate a 4x4 state matrix
    return [
        state[0], state[1], state[2], state[3],
        state[5], state[6], state[7], state[4],
        state[10], state[11], state[8], state[9],
        state[15], state[12], state[13], state[14]
    ];
}

function mixColumns(state) {
    // MixColumns operation for each column
    for (let c = 0; c < 4; c++) {
        const a = state.slice(c * 4, c * 4 + 4);
        state[c * 4] = gMul(a[0], 2) ^ gMul(a[1], 3) ^ gMul(a[2], 1) ^ gMul(a[3], 1);
        state[c * 4 + 1] = gMul(a[0], 1) ^ gMul(a[1], 2) ^ gMul(a[2], 3) ^ gMul(a[3], 1);
        state[c * 4 + 2] = gMul(a[0], 1) ^ gMul(a[1], 1) ^ gMul(a[2], 2) ^ gMul(a[3], 3);
        state[c * 4 + 3] = gMul(a[0], 3) ^ gMul(a[1], 1) ^ gMul(a[2], 1) ^ gMul(a[3], 2);
    }
    return state;
}

function gMul(a, b) {
    // Galois Field multiplication of two numbers in GF(2^8)
    let p = 0;
    for (let i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        const hiBitSet = a & 0x80;
        a = (a << 1) & 0xFF;
        if (hiBitSet) a ^= 0x1b;
        b >>= 1;
    }
    return p;
}

function addRoundKey(state, roundKey) {
    for (let i = 0; i < state.length; i++) {
        state[i] ^= roundKey[i];
    }
    return state;
}

function keyExpansion(key, keySize) {
    const expandedKey = [];
    let temp;
    const Nk = keySize / 32; // Number of 32-bit words in the key
    const Nr = Nk + 6; // Number of rounds
    for (let i = 0; i < Nk * 4; i++) {
        expandedKey[i] = key[i];
    }
    for (let i = Nk * 4; i < (Nr + 1) * 16; i += 4) {
        temp = expandedKey.slice(i - 4, i);
        if (i % (Nk * 4) === 0) {
            temp = [sBox[temp[1]], sBox[temp[2]], sBox[temp[3]], sBox[temp[0]]];
            temp[0] ^= rCon[i / (Nk * 4)];
        } else if (Nk > 6 && i % (Nk * 4) === 16) {
            temp = [sBox[temp[0]], sBox[temp[1]], sBox[temp[2]], sBox[temp[3]]];
        }
        for (let j = 0; j < 4; j++) {
            expandedKey[i + j] = expandedKey[i + j - Nk * 4] ^ temp[j];
        }
    }
    return expandedKey;
}

export function aesEncryptStepByStep(plaintext, key, keySize) {
    // Convert plaintext and key to byte arrays
    let state = Array.from(plaintext, (char) => char.charCodeAt(0));
    const expandedKey = keyExpansion(Array.from(key, (char) => char.charCodeAt(0)), keySize);
    const steps = [];
    const Nr = keySize / 32 + 6; // Number of rounds

    // Helper to convert state to hexadecimal format
    function stateToHex(state) {
        return state.map(byte => byte.toString(16).padStart(2, '0')); // Format as 2-digit hex
    }

    // Initial round
    state = addRoundKey(state, expandedKey.slice(0, 16));
    steps.push({ round: 0, state: stateToHex(state) });

    // Main rounds
    for (let round = 1; round < Nr; round++) {
        state = subBytes(state);
        state = shiftRows(state);
        state = mixColumns(state);
        state = addRoundKey(state, expandedKey.slice(round * 16, (round + 1) * 16));
        steps.push({ round, state: stateToHex(state) });
    }

    // Final round (without MixColumns)
    state = subBytes(state);
    state = shiftRows(state);
    state = addRoundKey(state, expandedKey.slice(Nr * 16, (Nr + 1) * 16));
    steps.push({ round: Nr, state: stateToHex(state) });

    return steps;
}