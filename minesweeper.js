const readline = require('readline');
const chalk = require('chalk');

const {
  validateData,
  copyGrid,
  createGrid,
  createMineGrid,
} = require('./util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
      answer = 'easy';
    } else if (answer.toLowerCase() === 'm' || answer.toLowerCase() === 'medium') {
      answer = 'medium';
    } else if (answer.toLowerCase() === 'h' || answer.toLowerCase() === 'hard') {
      answer = 'hard';
    } else {
      noComprendo();
      return selectDifficulty();
    }

    const grid = createGrid(answer);
    return showDirections(grid, answer);
  });
}

function showDirections(grid, difficulty) {
  rl.write(`\nHere's how it works.\nEnter the x-coordinate and y-coordinate of the square you want to uncover with a space in between, like ${chalk.green('8 3')} or ${chalk.green('5 7')}.\nIf you only want to flag the square instead of uncovering it, add the word flag at the end after another space, like ${chalk.blue('8 3 flag')} or ${chalk.blue('5 7 flag')}\n`);
  rl.write('\nOkay, let\'s get started!\n');
  return playTurn(grid, null, difficulty);
}

function printGrid(grid) {
  rl.write('\n');
  grid.forEach((row) => {
    console.log(...row);
  });
}

function playTurn(grid, mineGrid, difficulty) {
  printGrid(grid);
  const gridCopy = copyGrid(grid);
  rl.question('\nChoose a square to uncover or flag.\n', (answer) => {
    const [x, y, flag] = answer.split(' ');

    if (!validateData(x, y, flag, grid)) {
      noComprendo();
      return playTurn(grid, mineGrid, difficulty);
    }

    if (flag === 'flag') {
      gridCopy[y][x] = chalk.yellow.bold(' F');
      return playTurn(gridCopy, mineGrid, difficulty);
    } else {
      if (!mineGrid) mineGrid = createMineGrid(difficulty, x, y);
      return click(x, y, gridCopy, mineGrid, true);
    }
  });
}

let counter = 0;

function click(x, y, grid, mineGrid, firstClick, spacesChecked = {}) {
  if (firstClick) spacesChecked[JSON.stringify([String(x), String(y)])] = true;;
  // console.log('CLICK CALL', counter++);
  const mineStr = chalk.red('XX');
  // console.log('MINE GRID', mineGrid);
  grid[y][x] = mineGrid[y][x];
  console.log('GRID AT GIVEN POSITION AFTER REVEAL', grid[y][x]);

  if (grid[y][x] === mineStr) {
    if (firstClick) return gameOver(grid);
    else {
      grid[y][x] = ' #';
      return;
    };
  }
  console.log('GOT PAST MINE CONDITIONAL')
  // case for numbers
  if (grid[y][x] !== '  ') {
    if (firstClick) return playTurn(grid, mineGrid);
    else return;
  }
  console.log('GOT PAST SPACES CONDITIONAL');
  
  // HOW TO PROPAGATE CLEARING SQUARES CORRECTLY? something to do with squares with numbers on them
  // Redo mineLocations - instead have two objects of identical structure (same as current grid),
  // one with mines and numbers and one that will be shown to user and can reveal the "true" grid as we go.
  const positionsToCheck = [
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1],
  ];

  positionsToCheck.forEach(([xPos, yPos]) => {
    const stringifyXY = JSON.stringify([String(xPos), String(yPos)]);
    console.log('SPACES CHECKED', spacesChecked);
    if (
      xPos > 0 &&
      xPos < grid[1].length - 1 &&
      yPos > 0 &&
      yPos < grid.length - 1 &&
      !(stringifyXY in spacesChecked)
    ) {
      spacesChecked[stringifyXY] = true;
      click(xPos, yPos, grid, mineGrid, false, spacesChecked);
    }
  });

  if (firstClick) return playTurn(grid, mineGrid);
}

function noComprendo() {
  rl.write('\nSorry, I didn\'t understand that.\n');
}

function gameOver(grid) {
  printGrid(grid);
  rl.write(`You hit a mine!! ${chalk.red('X(')}\nGAME OVER\n`);
  return goodbye();
}

function goodbye() {
  rl.write('\nGoodbye!\n\n')
  rl.close();
}

// const testGrid = createMineGrid('easy', 5, 4);

// printGrid(testGrid);
