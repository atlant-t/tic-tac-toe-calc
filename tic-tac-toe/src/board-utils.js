/** @type {Map<number, Set<string>>} */
const generatedWinMasksMap = new Map();
/** @type {Map<number, string>} */
const generatedEmptyFieldsMap = new Map();

/**
 * Provides a set of winning configurations.
 *
 * @param {number} size size of Tic-Tac-Toe field.
 * @returns {Set<string>}
 */
export function getWinMaskSets(size) {
  if (false == generatedWinMasksMap.has(size)) {
    generatedWinMasksMap.set(size, generateWinMaskSet(size));
  }
  return new Set(generatedWinMasksMap.get(size));
}

/**
 * Provides an empty field for a specific size.
 *
 * @param {number} size size of Tic-Tac-Toe field.
 * @returns {string}
 */
export function getEmptyField(size) {
  if (false == generatedEmptyFieldsMap.has(size)) {
    generatedEmptyFieldsMap.set(size, generateEmptyFieldData(size));
  }
  return /**@type {string}*/(generatedEmptyFieldsMap.get(size));
}

/**
 * @param {number} size
 * @returns {string}
 */
function generateEmptyFieldData(size) {
  const length = Math.pow(size, 3);
  /** @type string */
  let result = '';
  while (result.length <= length) {
    result += ' ';
  }
  return result;
}

/**
 * @private
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
              let str = getEmptyField(size);
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
