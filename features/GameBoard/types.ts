export type Player = 'red' | 'yellow'
export type Cell = Player | null
export type GameBoard = Cell[][]

export type GameState = {
  result: 'win' | 'draw' | 'continue'
  gameBoard: GameBoard
  currentPlayer: Player
  winningDiscs: [number, number][] | null
}
