import { Text, View } from 'react-native';

export default function HealthScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-background p-6">
      <Text className="text-xl font-semibold text-foreground">Santé</Text>
      <Text className="mt-2 text-foreground/70">Carnet, rappels et symptômes.</Text>
    </View>
  );
}
