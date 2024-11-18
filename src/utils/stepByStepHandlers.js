import { keyExpansion, padPKCS7, addRoundKey, subBytes, shiftRows, mixColumns } from '../utils/aes_manual_v2';

const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];

export const generateStateMap = (initialPaddedState, roundKeys, totalRounds) => {
  const newStateMap = new Map();
  newStateMap.set(-2, [{ step: 'Input', state: toHex(initialPaddedState) }]);
  newStateMap.set(-1, [{ step: 'Key Expansion', state: toHex(initialPaddedState) }]);

  let currentState = initialPaddedState;

  for (let i = 0; i <= totalRounds; i++) {
    if (i === 0) { // Round 0
      currentState = addRoundKey(currentState, roundKeys[i]);
      newStateMap.set(i, [{ step: 'AddRoundKey', state: toHex(currentState) }]);
    } else if (i === totalRounds) { // Final Round
      const roundSteps = finalRoundSteps.map(step => {
        if (step === 'SubBytes') {
          currentState = subBytes(currentState);
        } else if (step === 'ShiftRows') {
          currentState = shiftRows(currentState);
        } else if (step === 'AddRoundKey') {
          currentState = addRoundKey(currentState, roundKeys[i]);
        }
        return { step, state: toHex(currentState) };
      });
      newStateMap.set(i, roundSteps);
    } else { // Other Rounds
      const roundSteps = steps.map(step => {
        if (step === 'SubBytes') {
          currentState = subBytes(currentState);
        } else if (step === 'ShiftRows') {
          currentState = shiftRows(currentState);
        } else if (step === 'MixColumns') {
          currentState = mixColumns(currentState);
        } else if (step === 'AddRoundKey') {
          currentState = addRoundKey(currentState, roundKeys[i]);
        }
        return { step, state: toHex(currentState) };
      });
      newStateMap.set(i, roundSteps);
    }
  }

  console.log('newStateMap:', JSON.stringify(Array.from(newStateMap.entries()), null, 2));
  return newStateMap;
};

export const handleSubmitButtonClick = (tempKey, tempInputText, keySize, setKeyError, setInputText, setKey, setSidebarVisible, setRoundKeys, setStateMap) => {
  if (tempKey.length !== 16) {
    setKeyError('Key must be exactly 16 characters long');
    return;
  }
  setKeyError('');
  setInputText(tempInputText);
  setKey(tempKey);
  const initialState = tempInputText.split('').map(char => char.charCodeAt(0));
  const paddedState = padPKCS7(initialState, 16);
  setSidebarVisible(true);
  // Generate round keys
  const expandedKey = keyExpansion(tempKey.split('').map(char => char.charCodeAt(0)), keySize);
  const roundKeys = [];
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;
  for (let i = 0; i <= totalRounds; i++) {
    roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
  }
  setRoundKeys(roundKeys);

  // Generate state map
  const newStateMap = generateStateMap(paddedState, roundKeys, totalRounds);

  // Set state map to newStateMap
  setStateMap(newStateMap);
};

export const handleNextRound = (currentRound, setCurrentRound, setCurrentStep, totalRounds) => {
  if (currentRound === -2) {
    setCurrentRound(-1);
    setCurrentStep('Key Expansion');
  } else if (currentRound === -1) {
    setCurrentRound(0);
    setCurrentStep('AddRoundKey');
  } else {
    setCurrentRound((prev) => Math.min(prev + 1, totalRounds));
    setCurrentStep('SubBytes');
  }
};

export const handlePreviousRound = (currentRound, setCurrentRound, setCurrentStep) => {
  if (currentRound === -1) {
    setCurrentRound(-2);
    setCurrentStep('Input');
  } else if (currentRound === 0) {
    setCurrentRound(-1);
    setCurrentStep('Key Expansion');
  } else {
    setCurrentRound((prev) => Math.max(prev - 1, 0));
    setCurrentStep('AddRoundKey');
  }
};

export const handleNextStep = (currentRound, currentStep, setCurrentStep, handleNextRound, totalRounds) => {
  if (currentRound === -2) {
    handleNextRound();
  } else if (currentRound === -1) {
    handleNextRound();
  } else {
    const currentSteps = currentRound === 0 ? ['AddRoundKey'] : currentRound === totalRounds ? finalRoundSteps : steps;
    const currentIndex = currentSteps.indexOf(currentStep);
    if (currentIndex < currentSteps.length - 1) {
      setCurrentStep(currentSteps[currentIndex + 1]);
    } else if (currentRound < totalRounds) {
      handleNextRound();
    }
  }
};

export const handlePreviousStep = (currentRound, currentStep, setCurrentStep, handlePreviousRound, totalRounds) => {
  if (currentRound === -1 && currentStep === 'Key Expansion') {
    handlePreviousRound();
  } else if (currentRound === 0 && currentStep === 'AddRoundKey') {
    handlePreviousRound();
  } else {
    const currentSteps = currentRound === 0 ? ['AddRoundKey'] : currentRound === totalRounds ? finalRoundSteps : steps;
    const currentIndex = currentSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(currentSteps[currentIndex - 1]);
    } else if (currentRound > -2) {
      handlePreviousRound();
    }
  }
};

export const handleStepClick = (round, step, setCurrentRound, setCurrentStep) => {
  setCurrentRound(round);
  setCurrentStep(step);
};

export const handleFinalRound = (setCurrentRound, setCurrentStep, totalRounds) => {
  setCurrentRound(totalRounds);
  setCurrentStep('SubBytes');
};

export const handleInput = (setCurrentRound, setCurrentStep) => {
  setCurrentRound(-2);
  setCurrentStep('Input');
};

const toHex = (arr) => {
  return arr.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
};