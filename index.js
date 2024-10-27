import { TicTacToeBoard } from './tic-tac-toe/public-api.js';

/**
 * @param {TicTacToeBoard} field
 * @param {'X'|'O'} [player]
 * @param {number} [depth]
 * @returns {Array<{winner: 'X'|'O'|null, steps: Array<{player: 'X'|'O', x: number, y: number, z: number}>}>}
 */
function playAndReport(field, player, depth) {
  player ??= 'X';
  depth ??= 0;

  /** @type Array<{winner: 'X'|'O'|null, steps: Array<{player: 'X'|'O', x: number, y: number, z: number}>}> */
  const results = new Array();

  for (let x = 0; x < field.size; x++) {
    for (let y = 0; y < field.size; y++) {
      for (let z = 0; z < field.size; z++) {
        if (false === field.isFillable(x, y, z)) {
          continue;
        }
        const clonedField = cloneField(field);
        clonedField.setValue(player, x, y, z);

        const winner = /** @type {'X'|'O'} */(clonedField.getWinner());
        if (winner) {
          results.push({winner, steps: [{player, x, y, z}]});
          continue;
        } else {
          const nextStepResults = playAndReport(clonedField, player === 'X' ? 'O' : 'X', depth + 1);
          nextStepResults.forEach(result => {
            result.steps.unshift({player, x, y, z});
            results.push(result);
          });
          continue;
        }
      }
    }
  }

  if (depth === Math.pow(field.size, field.size)) {
    results.push({winner: null, steps: []});
  }
  return results;
}

/**
 * @param {TicTacToeBoard} field
 * @returns {TicTacToeBoard}
 */
function cloneField(field) {
  const clone = new TicTacToeBoard(field.size);

  for (let x = 0; x < field.size; x++) {
    for (let y = 0; y < field.size; y++) {
      for (let z = 0; z < field.size; z++) {
        const value = field.getValue(x,y,z);
        if (value) {
          clone.setValue(value, x, y, z);
        }
      }
    }
  }

  return clone;
}

/**
 * @param {string} field;
 * @param {number} size;
 * @returns {string};
 */
function drawStrField(field, size) {
  /** @type Array<string> */
  const rows = new Array();
  const length = Math.pow(size, size - 1);

  for (let i = 0; i < length; i++) {
    rows.push(field.substring(i * size, i * size + size));
  }

  const a = rows.reduce(
    (resultRows, row, index) => {
      const lineList = resultRows[index % size] ?? Array();
      lineList.push(row);
      resultRows[index % size] = lineList;
      return resultRows;
    },
    /** @type Array<Array<string>> */
    (new Array()),
  );
  const b = a.map(
    lineList => lineList.map(line => line.replaceAll(' ', '_')).join('   '),
  )
  const result = b.join('\n');
  return result;
}

const results = playAndReport(new TicTacToeBoard(2));
console.log('Played games: ' + results.length);
console.log('X wined ' + results.filter(g => g.winner === 'X').length + ' times');
console.log('O wined ' + results.filter(g => g.winner === 'O').length + ' times');
console.log('Number of games without a winner is ' + results.filter(g => g.winner === null).length);
