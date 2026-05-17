import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { Medication } from '@dogapp/types';
import { useConfirmDose, useMedications } from '../../../hooks/useMedications';
import { useAuthStore } from '../../../store/auth.store';

function stockColor(stockCount: number | null, threshold: number | null): string {
  if (stockCount === null) return '#6b7280';
  if (threshold !== null && stockCount <= threshold) return '#ef4444';
  if (stockCount <= 5) return '#f97316';
  return '#22c55e';
}

function MedicationCard({ item, dogId }: { item: Medication; dogId: string }): React.JSX.Element {
  const { mutate, isPending } = useConfirmDose(dogId);
  const color = stockColor(item.stockCount, item.stockAlertThreshold);

  return (
    <View className="mb-3 rounded-xl bg-card p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{item.name}</Text>
          <Text className="mt-0.5 text-sm text-foreground/60">{item.dosage}</Text>
          {item.endDate ? (
            <Text className="mt-0.5 text-xs text-foreground/40">Jusqu'au {item.endDate}</Text>
          ) : null}
          {item.stockCount !== null ? (
            <Text className="mt-1 text-xs font-medium" style={{ color }}>
              Stock : {item.stockCount} unité{item.stockCount !== 1 ? 's' : ''}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, minWidth: 44 }}
          className="ml-3 items-center justify-center rounded-lg bg-primary px-3"
          disabled={isPending}
          onPress={() => mutate(item.id)}
        >
          <Text className="text-sm font-medium text-primary-foreground">
            {isPending ? '…' : 'Prise'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MedicationsScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { medications, isLoading, isError } = useMedications(dogId ?? '');

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir ses médicaments.
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
        <Text className="text-center text-destructive">Impossible de charger les médicaments.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-4 pt-12">
        <Text className="text-2xl font-bold text-foreground">Médicaments</Text>
      </View>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MedicationCard item={item} dogId={dogId} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">Aucun médicament actif.</Text>
          </View>
        }
      />
    </View>
  );
}
