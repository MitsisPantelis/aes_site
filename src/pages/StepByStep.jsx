import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { handleSubmitButtonClick, handleNextRound, handlePreviousRound, handleNextStep, handlePreviousStep, handleStepClick, handleFinalRound, handleInput, generateStateMap } from '../utils/stepByStepHandlers';
import { padPKCS7, sBox } from '../utils/aes_manual_v2'; // Import the padPKCS7 function
import './../styles/StepByStep.css';

export const highlightColor = 'rgba(128, 0, 128, '; // Purplish color

const steps = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey'];
const finalRoundSteps = ['SubBytes', 'ShiftRows', 'AddRoundKey'];

const formatAsMatrix = (hexString) => {
  const bytes = hexString.split(' ');
  const matrix = [];
  for (let i = 0; i < 4; i++) {
    matrix.push(bytes.slice(i * 4, i * 4 + 4));
  }
  return matrix;
};

function StepByStep() {
  const [currentRound, setCurrentRound] = useState(-2); // Start from -2 to include Input and KeySchedule
  const [currentStep, setCurrentStep] = useState('Input');
  const [roundKeys, setRoundKeys] = useState([]);
  const [inputText, setInputText] = useState('Test');
  const [key, setKey] = useState('DefaultKey123456');
  const [currentState, setCurrent] = useState([]);
  const [newState, setNewState] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [tempInputText, setTempInputText] = useState(inputText);
  const [tempKey, setTempKey] = useState(key);
  const [stateMap, setStateMap] = useState(new Map());
  const [highlightedCell, setHighlightedCell] = useState(null); // State to track the highlighted cell
  const [highlightedCellValue, setHighlightedCellValue] = useState(''); // State to track the value of the highlighted cell
  const algorithm = 'ECB';
  const keySize = 128; // Change this value to 192 or 256 to test different key sizes
  const mode = 'Encode';

  const totalRounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14; // Determine total rounds based on key size

  const toHex = (arr) => {
    return arr.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
  };

  const handleCellClick = (id, value, matrixId) => {
    const roundSteps = stateMap.get(currentRound) || [];
    const stepIndex = roundSteps.findIndex(step => step.step === currentStep);
  
    if (currentStep === 'SubBytes' && matrixId === 'current') {
      // Do nothing if the clicked cell is from the current state matrix during SubBytes step
      return;
    }
  
    console.log(id);
    const cell = document.getElementById(id);
    if (highlightedCell === id) {
      // If the clicked cell is already highlighted, remove the highlight
      if (cell) {
        cell.classList.remove('highlighted');
      }
      setHighlightedCell(null);
      setHighlightedCellValue('');
    } else {
      // If another cell is highlighted, remove its highlight
      if (highlightedCell) {
        const previousCell = document.getElementById(highlightedCell);
        if (previousCell) {
          previousCell.classList.remove('highlighted');
        }
      }
      // Highlight the clicked cell
      if (cell) {
        cell.classList.add('highlighted');
      }
      setHighlightedCell(id);
      setHighlightedCellValue(value);
    }
  };

  const generateExplanation = (currentRound, currentStep, highlightedCell, highlightedCellValue) => {
    if (highlightedCell && highlightedCell.startsWith('current')) {
      return `Round ${currentRound}, Step ${currentStep}: Selected Cell Value: ${highlightedCellValue}`;
    }
    //return `Round ${currentRound}, Step ${currentStep}: No Cell Selected`;
  };

  const renderMatrix = (hexString, matrixId, title, highlightRows = false, highlightColumns = false) => {
    const matrix = formatAsMatrix(hexString);
    return (
      <Box className="matrix">
        <table className="matrix-table">
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex} style={highlightRows ? { backgroundColor: `${highlightColor}${1 - rowIndex * 0.2})` } : {}}>
                {row.map((byte, colIndex) => {
                  const cellId = `${matrixId}-${rowIndex}-${colIndex}`;
                  const isHighlighted = highlightedCell && highlightedCell.endsWith(`-${rowIndex}-${colIndex}`);
                  const isClickedCell = highlightedCell === cellId;
                  const highlightStyle = isClickedCell
                    ? { backgroundColor: 'rgba(255, 0, 0, 1)' }
                    : isHighlighted
                    ? { backgroundColor: 'rgba(255, 0, 0, 0.2)' }
                    : highlightColumns
                    ? { backgroundColor: `${highlightColor}${1 - ((colIndex + rowIndex) % 4) * 0.2})` }
                    : {};
  
                  return (
                    <td
                      key={colIndex}
                      id={cellId}
                      onClick={() => handleCellClick(cellId, byte, matrixId)}
                      style={highlightStyle}
                    >
                      {byte}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <Typography variant="body1" component="p" align="left" className="matrix-title" id={`${matrixId}-title`}>
          {title}
        </Typography>
      </Box>
    );
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

  const fixedMatrix = [
    ['02', '03', '01', '01'],
    ['01', '02', '03', '01'],
    ['01', '01', '02', '03'],
    ['03', '01', '01', '02']
  ];

  const renderFixedMatrix = () => {
    return (
      <Box className="matrix">
        <table className="matrix-table">
          <tbody>
            {fixedMatrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((byte, colIndex) => (
                  <td key={colIndex}>
                    {byte}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Typography variant="body1" component="p" align="left" className="matrix-title">
          Fixed Matrix
        </Typography>
      </Box>
    );
  };

  const renderSBox = () => {
    const sBoxMatrix = [];
    for (let i = 0; i < 16; i++) {
      sBoxMatrix.push(sBox.slice(i * 16, i * 16 + 16));
    }

    const highlightRow = highlightedCellValue ? parseInt(highlightedCellValue[0], 16) : -1;
    const highlightCol = highlightedCellValue ? parseInt(highlightedCellValue[1], 16) : -1;

    return (
      <Box className="matrix">
        <table className="matrix-table small">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: 16 }, (_, i) => (
                <th key={i}>{i.toString(16).toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sBoxMatrix.map((row, rowIndex) => (
              <tr key={rowIndex} style={highlightRow === rowIndex ? { backgroundColor: 'rgba(255, 0, 0, 0.2)' } : {}}>
                <th>{rowIndex.toString(16).toUpperCase()}</th>
                {row.map((byte, colIndex) => (
                  <td
                    key={colIndex}
                    style={
                      highlightRow === rowIndex && highlightCol === colIndex
                        ? { backgroundColor: 'red' }
                        : highlightRow === rowIndex || highlightCol === colIndex
                        ? { backgroundColor: 'rgba(255, 0, 0, 0.2)' }
                        : {}
                    }
                  >
                    {byte.toString(16).padStart(2, '0')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Typography variant="body1" component="p" align="left" className="matrix-title">
          sBox
        </Typography>
      </Box>
    );
  };

  const renderExplanation = () => {
    if (currentStep === 'AddRoundKey' && highlightedCell) {
      const [matrixId, rowIndex, colIndex] = highlightedCell.split('-').map(Number);
      const previousStateArray = previousStepState.split(' ');
      const roundKeyArray = toHex(roundKeys[currentRound]).split(' ');
  
      console.log('previousStateArray:', previousStateArray);
      console.log('roundKeyArray:', roundKeyArray);
  
      const previousValueHex = previousStateArray[rowIndex * 4 + colIndex] || '00';
      const roundKeyValueHex = roundKeyArray[rowIndex * 4 + colIndex] || '00';
      const resultValueHex = (parseInt(previousValueHex, 16) ^ parseInt(roundKeyValueHex, 16)).toString(16).padStart(2, '0');
  
      const previousValueBits = parseInt(previousValueHex, 16).toString(2).padStart(8, '0');
      const roundKeyValueBits = parseInt(roundKeyValueHex, 16).toString(2).padStart(8, '0');
      const resultValueBits = (parseInt(previousValueHex, 16) ^ parseInt(roundKeyValueHex, 16)).toString(2).padStart(8, '0');
  
      return (
        <Box textAlign="center">
          <Typography variant="body1" component="p">
            {`Previous State [${rowIndex}, ${colIndex}] (Hex): ${previousValueHex}`}
          </Typography>
          <Typography variant="body1" component="p">
            {`Round Key [${rowIndex}, ${colIndex}] (Hex): ${roundKeyValueHex}`}
          </Typography>
          <Typography variant="body1" component="p">
            {`Result (Hex): ${previousValueHex} XOR ${roundKeyValueHex} = ${resultValueHex}`}
          </Typography>
          <br />
          <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '5px' }}>Previous State [{rowIndex}, {colIndex}]</td>
                <td style={{ border: '1px solid black', padding: '5px' }}>{previousValueBits}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '5px' }}>Round Key [{rowIndex}, {colIndex}]</td>
                <td style={{ border: '1px solid black', padding: '5px' }}>{roundKeyValueBits}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid black', padding: '5px' }}>XOR</td>
                <td style={{ border: '1px solid black', padding: '5px' }}>{previousValueBits} XOR {roundKeyValueBits} = {resultValueBits}</td>
              </tr>
            </tbody>
          </table>
        </Box>
      );
    }
    return null;
  };

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
        <div className="matrix-container">
          {renderMatrix(previousStepState, 'previous', 'Previous State', currentStep === 'ShiftRows')}
          {currentStep === 'MixColumns' && renderFixedMatrix()}
          {renderMatrix(stepState, 'current', 'Current State', false, currentStep === 'ShiftRows')}
          {currentStep === 'AddRoundKey' && renderMatrix(toHex(roundKeys[currentRound]), 'roundKey', 'Round Key')}
        </div>
        <Box className="info-container" mt={2}>
          <Typography variant="body1" component="p" align="center">
            {generateExplanation(currentRound, currentStep, highlightedCell, highlightedCellValue)}
          </Typography>
          {currentStep === 'SubBytes' && renderSBox()}
          {currentStep === 'AddRoundKey' && renderExplanation()}
        </Box>
      </Box>
    );
  } else {
    return (
      <Box>
        <Typography variant="h6" component="h2" align="center">
          Result
        </Typography>
        <Typography variant="body1" component="p" align="center">
          Input Text Padded (Hex): {toHex(paddedState)}
        </Typography>
        <Typography variant="body1" component="p" align="center">
          Input Text Padded: {hexToText(toHex(paddedState))}
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

  useEffect(() => {
    // Reset highlighted cell when step or round changes
    if (highlightedCell) {
      const previousCell = document.getElementById(highlightedCell);
      if (previousCell) {
        previousCell.classList.remove('highlighted');
      }
      setHighlightedCell(null);
      setHighlightedCellValue('');
    }
  }, [currentRound, currentStep]);

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
          handleStepClick={(round, step) => handleStepClick(round, step, setCurrentRound, setCurrentStep)}
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
              <Button variant="contained" color="primary" onClick={() => handleSubmitButtonClick(tempKey, tempInputText, keySize, setKeyError, setInputText, setKey, setSidebarVisible, setRoundKeys, setStateMap)} style={{ marginTop: '16px' }}>
                Submit
              </Button>
            </Box>
          )}
          {sidebarVisible && (
            <>
              <Button
                variant="contained"
                style={{ backgroundColor: '#4b0082', color: 'white', margin: '8px' }}
                onClick={() => handleInput(setCurrentRound, setCurrentStep)}
                disabled={currentRound === -2 && currentStep === 'Input'}
              >
                Input
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => handlePreviousRound(currentRound, setCurrentRound, setCurrentStep)}
                disabled={currentRound <= 0}
              >
                Previous Round
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => handlePreviousStep(currentRound, currentStep, setCurrentStep, () => handlePreviousRound(currentRound, setCurrentRound, setCurrentStep), totalRounds)}
                disabled={currentRound === -2 && currentStep === 'Input'}
              >
                Previous Step
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => handleNextStep(currentRound, currentStep, setCurrentStep, () => handleNextRound(currentRound, setCurrentRound, setCurrentStep, totalRounds), totalRounds)}
                disabled={currentRound >= totalRounds && (currentStep === 'AddRoundKey' || currentStep === 'Result')}
              >
                Next Step
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: '8px' }}
                onClick={() => handleNextRound(currentRound, setCurrentRound, setCurrentStep, totalRounds)}
                disabled={currentRound >= totalRounds}
              >
                Next Round
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ margin: '8px' }}
                onClick={() => handleFinalRound(setCurrentRound, setCurrentStep, totalRounds)}
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