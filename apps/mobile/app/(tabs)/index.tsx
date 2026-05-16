import { Text, View } from 'react-native';

export default function HomeScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-background p-6">
      <Text className="text-xl font-semibold text-foreground">Accueil</Text>
      <Text className="mt-2 text-foreground/70">Bienvenue sur DogApp.</Text>
    </View>
  );
}
