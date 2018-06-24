const readline = require('readline');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let gameData;

initGame();

function initGame() {
  rl.question('\nWelcome to node minesweeper! Ready to begin? (y/n)\n', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      return selectDifficulty();
    } else if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      return goodbye();
    } else {
      noComprendo();
      initGame();
    }
  });
}

function selectDifficulty() {
  rl.question('\nPlease select your difficulty level. (easy/medium/hard)\n', (answer) => {
    if (answer.toLowerCase() === 'e' || answer.toLowerCase() === 'easy') {
      gameData = createGrid('easy');
      return showDirections();
    } else if (answer.toLowerCase() === 'm' || answer.toLowerCase() === 'medium') {
      gameData = createGrid('medium');
      return showDirections();
    } else if (answer.toLowerCase() === 'h' || answer.toLowerCase() === 'hard') {
      gameData = createGrid('hard');
      return showDirections();
    } else {
      noComprendo();
      return selectDifficulty();
    }
  });
}

function showDirections() {
  rl.write(`\nHere's how it works.\nEnter the x-coordinate and y-coordinate of the square you want to uncover with a space in between, like ${chalk.green('8 3')} or ${chalk.green('5 7')}.\nIf you only want to flag the square instead of uncovering it, add the word flag at the end after another space, like ${chalk.blue('8 3 flag')} or ${chalk.blue('5 7 flag')}\n`);
  rl.write('\nOkay, let\'s get started!\n');
  return playTurn();
}

function showGrid() {
  rl.write('\n');
  gameData.grid.forEach((row) => {
    console.log(...row);
  });
}

function playTurn() {
  showGrid();
  rl.question('\nChoose a square to uncover or flag.\n', (answer) => {
    const [x, y, flag] = answer.split(' ');
    const xyString = x + ' ' + y;

    if (!validateData(x, y, flag)) {
      noComprendo();
      return playTurn();
    }

    if (flag === 'flag') {
      gameData.grid[y][x] = ' F';
      return playTurn();
    } else if (gameData.mineLocations.has(xyString)) {
      return gameOver(x, y);
    } else return click(x, y, xyString, 'center');
  });
}

function click(x, y, xyString, direction) {
  if (gameData.mineLocations.has(xyString)) return;
  gameData.grid[y][x] = '  ';
  // HOW TO PROPAGATE CLEARING SQUARES CORRECTLY? something to do with squares with numbers on them
  // Redo mineLocations - instead have two objects of identical structure (same as current grid),
  // one with mines and numbers and one that will be shown to user and can reveal the "true" grid as we go.
  if (direction === 'left' || direction === 'up' || direction === 'down') {

  }
  return playTurn();
}

function validateData(x, y, flag) {
  const gridX = gameData.grid[1].length - 2;
  const gridY = gameData.grid.length - 2;

  const numX = Number(x);
  const numY = Number(y);
  
  if (isNaN(numX) || isNaN(numY)) return false;
  if (numX < 1 || numX > gridX || numY < 1 || numY > gridY) return false;
  if (typeof flag !== 'undefined' && typeof flag !== 'string') return false;
  if (typeof flag === 'string' && flag !== 'flag') return false;

  return true;
}

function noComprendo() {
  rl.write('\nSorry, I didn\'t understand that.\n');
}

function gameOver(x, y) {
  gameData.grid[y][x] = chalk.red('XX');
  showGrid();
  rl.write(`You hit a mine!! ${chalk.red('X(')}\nGAME OVER\n`);
  return goodbye();
}

function goodbye() {
  rl.write('\nGoodbye!\n\n')
  rl.close();
}

function createGrid(difficulty) {
  let mines, x, y;

  switch (difficulty) {
    case 'easy':
      mines = 10;
      x = y = 8;
      break;
    case 'medium':
      mines = 40;
      x = y = 16;
      break;
    case 'hard':
      mines = 99;
      x = 32;
      y = 16;
      break;
    default:
      mines = 10;
  }

  // make mines object
  const mineLocations = new Set();
  for (let i = 0; i < mines; i++) {
    makeMine();
  }

  function makeMine() {
    const xMine = Math.ceil(Math.random() * x);
    const yMine = Math.ceil(Math.random() * y);
    const mineString = xMine + ' ' + yMine;
    if (mineLocations.has(mineString)) makeMine();
    else return mineLocations.add(mineString);
  }

  const grid = new Array(y).fill(' ').map((row, idx) => {
    row = [];
    let strNum = String(idx + 1);
    if (strNum.length < 2) strNum = ' ' + strNum;
    row.push(strNum);
    for (let i = 0; i < x; i++) {
      row.push(' #');
    }
    row.push(strNum);
    return row;
  });

  const trueGrid = new Array(y).fill(' ').map((row, idx) => {
    row = [];
    let strNum = String(idx + 1);
    if (strNum.length < 2) strNum = ' ' + strNum;
    row.push(strNum);
    for (let i = 0; i < x; i++) {
      row.push('  ');
    }
    row.push(strNum);
    return row;
  });

  let xNums = ['  '];
  for (let i = 1; i <= x; i++) {
    let strNum = String(i);
    if (strNum.length < 2) strNum = ' ' + strNum;
    xNums.push(strNum);
  }
  
  grid.push(xNums);
  grid.unshift(xNums);
  trueGrid.push(xNums);
  trueGrid.unshift(xNums);

  // TO DO: add mines and numbers to trueGrid

  return { grid, mineLocations };
}
