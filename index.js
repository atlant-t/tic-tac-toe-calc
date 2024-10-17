/**
 * @typedef {`${'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'}`} Char
 */
/**
 * @template T
 * @typedef {T extends Char ? T : T extends `${Char}${infer R}` ? Chars<R> : never} Chars<T>
 */

class Field {
  /**
   * @private @readonly
   * @type Set<Char>
   */
  _availableValueSet;

  /**
   * @private
   * @type {string}
   */
  _data;

  /**
   * @private @readonly
   * @type {Set<string>}
   */
  _winMaskSet;

  /**
   * Edge size.
   *
   * @readonly
   * @type {number}
   */
  size;

  /**
   * @param {number} size Edge size.
   */
  constructor(size) {
    this.size = size;

    this._availableValueSet = new Set();
    this._availableValueSet.add('X');
    this._availableValueSet.add('O');

    this._data = generateEmptyFieldData(size);
    this._winMaskSet = generateWinMaskSet(size);
  }

  /**
   * Sets the socket value if it's possible, otherwise an Error will be thrown.
   *
   * @param {Char} value A value that will be set.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {undefined}
   */
  setValue(value, x, y, z) {
    if (false == this.isFillable(x, y, z)) {
      throw new Error(`Field x(${x}) y(${y}) z(${z}) cannot be set`);
    }

    if (value.length !== 1) { throw new Error(`Value '${value}' is not char`) }
    const position = x + y * this.size + z * this.size * this.size;
    this._data = this._data.substring(0,position) + value + this._data.substring(position+1);
  }

  /**
   * Returns current socket value.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Char|null}
   */
  getValue(x, y, z) {
    const position = x + y * this.size + z * this.size * this.size;
    const value = this._data[position];
    return isChar(value) && this._availableValueSet.has(value) ? value : null;
  }

  /**
   * Checks whether a socket can have a value.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean} Whether a socket can get a value.
   */
  isFillable(x, y, z) {
    return this.getValue(x, y, z) == null
        && (z === 0 || this.getValue(x, y, z - 1) !== null);
  }

  /**
   * Returns a winner if there is one, or `null`.
   * @returns {Char|null}
   */
  getWinner() {
    /** @type Map<Char|' ', number> */
    const matchMap = new Map();
    for (const winMask of this._winMaskSet) {
      matchMap.clear();

      for (let i = 0; i < winMask.length; i++) {
        if (winMask[i] === '1') {
          const value = /** @type Char */ (this._data[i]);
          matchMap.set(value, 1 + (matchMap.get(value) ?? 0));
        }
      }

      for (let [value, count] of matchMap) {
        if ( isChar(value)
          && this._availableValueSet.has(value)
          && count >= this.size) {
          return value;
        }
      }
    }

    return null;
  }
}

/**
 * @param {Field} field
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
 * @param {Field} field
 * @returns {Field}
 */
function cloneField(field) {
  const clone = new Field(field.size);

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
 * @param {number} size
 * @returns {string}
 */
function generateEmptyFieldData(size) {
  const length = Math.pow(size, size);
  /** @type string */
  let result = '';
  while (result.length <= length) {
    result += ' ';
  }
  return result;
}

/**
 * @param {number} size
 * @returns {Set<string>}
 */
function generateWinMaskSet(size) {
  /** @type Set<string> */
  const result = new Set();

  for (let xShift = -1; xShift <= 1; xShift++) {
    for (let yShift = -1; yShift <= 1; yShift++) {
      for (let zShift = -1; zShift <= 1; zShift++) {
        if ( xShift === 0 && yShift === 0 && zShift === 0) {
          continue;
        }

        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
              let str = generateEmptyFieldData(size);
              let position = x + y * size + z * size * size;
              str = str.substring(0,position) + '1' + str.substring(position+1);

              for (let i = 1; true; i++) {
                const nextX = x + xShift * i;
                const nextY = y + yShift * i;
                const nextZ = z + zShift * i;
                if ( nextX > size || nextX < 0
                  || nextY > size || nextY < 0
                  || nextZ > size || nextZ < 0) {
                  break;
                }
                let position = nextX + nextY * size + nextZ * size * size;
                str = str.substring(0,position) + '1' + str.substring(position+1);
              }

              for (let i = -1; true; i--) {
                const nextX = x - xShift * i;
                const nextY = y - yShift * i;
                const nextZ = z - zShift * i;
                if ( nextX > size || nextX < 0
                  || nextY > size || nextY < 0
                  || nextZ > size || nextZ < 0) {
                  break;
                }
                let position = nextX + nextY * size + nextZ * size * size;
                str = str.substring(0,position) + '1' + str.substring(position+1);
              }

              if (str.replaceAll(' ', '').length === size) {
                result.add(str);
              }
            }
          }
        }

      }
    }
  }

  return result;
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

/**
 * @param {any} value
 * @returns {value is Char}
 */
function isChar(value) {
  return typeof value === 'string' && /^[A-Z]$/.test(value);
}

const results = playAndReport(new Field(3));
console.log('Played games: ' + results.length);
