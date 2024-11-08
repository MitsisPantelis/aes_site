import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { keyExpansion, padPKCS7, addRoundKey, subBytes, shiftRows, mixColumns } from '../utils/aes_manual_v2'; // Import the keyExpansion and addRoundKey functions
import './../styles/StepByStep.css';

const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];

function StepByStep() {
  const [currentRound, setCurrentRound] = useState(-2); // Start from -2 to include Input and KeySchedule
  const [currentStep, setCurrentStep] = useState('Input');
  const [roundKeys, setRoundKeys] = useState([]);
  const [inputText, setInputText] = useState('Test');
  const [key, setKey] = useState('DefaultKey123456');
  const [currentState, setCurrentState] = useState([]);
  const [newState, setNewState] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [tempInputText, setTempInputText] = useState(inputText);
  const [tempKey, setTempKey] = useState(key);
  const [stateMap, setStateMap] = useState(new Map());
  const algorithm = 'ECB';
  const keySize = 128; // Change this value to 192 or 256 to test different key sizes
  const mode = 'Encode';

  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size

  const generateStateMap = (initialPaddedState, roundKeys) => {
    const newStateMap = new Map();
    newStateMap.set(-2, [{ step: 'Input', state: toHex(initialPaddedState) }]);
    newStateMap.set(-1, [{ step: 'Key Expansion', state: toHex(initialPaddedState) }]);

    let currentState = initialPaddedState;

    for (let i = 0; i <= totalRounds; i++) {
      if (i === 0) { // Round 0
        currentState = addRoundKey(currentState, roundKeys[i]);
        newStateMap.set(i, [{ step: 'AddRoundKey', state: toHex(currentState) }]);
      } else if (i === totalRounds) { // Final Round
        const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
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

  const handleSubmitButtonClick = () => {
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
    for (let i = 0; i <= totalRounds; i++) {
      roundKeys.push(expandedKey.slice(i * 16, (i + 1) * 16));
    }
    setRoundKeys(roundKeys);

    // Generate state map
    const newStateMap = generateStateMap(paddedState, roundKeys);

    // Initialize debug map with incremented values
    const debugMap = new Map();
    let incrementedState = paddedState.map(byte => byte + 1);
    debugMap.set(-2, [{ step: 'Input', state: toHex(incrementedState) }]);
    debugMap.set(-1, [{ step: 'Key Expansion', state: toHex(incrementedState) }]);
    for (let i = 0; i <= totalRounds; i++) {
      debugMap.set(i, steps.map((step, stepIndex) => {
        incrementedState = incrementedState.map(byte => byte + 1);
        return { step, state: toHex(incrementedState) };
      }));
    }

    // Set state map to newStateMap
    setStateMap(newStateMap);
    // console.log('newStateMap:', JSON.stringify(Array.from(newStateMap.entries()), null, 2));
    // console.log('debugMap:', debugMap);
  };

  const handleNextRound = () => {
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
    setCurrentState(newState);
  };

  const handlePreviousRound = () => {
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
    setCurrentState(newState);
  };

  const handleNextStep = () => {
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

  const handlePreviousStep = () => {
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

  const handleStepClick = (round, step) => {
    setCurrentRound(round);
    setCurrentStep(step);
  };

  const handleFinalRound = () => {
    setCurrentRound(totalRounds);
    setCurrentStep('SubBytes');
  };

  const handleInput = () => {
    setCurrentRound(-2);
    setCurrentStep('Input');
  };

  const toHex = (arr) => {
    return arr.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
  };

  const renderContent = () => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex(step => step.step === currentStep);
    const stepState = roundSteps[stepIndex]?.state || '';
    let previousStepState = '';

    const initialState = inputText.split('').map(char => char.charCodeAt(0));
    const paddedState = padPKCS7(initialState, 16);
    const resultState = stateMap.get(totalRounds)?.find(step => step.step === 'AddRoundKey')?.state || '';

    const hexToText = (hex) => {
      return hex.split(' ').map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
    };

    if (stepIndex > 0) {
      previousStepState = roundSteps[stepIndex - 1]?.state || '';
    } else if (currentRound > 0) {
      const previousRoundSteps = stateMap.get(currentRound - 1) || [];
      const addRoundKeyStep = previousRoundSteps.find(step => step.step === 'AddRoundKey');
      previousStepState = addRoundKeyStep?.state || '';
    } else if (currentRound === 0) {
      previousStepState = toHex(paddedState);
    }

    if (currentRound === -2 && currentStep === 'Input') {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Input Values
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text: {inputText}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text (Hex): {toHex(initialState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Padded Text (Hex): {toHex(paddedState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key: {key}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key (Hex): {toHex(key.split('').map(char => char.charCodeAt(0)))}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Algorithm: {algorithm}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key Size: {keySize} bits
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Mode: {mode}
          </Typography>
        </Box>
      );
    } else if (currentRound === -1 && currentStep === 'Key Expansion') {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Key Schedule - Key Expansion
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Key: {toHex(key.split('').map(char => char.charCodeAt(0)))}
          </Typography>
          {roundKeys.map((roundKey, index) => (
            <Typography key={index} variant="body1" component="p" align="center">
              Round {index} Key: {toHex(roundKey)}
            </Typography>
          ))}
        </Box>
      );
    } else if (currentRound >= 0 && currentRound <= totalRounds) {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Round {currentRound} - Step: {currentStep}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Previous State: {previousStepState}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            State: {stepState}
          </Typography>
          {currentStep === 'AddRoundKey' && (
            <Typography variant="body1" component="p" align="center">
              Round Key: {toHex(roundKeys[currentRound])}
            </Typography>
          )}
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Result
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Text: {inputText}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Input Text Padded (Hex): {toHex(paddedState)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key (Hex): {toHex(key.split('').map(char => char.charCodeAt(0)))}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Result (Hex): {resultState}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Result: {hexToText(resultState)}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <div className="stepbystep-container">
      {sidebarVisible && (
        <Sidebar
          currentRound={currentRound}
          currentStep={currentStep}
          inputText={inputText}
          aeskey={key}
          algorithm={algorithm}
          keySize={keySize}
          mode={mode}
          setCurrentRound={setCurrentRound}
          setCurrentStep={setCurrentStep}
          handleStepClick={handleStepClick}
        />
      )}
      <div className="content">
        {renderContent()}
        <Box mt={2} display="flex" justifyContent="center" alignItems="center" className="buttons-container">
          {currentRound === -2 && (
            <Box id="input_box" className="input-box" display="flex" flexDirection="column" alignItems="center" width="50%">
              <TextField
                label="Input Text"
                value={tempInputText}
                onChange={(e) => setTempInputText(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 16 }}
              />
              <TextField
                label="Key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!keyError}
                helperText={keyError}
                inputProps={{ maxLength: 16 }}
              />
              <Button variant="contained" color="primary" onClick={handleSubmitButtonClick} style={{ marginTop: '16px' }}>
                Submit
              </Button>
            </Box>
          )}
          {sidebarVisible && (
            <>
              <Button
                variant="contained"
                style={{ backgroundColor: '#4B0082', color: 'white', margin: '8px' }}
                onClick={handleInput}
                disabled={currentRound === -2 && currentStep === 'Input'}
              >
                Input
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={handlePreviousRound}
                disabled={currentRound <= 0}
              >
                Previous Round
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={handlePreviousStep}
                disabled={currentRound === -2 && currentStep === 'Input'}
              >
                Previous Step
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={handleNextStep}
                disabled={currentRound >= totalRounds && (currentStep === 'AddRoundKey' || currentStep === 'Result')}
              >
                Next Step
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={handleNextRound}
                disabled={currentRound >= totalRounds}
              >
                Next Round
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ margin: '8px' }}
                onClick={handleFinalRound}
                disabled={currentRound >= totalRounds}
              >
                Final Round
              </Button>
            </>
          )}
        </Box>
      </div>
    </div>
  );
}

export default StepByStep;