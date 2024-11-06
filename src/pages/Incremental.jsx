import React, { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import NavbarV2 from '../components/NavbarV2';
import './../styles/Incremental.css';
const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
const keyScheduleSteps = ['Key Expansion', 'AddRoundKey'];
function Incremental() {
  const [currentRound, setCurrentRound] = useState(0); // Start from 0 to include Input and KeySchedule
  const [currentStep, setCurrentStep] = useState('Input');
  const inputText = 'Test';
  const key = 'DefaultKey123456';
  const algorithm = 'ECB';
  const keySize = 128; // Change this value to 192 or 256 to test different key sizes
  const mode = 'Encode';
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  const handleNextRound = () => {
    if (currentRound === 0) {
      setCurrentRound(1);
      setCurrentStep('Key Expansion');
    } else {
      setCurrentRound((prev) => Math.min(prev + 1, totalRounds));
      setCurrentStep('SubBytes');
    }
  };
  const handlePreviousRound = () => {
    if (currentRound === 1) {
      setCurrentRound(0);
      setCurrentStep('Input');
    } else {
      setCurrentRound((prev) => Math.max(prev - 1, 1));
      setCurrentStep('AddRoundKey');
    }
  };
  const handleNextStep = () => {
    if (currentRound === 0) {
      setCurrentRound(1);
      setCurrentStep('Key Expansion');
    } else {
      const currentSteps = currentRound === totalRounds ? finalRoundSteps : currentRound === 1 ? keyScheduleSteps : steps;
      const currentIndex = currentSteps.indexOf(currentStep);
      if (currentIndex < currentSteps.length - 1) {
        setCurrentStep(currentSteps[currentIndex + 1]);
      } else if (currentRound < totalRounds) {
        handleNextRound();
      }
    }
  };
  const handlePreviousStep = () => {
    if (currentRound === 1 && currentStep === 'Key Expansion') {
      setCurrentRound(0);
      setCurrentStep('Input');
    } else if (currentRound === 1 && currentStep === 'SubBytes') {
      setCurrentRound(1);
      setCurrentStep('Key Expansion');
    } else {
      const currentSteps = currentRound === totalRounds ? finalRoundSteps : currentRound === 1 ? keyScheduleSteps : steps;
      const currentIndex = currentSteps.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(currentSteps[currentIndex - 1]);
      } else if (currentRound > 1) {
        handlePreviousRound();
      }
    }
  };
  const handleFinalRound = () => {
    setCurrentRound(totalRounds);
    setCurrentStep('SubBytes');
  };
  const handleInput = () => {
    setCurrentRound(0);
    setCurrentStep('Input');
  };
  const toHex = (str) => {
    return str.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
  };
  const renderContent = () => {
    if (currentRound === 0 && currentStep === 'Input') {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Input Values
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text: {inputText}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Text (Hex): {toHex(inputText)}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key: {key}
          </Typography>
          <Typography variant="body1" component="p" align="center">
            Key (Hex): {toHex(key)}
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
    } else if (currentStep === 'Key Expansion' || currentStep === 'AddRoundKey') {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Key Schedule - {currentStep}
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography variant="h6" component="h2" align="center">
            Round {currentRound} - Step: {currentStep}
          </Typography>
        </Box>
      );
    }
  };
  return (
    <div className="incremental-container">
      <NavbarV2
        currentRound={currentRound}
        currentStep={currentStep}
        inputText={inputText}
        key={key}
        algorithm={algorithm}
        keySize={keySize}
        mode={mode}
        setCurrentRound={setCurrentRound}
        setCurrentStep={setCurrentStep}
      />
      <div className="content">
        {renderContent()}
        <Box mt={2} display="flex" justifyContent="center" alignItems="center" className="buttons-container">
          <Button variant="contained" style={{ backgroundColor: '#4B0082', color: 'white', margin: '8px' }} onClick={handleInput}>
            Input
          </Button>
          <Button variant="contained" color="primary" style={{ margin: '8px' }} onClick={handlePreviousRound}>
            Previous Round
          </Button>
          <Button variant="contained" color="primary" style={{ margin: '8px' }} onClick={handlePreviousStep}>
            Previous Step
          </Button>
          <Button variant="contained" color="primary" style={{ margin: '8px' }} onClick={handleNextStep}>
            Next Step
          </Button>
          <Button variant="contained" color="primary" style={{ margin: '8px' }} onClick={handleNextRound}>
            Next Round
          </Button>
          <Button variant="contained" color="secondary" style={{ margin: '8px' }} onClick={handleFinalRound}>
            Final Round
          </Button>
        </Box>
      </div>
    </div>
  );
}
export default Incremental;