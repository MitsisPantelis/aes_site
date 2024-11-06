import React from 'react';
import { Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import './../styles/NavbarV2.css';
const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
function NavbarV2({ currentRound, currentStep, inputText, key, algorithm, keySize, mode, setCurrentRound, setCurrentStep }) {
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  const handleStepClick = (round, step) => {
    if (step === 'Input') {
      setCurrentRound(0);
    } else {
      setCurrentRound(round);
    }
    setCurrentStep(step);
  };
  return (
    <div className="sidebar">
      <Box className={`round-box ${currentStep === 'Input' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(0, 'Input')}>
        <Typography variant="h6" component="h2" align="center">
          Input
        </Typography>
      </Box>
      <Box className="round-box" mb={2} onClick={() => handleStepClick(1, 'KeySchedule')}>
        <Typography variant="h6" component="h2" align="center">
          Key Schedule
        </Typography>
        <List>
          <ListItem className={currentStep === 'KeySchedule' ? 'active-step' : ''}>
            <ListItemText primary="Key Expansion" />
          </ListItem>
        </List>
      </Box>
      <Box className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center">
          Round {currentRound === totalRounds ? totalRounds - 1 : currentRound}
        </Typography>
        <List>
          {steps.map((step, index) => (
            <ListItem key={index} className={currentStep === step && currentRound < totalRounds ? 'active-step' : ''} onClick={() => handleStepClick(currentRound === 0 ? 1 : currentRound, step)}>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center">
          Final Round ({totalRounds})
        </Typography>
        <List>
          {finalRoundSteps.map((step, index) => (
            <ListItem key={index} className={currentStep === step && currentRound === totalRounds ? 'active-step' : ''} onClick={() => handleStepClick(totalRounds, step)}>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );
}
export default NavbarV2;