import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function LoginScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="mb-2 text-2xl font-semibold text-foreground">DogApp</Text>
      <Text className="mb-8 text-center text-foreground/70">Le compagnon santé de votre chien</Text>
      <Link href="/(tabs)" asChild>
        <Pressable className="min-h-11 min-w-44 items-center justify-center rounded-lg bg-coral px-6 py-3">
          <Text className="font-medium text-white">Continuer</Text>
        </Pressable>
      </Link>
    </View>
  );
}
