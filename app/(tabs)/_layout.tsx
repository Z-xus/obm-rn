import { Tabs } from 'expo-router';

import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff00ff',
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="phone"
        options={{
          title: 'Phone',
          tabBarIcon: ({ color }) => <TabBarIcon name="phone" color={color} />,
        }}
      />
    </Tabs>
  );
}
