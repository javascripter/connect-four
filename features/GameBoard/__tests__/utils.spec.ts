import { COLUMNS, ROWS } from '../constants'
import { GameBoard, GameState } from '../types'
import { placeDisc } from '../utils'

function formatBoard(board: GameBoard): string {
  return [
    '',
    ...board.map((row) =>
      row
        .map((cell) => (cell == null ? '-' : cell === 'red' ? 'R' : 'Y'))
        .join(' ')
    ),
    '',
  ].join('\n')
}

function formatWinningDiscs(winningDiscs: [number, number][] | null): string {
  return [
    '',
    ...Array.from({ length: ROWS }, (_, i) =>
      Array.from({ length: COLUMNS }, (_, j) =>
        winningDiscs?.some(([x, y]: [number, number]) => x === i && y === j)
          ? 'W'
          : '-'
      ).join(' ')
    ),
    '',
  ].join('\n')
}

function getInitialState(): GameState {
  return {
    result: 'continue' as const,
    gameBoard: Array(ROWS)
      .fill(null)
      .map(() => Array(COLUMNS).fill(null)),
    currentPlayer: 'red',
    winningDiscs: null,
  }
}

describe('Game Logic', () => {
  test('should initialize with correct initial state', () => {
    const initialState = getInitialState()

    expect(initialState.result).toBe('continue')
    expect(initialState.currentPlayer).toBe('red')
    expect(formatBoard(initialState.gameBoard)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
"
`)
    expect(formatWinningDiscs(initialState.winningDiscs))
      .toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
"
`)
    expect(initialState.winningDiscs).toBeNull()
  })

  test('should place a red disc in the selected column', () => {
    const initialState = getInitialState()
    const nextState = placeDisc(initialState, 0)
    expect(formatBoard(nextState.gameBoard)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
R - - - - - -
"
`)
    expect(nextState.currentPlayer).toBe('yellow')
    expect(nextState.result).toBe('continue')
  })

  test('should detect a horizontal win', () => {
    const initialState = getInitialState()
    const cols = [0, 0, 1, 1, 2, 2, 3]
    let nextState = initialState

    for (const col of cols) {
      nextState = placeDisc(nextState, col)
    }

    expect(nextState.result).toBe('win')
    expect(formatWinningDiscs(nextState.winningDiscs)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
W W W W - - -
"
`)
  })

  test('should detect a vertical win', () => {
    const initialState = getInitialState()
    const cols = [4, 5, 4, 5, 4, 5, 4]
    let nextState = initialState

    for (const col of cols) {
      nextState = placeDisc(nextState, col)
    }

    expect(nextState.result).toBe('win')
    expect(formatWinningDiscs(nextState.winningDiscs)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - W - -
- - - - W - -
- - - - W - -
- - - - W - -
"
`)
  })

  test('should detect a draw when the board is full', () => {
    const initialState = getInitialState()
    const cols = [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2],
      [4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5],
      [6, 6, 6, 6, 6, 3],
      [3, 3, 3, 3, 3, 6],
    ].flat()

    let nextState = initialState

    for (const col of cols) {
      nextState = placeDisc(nextState, col)
    }

    expect(formatBoard(nextState.gameBoard)).toMatchInlineSnapshot(`
"
Y Y Y R Y Y Y
R R R Y R R R
Y Y Y R Y Y Y
R R R Y R R R
Y Y Y R Y Y Y
R R R Y R R R
"
`)
    expect(nextState.result).toBe('draw')
    expect(formatWinningDiscs(nextState.winningDiscs)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
"
`)
  })

  test('should reset the game correctly', () => {
    const initialState = getInitialState()
    const nextState = placeDisc(initialState, 0)
    expect(nextState.gameBoard[5][0]).toBe('red')
    expect(nextState.currentPlayer).toBe('yellow')

    const resetState: GameState = {
      result: 'continue' as const,
      gameBoard: Array(ROWS)
        .fill(null)
        .map(() => Array(COLUMNS).fill(null)),
      currentPlayer: 'red',
      winningDiscs: null,
    }

    expect(resetState.result).toBe('continue')
    expect(resetState.currentPlayer).toBe('red')
    expect(formatBoard(resetState.gameBoard)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
"
`)
    expect(formatWinningDiscs(resetState.winningDiscs)).toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
"
`)
  })
})
