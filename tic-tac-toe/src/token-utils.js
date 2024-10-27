/**
 * @typedef {'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'}
 *          TicTacToeToken
 */

const TOKEN_REGEX = /^[A-Z]$/;

/**
 * Checks whether the value is TicTacToe.
 *
 * @param {unknown} value A value for testing
 * @returns {value is TicTacToeToken}
 */
export function isTicTacToeToken(value) {
  return typeof value === 'string' && TOKEN_REGEX.test(value);
}

/**
 * Asserts that value is a correct token or throws an Error.
 *
 * @param {unknown} a;
 * @returns {asserts a is import('./token-utils.js').TicTacToeToken}
 */
export function assertToken(a) {
  if (false === isTicTacToeToken(a)) {
    throw new Error(`Token '${a}' is not valid`);
  }
}
