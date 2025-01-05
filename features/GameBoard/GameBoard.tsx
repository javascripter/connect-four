import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

import type { GameBoard, GameState, Cell } from './types'
import { isWinningCell, placeDisc } from './utils'
import { COLUMNS, ROWS } from './constants'

const CELL_SIZE = 50

/**
 * Custom hook to manage the game state and logic.
 * @returns An object containing the current player, reset function, and game
 * board props to spread into the GameBoard component.
 */
export function useGameBoard() {
  const initialBoard: GameBoard = Array(ROWS)
    .fill(null)
    .map(() => Array(COLUMNS).fill(null))

  const initialState: GameState = {
    result: 'continue',
    gameBoard: initialBoard,
    currentPlayer: 'red',
    winningDiscs: null,
  }

  const [state, setState] = React.useState<GameState>(initialState)

  /**
   * Handles the press event on a cell.
   * @param col - The column index of the pressed cell.
   */
  function onPressCell(col: number) {
    const nextState = placeDisc(state, col)
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

  React.useEffect(() => {
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
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  disc: {
    position: 'absolute',
    margin: 2,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (CELL_SIZE - 2 * 2) / 2,
    backgroundColor: 'white',
  },
  winningDisc: {
    borderWidth: 2,
    borderRadius: CELL_SIZE / 2,
  },
})
