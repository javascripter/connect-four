import type { GameBoard, GameState, Player } from './types'

/**
 * Checks if the last move resulted in a win for the current player.
 * @param state - The current game state.
 * @param row - The row index of the last placed disc.
 * @param col - The column index of the last placed disc.
 * @returns The coordinates of the winning discs if the current player has won; otherwise, null.
 */
export function isWinningMove(
  state: GameState,
  row: number,
  col: number
): [number, number][] | null {
  return (
    checkDirection(state, row, col, 0, 1) || // Horizontal
    checkDirection(state, row, col, 1, 0) || // Vertical
    checkDirection(state, row, col, 1, 1) || // Diagonal down-right
    checkDirection(state, row, col, 1, -1) // Diagonal up-right
  )
}

export function isWinningCell(
  state: GameState,
  row: number,
  col: number
): boolean {
  return (
    state.winningDiscs != null &&
    state.winningDiscs.some(([r, c]) => r === row && c === col)
  )
}

/**
 * Checks for four consecutive discs in a specific direction.
 * @param state - The current game state.
 * @param row - The starting row index.
 * @param col - The starting column index.
 * @param rowDir - The row direction to check.
 * @param colDir - The column direction to check.
 * @returns The coordinates of the winning discs if four consecutive discs are found; otherwise, null.
 */
export function checkDirection(
  state: GameState,
  row: number,
  col: number,
  rowDir: number,
  colDir: number
): [number, number][] | null {
  const winningDiscs: [number, number][] = [[row, col]]

  winningDiscs.push(...countCells(state, row, col, rowDir, colDir))
  winningDiscs.push(...countCells(state, row, col, -rowDir, -colDir))

  if (winningDiscs.length >= 4) {
    return winningDiscs
  }
  return null
}

/**
 * Counts the number of consecutive discs in a given direction.
 * @param state - The current game state.
 * @param row - The current row index.
 * @param col - The current column index.
 * @param rowDir - The row direction to move.
 * @param colDir - The column direction to move.
 * @returns The coordinates of the consecutive discs found.
 */
export function countCells(
  state: GameState,
  row: number,
  col: number,
  rowDir: number,
  colDir: number
): [number, number][] {
  const discs: [number, number][] = []
  let r = row + rowDir
  let c = col + colDir

  while (
    r >= 0 &&
    r < 6 &&
    c >= 0 &&
    c < 7 &&
    state.gameBoard[r][c] === state.currentPlayer
  ) {
    discs.push([r, c])
    r += rowDir
    c += colDir
  }

  return discs
}

/**
 * Checks if the game board is full.
 * @param board - The game board to check.
 * @returns True if the board is full; otherwise, false.
 */
export function isBoardFull(board: GameBoard): boolean {
  return board[0].every((cell) => cell !== null)
}

/**
 * Gets the empty row for a given column.
 * @param board - The game board.
 * @param col - The column to check.
 * @returns The row index of the empty cell, or -1 if the column is full.
 */
export function getEmptyRow(board: GameBoard, col: number): number {
  for (let row = 5; row >= 0; row--) {
    if (board[row][col] === null) {
      return row
    }
  }
  return -1
}

/**
 * Returns the next game board state with the current player's move.
 * @param state - The current game state.
 * @param col - The column where the player wants to place their disc.
 * @returns The updated game state.
 */
export function placeDisc(state: GameState, col: number): GameState {
  if (state.result !== 'continue') {
    return state
  }

  const nextBoard = state.gameBoard.map((row) => [...row])
  const row = getEmptyRow(nextBoard, col)

  if (row === -1) {
    return state
  }

  nextBoard[row][col] = state.currentPlayer

  const winningDiscs = isWinningMove(
    {
      ...state,
      gameBoard: nextBoard,
    },
    row,
    col
  )

  if (winningDiscs != null) {
    return {
      result: 'win',
      gameBoard: nextBoard,
      currentPlayer: state.currentPlayer,
      winningDiscs, // Store the winning discs
    }
  }

  if (isBoardFull(nextBoard)) {
    return {
      result: 'draw',
      gameBoard: nextBoard,
      currentPlayer: state.currentPlayer,
      winningDiscs: null, // No winning discs for a draw
    }
  }

  const nextPlayer: Player = state.currentPlayer === 'red' ? 'yellow' : 'red'

  return {
    result: 'continue',
    gameBoard: nextBoard,
    currentPlayer: nextPlayer,
    winningDiscs: null, // No winning discs in this case
  }
}
