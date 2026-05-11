import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import PlannerScreen from './screens/PlannerScreen';
import TimerScreen from './screens/TimerScreen';
import StatsScreen from './screens/StatsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Planner') iconName = focused ? 'book' : 'book-outline';
              else if (route.name === 'Timer') iconName = focused ? 'timer' : 'timer-outline';
              else if (route.name === 'Stats') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              return <Ionicons name={iconName} size={22} color={color} />;
            },
            tabBarActiveTintColor: '#1a1a2e',
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: {
              paddingBottom: 12,
              paddingTop: 8,
              height: 76,
              backgroundColor: '#fff',
              borderTopWidth: 0,
              shadowColor: '#1a1a2e',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
              elevation: 8,
            },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            headerShown: false,
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Planner" component={PlannerScreen} />
          <Tab.Screen name="Timer" component={TimerScreen} />
          <Tab.Screen name="Stat" component={StatsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}