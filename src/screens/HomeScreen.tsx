import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
};

function HomeScreen({navigation}: any) {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUser();
    loadTasks();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('user');

    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }
  };

  const loadTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await API.get('/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.log('Load tasks error:', error);
    }
  };

  const addTask = async () => {
    if (task.trim() === '') {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      const response = await API.post(
        '/tasks',
        {
          title: task,
          priority: 'Medium',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTasks([response.data, ...tasks]);
      setTask('');
    } catch (error) {
      Alert.alert('Error', 'Could not add task');
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await API.patch(
        `/tasks/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTasks(
        tasks.map(item =>
          item._id === id ? response.data : item,
        ),
      );
    } catch (error) {
      Alert.alert('Error', 'Could not update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');

      await API.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(tasks.filter(item => item._id !== id));
    } catch (error) {
      Alert.alert('Error', 'Could not delete task');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TaskFlow</Text>
          <Text>Hi, {userName} 👋</Text>
        </View>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tasks yet. Add your first task!
          </Text>
        }
        renderItem={({item}) => (
          <View style={styles.taskCard}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                item.completed && styles.checked,
              ]}
              onPress={() => toggleTask(item._id)}>
              {item.completed && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>

            <Text
              style={[
                styles.taskText,
                item.completed && styles.completed,
              ]}>
              {item.title}
            </Text>

            <TouchableOpacity
              onPress={() => deleteTask(item._id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  logout: {
    color: 'red',
    fontWeight: 'bold',
  },

  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },

  addButton: {
    backgroundColor: '#222',
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 8,
    borderRadius: 8,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#222',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checked: {
    backgroundColor: '#222',
  },

  check: {
    color: 'white',
    fontWeight: 'bold',
  },

  taskText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },

  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },

  delete: {
    color: 'red',
    fontWeight: 'bold',
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
  },
});

export default HomeScreen;