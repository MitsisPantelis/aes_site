import React from 'react';
import { Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import './../styles/Sidebar.css';
const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];
function Sidebar({ currentRound, currentStep, inputText, aesKey, algorithm, keySize, mode, setCurrentRound, setCurrentStep }) {
  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size
  const handleStepClick = (round, step) => {
    if (round < 0) {
      setCurrentRound(round);
      setCurrentStep(step);
    } else if (round >= 0 && round < totalRounds) {
      setCurrentRound(round);
      setCurrentStep(step);
    } else if (round === totalRounds) {
      setCurrentRound(totalRounds);
      setCurrentStep(step);
    }
    else if (round === totalRounds + 1) {
      setCurrentRound(totalRounds + 1);
      setCurrentStep(step);
    }
  };
  return (
    <div className="sidebar">
      <Box id="input_box" className={`round-box ${currentStep === 'Input' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(-2, 'Input')}>
        <Typography variant="h6" component="h2" align="center">
          Input
        </Typography>
      </Box>
      <Box id="key_schedule_box" className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center">
          Key Schedule
        </Typography>
        <List>
          <ListItem className={currentStep === 'Key Expansion' ? 'active-step' : ''} onClick={() => handleStepClick(-1, 'Key Expansion')}>
            <ListItemText primary="Key Expansion" />
          </ListItem>
        </List>
      </Box>
      <Box id="round_zero_box" className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center">
          Round 0
        </Typography>
        <List>
          <ListItem className={currentStep === 'AddRoundKey' && currentRound === 0 ? 'active-step' : ''} onClick={() => handleStepClick(0, 'AddRoundKey')}>
            <ListItemText primary="AddRoundKey" />
          </ListItem>
        </List>
      </Box>
      <Box id="round_x_box" className="round-box" mb={2}>
        <Typography variant="h6" component="h2" align="center">
          Round {currentRound <= 1 ? 1 : currentRound >= totalRounds ? totalRounds - 1 : currentRound}
        </Typography>
        <List>
          {steps.map((step, index) => (
            <ListItem key={index} className={currentStep === step && currentRound > 0 && currentRound < totalRounds ? 'active-step' : ''} onClick={() => handleStepClick(currentRound <= 1 ? 1 : currentRound >= totalRounds ? totalRounds - 1 : currentRound, step)}>
              <ListItemText primary={step} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box id="final_round_box" className="round-box" mb={2}>
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
      <Box id="result_box" className={`round-box ${currentStep === 'Result' ? 'active-step' : ''}`} mb={2} onClick={() => handleStepClick(totalRounds + 1, 'Result')}>
        <Typography variant="h6" component="h2" align="center">
          Result
        </Typography>
      </Box>
    </div>
  );
}
export default Sidebar;