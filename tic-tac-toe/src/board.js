import { getEmptyField, getWinMaskSets } from './board-utils.js';
import { assertToken, isTicTacToeToken } from './token-utils.js';
/** @typedef {import('./token-utils.js').TicTacToeToken} TicTacToeToken */

/**
 * Tic-Tac-Toe board.
 */
export class TicTacToeBoard {
  /**
   * An instance of a tic-tac-toe field that
   * is a string of tokens (for filled sockets)
   * and spaces (for empty sockets).
   *
   * @private
   * @type {string}
   */
  _field;

  /**
   * A set of winning configurations.
   *
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
    this._field = getEmptyField(size);
    this._winMaskSet = getWinMaskSets(size);
  }

  /**
   * Sets the socket value if it's possible, otherwise an Error will be thrown.
   *
   * @param {TicTacToeToken} token A value that will be set.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {undefined}
   */
  setValue(token, x, y, z) {
    assertToken(token);

    if (false == this.isFillable(x, y, z)) {
      throw new Error(`Field x(${x}) y(${y}) z(${z}) cannot be set`);
    }

    const position = x + y * this.size + z * this.size * this.size;
    this._field = this._field.substring(0,position) + token + this._field.substring(position+1);
  }

  /**
   * Returns current socket value.
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {TicTacToeToken|null}
   */
  getValue(x, y, z) {
    const position = x + y * this.size + z * this.size * this.size;
    const value = this._field[position];
    return isTicTacToeToken(value) ? value : null;
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
   *
   * @returns {TicTacToeToken|null}
   */
  getWinner() {
    for (const winMask of this._winMaskSet) {
      /** @type {TicTacToeToken|undefined} */
      let winToken = undefined;
      for (let i = 0; i < winMask.length; i++) {
        if (winMask[i] === '1') {
          const fieldValue = this._field[i];
          if ( false === isTicTacToeToken(fieldValue)
            || fieldValue !== (winToken ??= fieldValue) ) {
            winToken = undefined;
            break;
          }
        }
      }

      if (isTicTacToeToken(winToken)) {
        return winToken;
      }
    }

    return null;
  }
}
