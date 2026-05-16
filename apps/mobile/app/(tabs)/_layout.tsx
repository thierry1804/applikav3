import { Tabs } from 'expo-router';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FAFAF8' },
        tabBarActiveTintColor: '#FF6340',
        tabBarStyle: { backgroundColor: '#FAFAF8' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="health/index" options={{ title: 'Santé' }} />
    </Tabs>
  );
}
