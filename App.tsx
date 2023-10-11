import React from 'react';
import Todo from './components/Todo';
import Weather from './components/Weather';
import {View, StyleSheet} from 'react-native';
import {theme} from './colors';
export default function App() {
  return (
    <View style={styles.container}>
      <Weather />
      <Todo />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
});
