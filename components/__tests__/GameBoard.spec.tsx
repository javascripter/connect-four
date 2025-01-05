import { renderHook, act, RenderResult } from '@testing-library/react-hooks'
import { useGameBoard } from '../GameBoard'

function formatBoard(
  board: ReturnType<typeof useGameBoard>['props']['state']['gameBoard']
): string {
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

function formatWinningDiscs(
  winningDiscs: ReturnType<
    typeof useGameBoard
  >['props']['state']['winningDiscs']
): string {
  return [
    '',
    ...Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 7 }, (_, j) =>
        winningDiscs?.some(([x, y]) => x === i && y === j) ? 'W' : '-'
      ).join(' ')
    ),
    '',
  ].join('\n')
}

function pressCell(
  result: RenderResult<ReturnType<typeof useGameBoard>>,
  col: number
) {
  act(() => {
    result.current.props.onPressCell(col)
  })
}

describe('useGameBoard Hook', () => {
  test('should initialize with correct initial state', () => {
    const { result } = renderHook(() => useGameBoard())

    expect(result.current.result).toBe('continue')
    expect(result.current.currentPlayer).toBe('red')

    expect(formatBoard(result.current.props.state.gameBoard))
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

    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
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
    expect(result.current.props.state.winningDiscs).toBeNull()
  })

  test('should place a red disc in the selected column', () => {
    const { result } = renderHook(() => useGameBoard())

    pressCell(result, 0)

    expect(formatBoard(result.current.props.state.gameBoard))
      .toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
- - - - - - -
R - - - - - -
"
`)
    expect(result.current.props.state.currentPlayer).toBe('yellow')
    expect(result.current.props.state.result).toBe('continue')
  })

  test('should alternate players after each move', async () => {
    const { result } = renderHook(() => useGameBoard())
    pressCell(result, 0) // red
    expect(result.current.props.state.currentPlayer).toBe('yellow')
    pressCell(result, 1) // yellow
    expect(result.current.props.state.currentPlayer).toBe('red')
  })

  test('should detect a horizontal win', async () => {
    const { result } = renderHook(() => useGameBoard())

    // Simulate red placing four discs horizontally in row 5

    const cols = [0, 0, 1, 1, 2, 2, 3]

    for (let col of cols) {
      pressCell(result, col)
    }

    expect(result.current.props.state.result).toBe('win')
    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
      .toMatchInlineSnapshot(`
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

  test('should detect a vertical win', async () => {
    const { result } = renderHook(() => useGameBoard())

    // Simulate red placing four discs vertically in column 4

    const cols = [4, 5, 4, 5, 4, 5, 4]

    for (let col of cols) {
      pressCell(result, col)
    }

    expect(result.current.props.state.result).toBe('win')
    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
      .toMatchInlineSnapshot(`
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

  test('should detect a diagonal (down-right) win', async () => {
    const { result } = renderHook(() => useGameBoard())

    // Simulate moves to create a down-right diagonal win for red

    const cols = [0, 1, 1, 2, 2, 3, 2, 3, 4, 3, 3]

    for (let col of cols) {
      pressCell(result, col)
    }

    expect(result.current.props.state.result).toBe('win')
    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
      .toMatchInlineSnapshot(`
"
- - - - - - -
- - - - - - -
- - - W - - -
- - W - - - -
- W - - - - -
W - - - - - -
"
`)
  })
  test('should detect a draw when the board is full', async () => {
    const { result } = renderHook(() => useGameBoard())

    const cols = [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2],
      [4, 4, 4, 4, 4, 4],
      [5, 5, 5, 5, 5, 5],
      [6, 6, 6, 6, 6, 3],
      [3, 3, 3, 3, 3, 6],
    ].flat()

    for (let col of cols) {
      pressCell(result, col)
    }

    expect(formatBoard(result.current.props.state.gameBoard))
      .toMatchInlineSnapshot(`
"
Y Y Y R Y Y Y
R R R Y R R R
Y Y Y R Y Y Y
R R R Y R R R
Y Y Y R Y Y Y
R R R Y R R R
"
`)
    expect(result.current.props.state.result).toBe('draw')
    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
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
  })

  test('should reset the game correctly', () => {
    const { result } = renderHook(() => useGameBoard())

    pressCell(result, 0) // red
    expect(result.current.props.state.gameBoard[5][0]).toBe('red')
    expect(result.current.props.state.currentPlayer).toBe('yellow')

    act(() => {
      result.current.resetGame()
    })

    expect(result.current.props.state.result).toBe('continue')
    expect(result.current.props.state.currentPlayer).toBe('red')
    expect(formatBoard(result.current.props.state.gameBoard))
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
    expect(formatWinningDiscs(result.current.props.state.winningDiscs))
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
  })
})
