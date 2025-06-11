import { Tabs } from 'expo-router';

import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff00ff',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: 'Check',
          tabBarIcon: ({ color }) => <TabBarIcon name="check" color={color} />,
        }}
      />

      <Tabs.Screen
        name="email"
        options={{
          title: 'Email',
          tabBarIcon: ({ color }) => <TabBarIcon name="mail-forward" color={color} />,
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
