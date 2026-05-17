import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { HealthRecord } from '@dogapp/types';
import { useHealthRecords } from '../../../hooks/useHealthRecords';
import { useAuthStore } from '../../../store/auth.store';

function RecordItem({ record }: { record: HealthRecord }): React.JSX.Element {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={{ minHeight: 44 }}
      className="mb-3 rounded-xl bg-card p-4"
    >
      <Text className="text-sm text-foreground/50">{record.visitDate}</Text>
      <Text className="mt-1 text-base font-medium text-foreground">{record.reason}</Text>
      {record.vetName ? (
        <Text className="mt-1 text-sm text-foreground/70">{record.vetName}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function HealthScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { records, isLoading, isError } = useHealthRecords(dogId ?? '');

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir son carnet de santé.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-destructive">
          Impossible de charger le carnet de santé.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-4 pt-12">
        <Text className="text-2xl font-bold text-foreground">Carnet de santé</Text>
      </View>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecordItem record={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">
              Aucun enregistrement pour l'instant.
            </Text>
          </View>
        }
      />
    </View>
  );
}
