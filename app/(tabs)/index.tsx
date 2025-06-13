import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Button } from '~/components/Button';


const routes = [
  { name: '/(tabs)/check', label: 'Go to Check' },
  { name: '/(tabs)/email', label: 'Go to Email' },
  { name: '/(tabs)/phone', label: 'Go to Phone' },
  { name: '/map', label: 'Go to Maps' },
  { name: '/HomeScreen', label: 'Go to Maps New' },
] as const;

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {routes.map(({ name, label }) => (
          <Link key={name} href={name} asChild>
            <Button title={label} />
          </Link>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    padding: 15,
    gap: 12
  }
});
