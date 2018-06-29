const readline = require('readline');
const chalk = require('chalk');

const {
  validateData,
  copyGrid,
  createGrid,
  createMineGrid,
  rainbow,
  spaceBlock,
  mineStrBlock,
  unclickedBlock,
  flagBlock,
  checkWin,
} = require('./util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

initGame();

function initGame() {
  rl.question(rainbow('\nWelcome to node minesweeper! Ready to begin? ') + chalk.bgBlack.gray.italic('y/n \n'), (answer) => {
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
  rl.question(rainbow('\nPlease select your difficulty level. ') + chalk.bgBlack.gray.italic('easy/medium/hard \n'), (answer) => {
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
  rl.write(rainbow('\nHere\'s how it works.\nEnter the ') + chalk.bgBlack.whiteBright.italic('x-coordinate') + rainbow(' and ') + chalk.bgBlack.whiteBright.italic('y-coordinate') + rainbow(' of the square you want to uncover with a space in between, like ') + chalk.bgBlack.whiteBright.italic('8 3') + rainbow(' or ') + chalk.bgBlack.whiteBright.italic('5 7') + rainbow('.\nIf you only want to flag the square instead of uncovering it, add the word ') + chalk.bgBlack.whiteBright.italic('flag') + rainbow(' at the end after another space, like ') + chalk.bgBlack.whiteBright.italic('8 3 flag') + rainbow(' or ') + chalk.bgBlack.whiteBright.italic('5 7 flag') + rainbow('.\n'));
  rl.write(rainbow('\nOkay, let\'s get started!\n'));
  return playTurn(grid, null, difficulty);
}

function printGrid(grid) {
  rl.write('\n');
  grid.forEach((row) => {
    const printRow = row.join(chalk.bgBlack(' '));
    console.log(printRow);
  });
}

function playTurn(grid, mineGrid, difficulty) {
  printGrid(grid);
  if (checkWin(grid)) return youWin();
  const gridCopy = copyGrid(grid);
  rl.question(rainbow('\nChoose a square to uncover or flag.\n'), (answer) => {
    let [x, y, flag] = answer.split(' ');
    x = Number(x);
    y = Number(y);

    if (!validateData(x, y, flag, grid)) {
      noComprendo();
      return playTurn(grid, mineGrid, difficulty);
    }

    if (flag) {
      gridCopy[y][x] = flagBlock;
      return playTurn(gridCopy, mineGrid, difficulty);
    } else {
      if (!mineGrid) mineGrid = createMineGrid(difficulty, x, y);
      return click(x, y, gridCopy, mineGrid, true);
    }
  });
}

function click(x, y, grid, mineGrid, firstClick, spacesChecked = {}) {
  if (firstClick) spacesChecked[JSON.stringify([String(x), String(y)])] = true;
  grid[y][x] = mineGrid[y][x];

  if (grid[y][x] === mineStrBlock) {
    if (firstClick) return gameOver(grid);
    else {
      grid[y][x] = unclickedBlock;
      return;
    };
  }
  // case for numbers
  if (grid[y][x] !== spaceBlock) {
    if (firstClick) return playTurn(grid, mineGrid);
    else return;
  }
  
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

function youWin() {
  rl.write(rainbow('\nCONGRATULATIONS, YOU WIN!!!!\n'));
  return goodbye();
}

function noComprendo() {
  rl.write(rainbow('\nSorry, I didn\'t understand that.\n'));
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
