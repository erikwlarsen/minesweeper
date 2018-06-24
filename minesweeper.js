const readline = require('readline');
const chalk = require('chalk');

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
  return playTurn(copyGrid(grid, null, difficulty));
}

function showGrid(grid) {
  rl.write('\n');
  grid.forEach((row) => {
    console.log(...row);
  });
}

function playTurn(grid, mineGrid, difficulty) {
  showGrid(grid);
  const gridCopy = copyGrid(grid);
  rl.question('\nChoose a square to uncover or flag.\n', (answer) => {
    const [x, y, flag] = answer.split(' ');

    if (!validateData(x, y, flag, grid)) {
      noComprendo();
      return playTurn(grid, mineGrid, difficulty);
    }

    if (flag === 'flag') {
      gridCopy[y][x] = ' F';
      return playTurn(gridCopy);
    } else {
      if (!mineGrid) mineGrid = createMineGrid(difficulty, x, y);
      return click(x, y, gridCopy, mineGrid, true);
    }
  });
}

let counter = 0;

function click(x, y, grid, mineGrid, firstClick, spacesChecked = {}) {
  if (firstClick) spacesChecked[JSON.stringify([x, y])] = true;;
  console.log('CLICK CALL', counter++);
  const mineStr = chalk.red('XX');
  grid[y][x] = mineGrid[y][x];

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
    [y - 1, x - 1],
    [y - 1, x],
    [y - 1, x + 1],
    [y, x - 1],
    [y, x + 1],
    [y + 1, x - 1],
    [y + 1, x],
    [y + 1, x + 1],
  ];

  positionsToCheck.forEach(([xPos, yPos]) => {
    const stringifyXY = JSON.stringify([xPos, yPos]);
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

function copyGrid(grid) {
  return grid.map((row) => row.slice());
}

function validateData(x, y, flag, grid) {
  const gridX = grid[1].length - 2;
  const gridY = grid.length - 2;

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

function gameOver(grid) {
  showGrid(grid);
  rl.write(`You hit a mine!! ${chalk.red('X(')}\nGAME OVER\n`);
  return goodbye();
}

function goodbye() {
  rl.write('\nGoodbye!\n\n')
  rl.close();
}

function createGrid(difficulty) {
  let x, y;

  switch (difficulty) {
    case 'easy':
      x = y = 8;
      break;
    case 'medium':
      x = y = 16;
      break;
    case 'hard':
      x = 32;
      y = 16;
      break;
    default:
      x = y = 8;
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

  let xNums = ['  '];
  for (let i = 1; i <= x; i++) {
    let strNum = String(i);
    if (strNum.length < 2) strNum = ' ' + strNum;
    xNums.push(strNum);
  }
  
  grid.push(xNums);
  grid.unshift(xNums);

  return grid;
}

function createMineGrid(difficulty, xPos, yPos) {
  const mineStr = chalk.red('XX');
  let x, y, mines;

  switch (difficulty) {
    case 'easy':
      x = y = 8;
      mines = 10;
      break;
    case 'medium':
      x = y = 16;
      mines = 40;
      break;
    case 'hard':
      x = 32;
      y = 16;
      mines = 99;
      break;
    default:
      x = y = 8;
      mines = 10;
  }

  const mineGrid = new Array(y).fill(' ').map((row, idx) => {
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
  
  mineGrid.push(xNums);
  mineGrid.unshift(xNums);

  const makeMine = (count) => {
    if (count === mines - 1) return; // base case

    const xMine = Math.ceil(Math.random() * x);
    const yMine = Math.ceil(Math.random() * y);
    if (mineGrid[yMine][xMine] === mineStr || (yMine === yPos && xMine === xPos)) {
      return makeMine(count);
    }
    mineGrid[yMine][xMine] = mineStr;
    return makeMine(count + 1);
  }

  makeMine(0);

  const makeNumbers = () => {
    mineGrid.forEach((row, yIdx, arr) => {
      row.forEach((square, xIdx, xArr) => {
        if (square === '  ') {
          const positionsToCheck = [
            [yIdx - 1, xIdx - 1],
            [yIdx - 1, xIdx],
            [yIdx - 1, xIdx + 1],
            [yIdx, xIdx - 1],
            [yIdx, xIdx + 1],
            [yIdx + 1, xIdx - 1],
            [yIdx + 1, xIdx],
            [yIdx + 1, xIdx + 1],
          ];

          let surroundingMines = 0;
          positionsToCheck.forEach(([y, x]) => {
            if (arr[y] && arr[y][x] === mineStr) {
              surroundingMines += 1;
            }
          });
          if (surroundingMines) {
            surroundingMines = String(surroundingMines);
            if (surroundingMines.length < 2) surroundingMines = ' ' + surroundingMines;
            arr[yIdx][xIdx] = surroundingMines;
          }
        }
      });
    });
  }

  makeNumbers();

  return mineGrid;
}

// const testGrid = createMineGrid('easy', 5, 4);

// showGrid(testGrid);
