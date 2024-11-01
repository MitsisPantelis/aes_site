import React, { useState } from 'react';
import { Typography, List, ListItem, ListItemText, Box, TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Select, MenuItem, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { aesEncryptStepByStep } from '../utils/aesManual';
import './../styles/StepByStep.css';

function StepByStep() {
  const [rounds, setRounds] = useState(['Initial round']);
  const [selectedRound, setSelectedRound] = useState('Initial round');
  const [expandedRounds, setExpandedRounds] = useState({});
  const [selectedStep, setSelectedStep] = useState('');
  const [inputText, setInputText] = useState('Default text');
  const [key, setKey] = useState('DefaultKey123456');
  const [mode, setMode] = useState('encode');
  const [algorithm, setAlgorithm] = useState('ECB');
  const [iv, setIv] = useState('DefaultIV12345678');
  const [keySize, setKeySize] = useState(128);
  const [result, setResult] = useState('');
  const [inputHex, setInputHex] = useState('');
  const [inputHexPadded, setInputHexPadded] = useState('');
  const [keyHex, setKeyHex] = useState('');
  const [encryptionSteps, setEncryptionSteps] = useState([]);

  const handleInputChange = (event) => {
    const value = event.target.value.slice(0, 16); // Limit input to 16 characters
    setInputText(value);
  };

  const handleKeyChange = (event) => {
    setKey(event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  const handleAlgorithmChange = (event) => {
    setAlgorithm(event.target.value);
  };

  const handleIvChange = (event) => {
    setIv(event.target.value);
  };

  const handleKeySizeChange = (event) => {
    setKeySize(event.target.value);
  };


  const padPKCS7 = (data, blockSize) => {
    const padding = blockSize - (data.length % blockSize);
    console.log(`Data length: ${data.length}, Padding: ${padding}`);
    if (padding === 0 || padding === blockSize) {
      return data;
    }
    const paddedData = [...data, ...Array(padding).fill(padding)];
    return paddedData;
  };

  const handleSubmit = () => {
    // Validate key length
    const keyLength = key.length * 8; // Convert to bits
    if (keyLength !== keySize) {
      alert(`Key length must be ${keySize} bits.`);
      return;
    }

    // Convert input text and key to hex
    const inputHex = Array.from(inputText, (char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    const keyHex = Array.from(key, (char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');

    // Apply PKCS#7 padding
    const inputBytes = Array.from(inputText, (char) => char.charCodeAt(0));
    const paddedInputBytes = padPKCS7(inputBytes, 16);
    const inputHexPadded = paddedInputBytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');

    setInputHex(inputHex);
    setInputHexPadded(inputHexPadded);
    setKeyHex(keyHex);

    // Save user inputs
    const userInputs = {
      inputText,
      key,
      mode,
      algorithm,
      iv,
      keySize,
    };

    // Determine the number of rounds based on key size
    let numberOfRounds;
    if (keySize === 128) {
      numberOfRounds = 10;
    } else if (keySize === 192) {
      numberOfRounds = 12;
    } else if (keySize === 256) {
      numberOfRounds = 14;
    }

    // Create rounds dynamically
    const newRounds = ['Initial round'];
    for (let i = 1; i <= numberOfRounds; i++) {
      newRounds.push(`Round ${i}`);
    }
    setRounds(newRounds);

    // Perform AES encryption step by step
    const steps = aesEncryptStepByStep(inputText, key, keySize);
    setEncryptionSteps(steps);

    // Log user inputs for debugging
    console.log(userInputs);
  };

  const handleRoundClick = (round) => {
    setSelectedRound(round);
    setExpandedRounds((prev) => {
      const newExpandedRounds = {};
      Object.keys(prev).forEach((key) => {
        newExpandedRounds[key] = key === round ? !prev[key] : false;
      });
      if (!prev[round]) {
        newExpandedRounds[round] = true;
      }
      return newExpandedRounds;
    });
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
  };

  const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
  const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];

  return (
    <div className="stepbystep-container">
      <div className="sidebar">
        <List>
          {rounds.map((round, index) => (
            <div key={index} className="round-container">
              <ListItem button onClick={() => handleRoundClick(round)}>
                <ListItemText primary={round} />
                {round !== 'Initial round' && (expandedRounds[round] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>
              {round !== 'Initial round' && (
                <Collapse in={expandedRounds[round]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className="steps-container">
                    {round === `Round ${rounds.length - 1}` ? (
                      finalRoundSteps.map((step, stepIndex) => (
                        <ListItem button key={stepIndex} style={{ paddingLeft: 32 }} className="step-item" onClick={() => handleStepClick(step)}>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))
                    ) : (
                      steps.map((step, stepIndex) => (
                        <ListItem button key={stepIndex} style={{ paddingLeft: 32 }} className="step-item" onClick={() => handleStepClick(step)}>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </div>
      <div className="content">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Step-by-Step AES
        </Typography>
        {selectedRound === 'Initial round' && (
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              margin="dense"
              label="Enter text"
              variant="outlined"
              value={inputText}
              onChange={handleInputChange}
              size="small"
              inputProps={{ maxLength: 16 }} // Limit input to 16 characters
            />
            <TextField
              fullWidth
              margin="dense"
              label="Enter key"
              variant="outlined"
              value={key}
              onChange={handleKeyChange}
              helperText={`Key length must be ${keySize / 8} characters.`}
              size="small"
            />
            <FormControl component="fieldset" margin="dense">
              <FormLabel component="legend">Mode</FormLabel>
              <RadioGroup row aria-label="mode" name="mode" value={mode} onChange={handleModeChange}>
                <FormControlLabel value="encode" control={<Radio />} label="Encode" />
                <FormControlLabel value="decode" control={<Radio />} label="Decode" />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <FormLabel component="legend">Algorithm</FormLabel>
              <Select
                value={algorithm}
                onChange={handleAlgorithmChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="ECB">ECB</MenuItem>
                <MenuItem value="CBC">CBC</MenuItem>
              </Select>
            </FormControl>
            {algorithm === 'CBC' && (
              <TextField
                fullWidth
                margin="dense"
                label="Enter IV"
                variant="outlined"
                value={iv}
                onChange={handleIvChange}
                size="small"
              />
            )}
            <FormControl fullWidth margin="dense">
              <FormLabel component="legend">Key Size</FormLabel>
              <Select
                value={keySize}
                onChange={handleKeySizeChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value={128}>128 bits</MenuItem>
                <MenuItem value={192}>192 bits</MenuItem>
                <MenuItem value={256}>256 bits</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
              Submit
            </Button>
            {inputHex && (
              <Box mt={2}>
                <Typography variant="h6" component="h2">
                  Input Text in Hex
                </Typography>
                <Typography variant="body1" component="p">
                  Without Padding: {inputHex}
                </Typography>
                <Typography variant="body1" component="p">
                  With Padding: {inputHexPadded}
                </Typography>
                <Typography variant="h6" component="h2">
                  Key in Hex
                </Typography>
                <Typography variant="body1" component="p">
                  {keyHex}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {selectedRound !== 'Initial round' && (
          <Box>
            <Typography variant="h6" component="h2">
              {selectedRound}
            </Typography>
            {selectedStep && (
              <Typography variant="h6" component="h3">
                Step: {selectedStep}
              </Typography>
            )}
            {encryptionSteps.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6" component="h2">
                  Round Result
                </Typography>
                {encryptionSteps
                  .filter((step) => step.round === parseInt(selectedRound.split(' ')[1], 10))
                  .map((step, index) => (
                    <Typography key={index} variant="body1" component="p">
                      {step.state.join(' ')}
                    </Typography>
                  ))}
              </Box>
            )}
          </Box>
        )}
      </div>
    </div>
  );
}

export default StepByStep;