const chalk = require('chalk');

const gameInfo = {
  easy: {
    mines: 10,
    x: 8,
    y: 8,
  },
  medium: {
    mines: 40,
    x: 16,
    y: 16,
  },
  hard: {
    mines: 99,
    x: 32,
    y: 16,
  }
}

const validateData = (x, y, flag, grid) => {
  const gridX = grid[1].length - 2;
  const gridY = grid.length - 2;
  
  if (isNaN(x) || isNaN(y)) return false;
  if (x < 1 || x > gridX || y < 1 || y > gridY) return false;
  if (typeof flag !== 'undefined' && typeof flag !== 'string') return false;
  if (typeof flag === 'string' && flag !== 'flag' && flag !== 'f') return false;

  return true;
}

// use these blocks to build grid and match spaceBlocks during turns
const spaceBlock = chalk.bgBlack('  ');
const mineStrBlock = chalk.bgBlack.red('XX');
const unclickedBlock = chalk.bgBlack.grey(' #');

const copyGrid = grid => grid.map((row) => row.slice());

const createGrid = (difficulty) => {
  const x = gameInfo[difficulty].x;
  const y = gameInfo[difficulty].y;

  const grid = new Array(y).fill(' ').map((row, idx) => {
    row = [];
    let strNum = String(idx + 1);
    if (strNum.length < 2) strNum = ' ' + strNum;
    strNum = chalk.bgBlack.white(strNum);
    row.push(strNum);
    for (let i = 0; i < x; i++) {
      row.push(unclickedBlock);
    }
    row.push(strNum + chalk.bgBlack(' '));
    return row;
  });

  let xNums = [spaceBlock];
  for (let i = 1; i <= x; i++) {
    let strNum = String(i);
    if (strNum.length < 2) strNum = ' ' + strNum;
    strNum = chalk.bgBlack.white(strNum);
    xNums.push(strNum);
  }
  xNums.push(spaceBlock + chalk.bgBlack(' '));
  
  grid.push(xNums);
  grid.unshift(xNums);

  return grid;
}

function createMineGrid(difficulty, xPos, yPos) {
  const x = gameInfo[difficulty].x;
  const y = gameInfo[difficulty].y;
  const mines = gameInfo[difficulty].mines;

  const mineGrid = new Array(y).fill(' ').map((row, idx) => {
    row = [];
    let strNum = String(idx + 1);
    if (strNum.length < 2) strNum = ' ' + strNum;
    row.push(strNum);
    for (let i = 0; i < x; i++) {
      row.push(spaceBlock);
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

    const positionsToCheck = new Set([
      `${xPos - 1} ${yPos - 1}`,
      `${xPos - 1} ${yPos}`,
      `${xPos - 1} ${yPos + 1}`,
      `${xPos} ${yPos - 1}`,
      `${xPos} ${yPos}`,
      `${xPos} ${yPos + 1}`,
      `${xPos + 1} ${yPos - 1}`,
      `${xPos + 1} ${yPos}`,
      `${xPos + 1} ${yPos + 1}`,
    ]);

    if (mineGrid[yMine][xMine] === mineStrBlock || positionsToCheck.has(`${xMine} ${yMine}`)) {
      return makeMine(count);
    }
    mineGrid[yMine][xMine] = mineStrBlock;
    return makeMine(count + 1);
  }

  makeMine(0);

  const makeNumbers = () => {
    mineGrid.forEach((row, yIdx, arr) => {
      row.forEach((square, xIdx) => {
        if (square === spaceBlock) {
          const positionsToCheck = [
            [xIdx - 1, yIdx - 1],
            [xIdx - 1, yIdx],
            [xIdx - 1, yIdx + 1],
            [xIdx, yIdx - 1],
            [xIdx, yIdx + 1],
            [xIdx + 1, yIdx - 1],
            [xIdx + 1, yIdx],
            [xIdx + 1, yIdx + 1],
          ];

          let surroundingMines = 0;
          positionsToCheck.forEach(([x, y]) => {
            if (arr[y] && arr[y][x] === mineStrBlock) {
              surroundingMines += 1;
            }
          });
          if (surroundingMines) {
            surroundingMines = String(surroundingMines);
            if (surroundingMines.length < 2) surroundingMines = ' ' + surroundingMines;
            arr[yIdx][xIdx] = chalk.bgBlack.blue(surroundingMines);
          }
        }
      });
    });
  }

  makeNumbers();

  return mineGrid;
}

const rainbow = (str) => {
  const colors = ['redBright', 'yellowBright', 'greenBright', 'cyanBright', 'blueBright', 'magentaBright'];

  return str.split('').map((char, i) => chalk.bgBlack[colors[i % colors.length]](char)).join('');
}

module.exports = {
  validateData,
  copyGrid,
  createGrid,
  createMineGrid,
  rainbow,
  spaceBlock,
  mineStrBlock,
  unclickedBlock,
};
