import React, { useEffect, useState } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

export type Player = 'red' | 'yellow'
export type Cell = Player | null
export type GameBoard = Cell[][]

export type GameState = {
  result: 'win' | 'draw' | 'continue'
  gameBoard: GameBoard
  currentPlayer: Player
  winningDiscs: [number, number][] | null
}

const rows = 6
const columns = 7

const cellSize = 50

/**
 * Checks if the last move resulted in a win for the current player.
 * @param state - The current game state.
 * @param row - The row index of the last placed disc.
 * @param col - The column index of the last placed disc.
 * @returns The coordinates of the winning discs if the current player has won; otherwise, null.
 */
function isWinningMove(
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

/**
 * Checks for four consecutive discs in a specific direction.
 * @param state - The current game state.
 * @param row - The starting row index.
 * @param col - The starting column index.
 * @param rowDir - The row direction to check.
 * @param colDir - The column direction to check.
 * @returns The coordinates of the winning discs if four consecutive discs are found; otherwise, null.
 */
function checkDirection(
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
function countCells(
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
    r < rows &&
    c >= 0 &&
    c < columns &&
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
function isBoardFull(board: GameBoard): boolean {
  return board[0].every((cell) => cell !== null)
}

function isWinningCell(state: GameState, row: number, col: number): boolean {
  return (
    state.winningDiscs != null &&
    state.winningDiscs.some(([r, c]) => r === row && c === col)
  )
}

function getEmptyRow(board: GameBoard, col: number): number {
  for (let row = rows - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      return row
    }
  }
  return -1
}

function updateBoard(state: GameState, col: number): GameState {
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

/**
 * Custom hook to manage the game state and logic.
 * @returns An object containing the current player, reset function, and game
 * board props to spread into the GameBoard component.
 */
export function useGameBoard() {
  const initialBoard: GameBoard = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(null))

  const initialState: GameState = {
    result: 'continue',
    gameBoard: initialBoard,
    currentPlayer: 'red',
    winningDiscs: null,
  }

  const [state, setState] = useState<GameState>(initialState)

  /**
   * Handles the press event on a cell.
   * @param col - The column index of the pressed cell.
   */
  function onPressCell(col: number) {
    if (state.result !== 'continue') {
      return
    }
    const nextState = updateBoard(state, col)
    setState(nextState)
  }

  /**
   * Resets the game to the initial state.
   */
  function resetGame() {
    setState(initialState)
  }

  return {
    result: state.result,
    currentPlayer: state.currentPlayer,
    resetGame,
    props: {
      state,
      onPressCell,
    },
  }
}

/**
 * Component representing a single cell in the game board.
 * @param props - The properties of the cell.
 * @param props.cell - The current state of the cell (null, 'red', or 'yellow').
 * @param props.onPress - The function to call when the cell is pressed.
 * @returns The rendered cell component.
 */
function Cell({
  state,
  cell,
  onPress,
  isWinningCell,
  col,
}: {
  state: GameState
  cell: Cell
  onPress: () => void
  isWinningCell: boolean
  col: number
}) {
  const translateY = useSharedValue(0) // Initial value for the falling disc animation

  useEffect(() => {
    if (cell === null) return
    // Trigger animation when a disc is placed
    const emptyCells = state.gameBoard
      .map((rows) => rows[col])
      .filter((cell) => cell === null)

    translateY.value = -(emptyCells.length + 1) * 50
    translateY.value = withSpring(0, {
      damping: 10, // Controls how much "resistance" the spring has (higher = less bounce)
      stiffness: 50, // Controls how "stiff" the spring is (higher = faster fall)
      mass: 2, // Controls the mass of the object (higher = slower movement)
      overshootClamping: true, // Prevents overshooting (no bounce)
    })
  }, [cell])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        pressed && {
          opacity: 0.8,
        },
        isWinningCell && [
          styles.winningDisc,
          {
            borderColor: cell ?? 'white',
          },
        ],
      ]}
      onPress={onPress}
      disabled={cell !== null || state.result !== 'continue'}
      accessibilityLabel={`Cell with ${cell ?? 'no'} disc`}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.disc,
          {
            backgroundColor: 'white',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.disc,
          {
            backgroundColor: cell ?? 'white',
          },
          animatedStyle,
        ]}
      />
    </Pressable>
  )
}

/**
 * Component representing a row in the game board.
 * @param props - The properties of the row.
 * @param props.children - The cells within the row.
 * @returns The rendered row component.
 */
function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

/**
 * Component representing the game board.
 * @param props - The properties of the game board.
 * @param props.gameBoard - The current state of the game board.
 * @param props.onPressCell - The function to call when a cell is pressed.
 * @returns The rendered game board component.
 */
export function GameBoard({
  state,
  onPressCell,
}: ReturnType<typeof useGameBoard>['props']) {
  return (
    <View style={styles.board}>
      {state.gameBoard.map((cells, row) => (
        <Row key={row}>
          {cells.map((cell, col) => (
            <Cell
              key={`${row}-${col}`}
              state={state}
              cell={cell}
              onPress={() => onPressCell(col)}
              isWinningCell={isWinningCell(state, row, col)}
              col={col}
            />
          ))}
        </Row>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: '#1E90FF',
    backgroundColor: '#1E90FF',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    position: 'relative',
    width: cellSize,
    height: cellSize,
  },
  disc: {
    position: 'absolute',
    margin: 2,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (cellSize - 2 * 2) / 2,
    backgroundColor: 'white',
  },
  winningDisc: {
    borderWidth: 2,
    borderRadius: cellSize / 2,
  },
})
