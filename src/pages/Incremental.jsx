import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Select, MenuItem } from '@mui/material';
import { aesEncryptStepByStep } from '../utils/aesManual';
function Incremental() {
  const [inputText, setInputText] = useState('Default text');
  const [key, setKey] = useState('DefaultKey123456');
  const [mode, setMode] = useState('encode');
  const [algorithm, setAlgorithm] = useState('ECB');
  const [iv, setIv] = useState('DefaultIV12345678');
  const [keySize, setKeySize] = useState(128);
  const [steps, setSteps] = useState([]);
  const handleInputChange = (event) => {
    setInputText(event.target.value);
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
  const handleSubmit = () => {
    try {
      const steps = aesEncryptStepByStep(inputText, key, keySize);
      setSteps(steps);
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Step-by-Step AES
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          margin="normal"
          label="Enter text"
          variant="outlined"
          value={inputText}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Enter key"
          variant="outlined"
          value={key}
          onChange={handleKeyChange}
          helperText={`Key length must be ${keySize / 8} characters.`}
        />
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Mode</FormLabel>
          <RadioGroup row aria-label="mode" name="mode" value={mode} onChange={handleModeChange}>
            <FormControlLabel value="encode" control={<Radio />} label="Encode" />
            <FormControlLabel value="decode" control={<Radio />} label="Decode" />
          </RadioGroup>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <FormLabel component="legend">Algorithm</FormLabel>
          <Select
            value={algorithm}
            onChange={handleAlgorithmChange}
            variant="outlined"
          >
            <MenuItem value="ECB">ECB</MenuItem>
            <MenuItem value="CBC">CBC</MenuItem>
          </Select>
        </FormControl>
        {algorithm === 'CBC' && (
          <TextField
            fullWidth
            margin="normal"
            label="Enter IV"
            variant="outlined"
            value={iv}
            onChange={handleIvChange}
          />
        )}
        <FormControl fullWidth margin="normal">
          <FormLabel component="legend">Key Size</FormLabel>
          <Select
            value={keySize}
            onChange={handleKeySizeChange}
            variant="outlined"
          >
            <MenuItem value={128}>128 bits</MenuItem>
            <MenuItem value={192}>192 bits</MenuItem>
            <MenuItem value={256}>256 bits</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit
        </Button>
      </Box>
      {steps.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" component="h2">
            Steps
          </Typography>
          {steps.map((step, index) => (
            <Typography key={index} variant="body1" component="p">
              Round {step.round}: {JSON.stringify(step.state)}
            </Typography>
          ))}
        </Box>
      )}
    </Container>
  );
}
export default Incremental;