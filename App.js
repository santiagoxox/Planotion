import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/HomeScreen';
import SubjectsScreen from './screens/SubjectsScreen';
import TimerScreen from './screens/TimerScreen';
import StatsScreen from './screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Subjects') iconName = focused ? 'book' : 'book-outline';
              else if (route.name === 'Timer') iconName = focused ? 'timer' : 'timer-outline';
              else if (route.name === 'Stats') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1a1a2e',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: { paddingBottom: 12, paddingTop: 8, height: 76 },
            tabBarItemStyle: { paddingVertical: 4 },
            tabBarLabelStyle: { fontSize: 12 },
            headerShown: false,
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Subjects" component={SubjectsScreen} />
          <Tab.Screen name="Timer" component={TimerScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}