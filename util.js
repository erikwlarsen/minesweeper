const chalk = require('chalk');

const validateData = (x, y, flag, grid) => {
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

const copyGrid = grid => grid.map((row) => row.slice());

const createGrid = (difficulty) => {
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
      row.push(chalk.grey(' #'));
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
    if (count === mines) return; // base case

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
            arr[yIdx][xIdx] = chalk.blue(surroundingMines);
          }
        }
      });
    });
  }

  makeNumbers();

  return mineGrid;
}

module.exports = {
  validateData,
  copyGrid,
  createGrid,
  createMineGrid,
}