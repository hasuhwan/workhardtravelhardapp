import React, {useCallback, useEffect, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {theme} from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fontisto} from '@expo/vector-icons';

const STORAGE_TODO_KEY = '@toDos';
const STORAGE_CATEGORY_KEY = '@work';
interface ItodoListDataValue {
  text: string;
  working: boolean;
  done: boolean;
}
interface ItodoListValue {
  [key: string]: ItodoListDataValue;
}
export default function Todo() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [toDos, setToDos] = useState<ItodoListValue>({});
  const [edit, setEdit] = useState('');
  const travel = useCallback(async () => {
    setWorking(false);
    await AsyncStorage.setItem(STORAGE_CATEGORY_KEY, 'travel');
  }, []);
  const work = useCallback(async () => {
    setWorking(true);
    await AsyncStorage.setItem(STORAGE_CATEGORY_KEY, 'work');
  }, []);
  const onChangeText = useCallback((payload: string) => {
    setText(payload);
  }, []);
  const onChangeEditText = useCallback((payload: string) => {
    setEditText(payload);
  }, []);
  const saveToDos = useCallback(async (toSave: ItodoListValue) => {
    try {
      await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  }, []);
  const loadToDos = useCallback(async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_TODO_KEY);
      if (s !== null) {
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      console.log(e);
    }
  }, []);
  const loadCategory = useCallback(async () => {
    try {
      const category = await AsyncStorage.getItem(STORAGE_CATEGORY_KEY);
      if (category === 'travel') {
        setWorking(false);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);
  useEffect(() => {
    loadToDos();
    loadCategory();
  }, [loadToDos, loadCategory]);
  const addToDo = useCallback(async () => {
    if (text === '') {
      return;
    }
    const newToDos = {...toDos, [Date.now()]: {text, working, done: false}};
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  }, [text, toDos, working, saveToDos]);
  const deleteToDo = useCallback(
    (key: string) => {
      Alert.alert('Delete To Do', 'Are you sure?', [
        {text: 'Cancel'},
        {
          text: "I'm Sure",
          style: 'destructive',
          onPress: async () => {
            const newToDos: ItodoListValue = {...toDos};
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
      return;
    },
    [saveToDos, toDos],
  );
  const doneToDo = useCallback(
    async (key: string) => {
      const newToDos = {...toDos};
      newToDos[key].done = !newToDos[key].done;
      setToDos(newToDos);
      await saveToDos(newToDos);
    },
    [saveToDos, toDos],
  );
  const editToDo = useCallback(
    async (key: string) => {
      if (editText !== '') {
        const newToDos = {...toDos};
        newToDos[key].text = editText;
        setToDos(newToDos);
        setEditText('');
        await saveToDos(newToDos);
      }
      setEditText('');
      setEdit('');
    },
    [editText, saveToDos, toDos],
  );
  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{...styles.btnText, color: working ? 'white' : theme.grey}}>
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{...styles.btnText, color: !working ? 'white' : theme.grey}}>
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        returnKeyType="done"
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        value={text}
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map(key =>
          toDos[key].working === working ? (
            edit === key ? (
              <View style={styles.toDo} key={key}>
                <TextInput
                  key={key}
                  onChangeText={onChangeEditText}
                  onSubmitEditing={() => {
                    editToDo(key);
                  }}
                  value={editText === '' ? toDos[key].text : editText}
                  autoFocus={true}
                />
                <TouchableOpacity
                  onPress={() => {
                    setEdit('');
                    setEditText('');
                  }}>
                  <Fontisto name="close" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.toDo} key={key}>
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].done
                      ? 'line-through'
                      : 'none',
                  }}>
                  {toDos[key].text}
                </Text>
                <View style={styles.toDoBtnList}>
                  {toDos[key].done ? null : (
                    <TouchableOpacity
                      onPress={() => {
                        setEdit(key);
                      }}>
                      <Fontisto
                        name="scissors"
                        size={18}
                        color={theme.grey}
                        style={styles.toDoBtn}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      doneToDo(key);
                    }}>
                    {toDos[key].done ? (
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color={theme.grey}
                        style={styles.toDoBtn}
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color={theme.grey}
                        style={styles.toDoBtn}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deleteToDo(key);
                    }}>
                    <Fontisto
                      name="trash"
                      size={18}
                      color={theme.grey}
                      style={styles.toDoBtn}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )
          ) : null,
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  toDoBtnList: {
    flexDirection: 'row',
  },
  toDoBtn: {
    marginHorizontal: 5,
  },
});
