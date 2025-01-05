import { GameBoard, useGameBoard } from '@/features/GameBoard/GameBoard'
import { Stack } from 'expo-router'

import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

function IndexScreen() {
  const {
    result,
    currentPlayer,
    resetGame,
    props: gameBoardProps,
  } = useGameBoard()

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Connect Four',
          headerStyle: { backgroundColor: '#1E90FF' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <Pressable
              onPress={resetGame}
              style={({ pressed }) => [
                styles.resetGameButton,
                pressed && styles.resetGameButtonPressed,
              ]}
            >
              <Text style={styles.resetGameButtonText}>Reset</Text>
            </Pressable>
          ),
        }}
      />

      <GameBoard {...gameBoardProps} />
      <View style={styles.indicator}>
        <Text style={styles.indicatorText}>
          {result === 'continue'
            ? 'Next'
            : result === 'draw'
            ? 'Draw'
            : 'Winner'}
          :
        </Text>
        <View
          style={[
            styles.indicatorIcon,
            {
              backgroundColor: currentPlayer,
            },
          ]}
        />
      </View>
    </View>
  )
}

export default IndexScreen

const styles = StyleSheet.create({
  resetGameButton: {
    paddingHorizontal: 16,
  },
  resetGameButtonPressed: {
    opacity: 0.8,
  },
  resetGameButtonText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F5FCFF',
    minHeight: '100%',
    gap: 16,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 8,
  },
  indicatorText: {
    fontSize: 20,
    color: 'white',
  },
  indicatorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
})
