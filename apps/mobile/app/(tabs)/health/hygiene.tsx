import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import type { HygieneCare } from '@dogapp/types';
import { HygieneCareType } from '@dogapp/types';
import { useHygieneCares, useMarkHygieneDone } from '../../../hooks/useHygiene';
import { useAuthStore } from '../../../store/auth.store';

const CARE_LABELS: Record<HygieneCareType, string> = {
  [HygieneCareType.TEETH]: 'Dents',
  [HygieneCareType.NAILS]: 'Griffes',
  [HygieneCareType.BATH]: 'Bain',
  [HygieneCareType.BRUSHING]: 'Brossage',
  [HygieneCareType.GROOMING]: 'Toilettage',
  [HygieneCareType.EARS]: 'Oreilles',
  [HygieneCareType.CUSTOM]: 'Autre',
};

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

function urgencyColor(days: number): string {
  if (days <= 0) return '#ef4444';
  if (days <= 3) return '#f97316';
  return '#6b7280';
}

function CareItem({ item, dogId }: { item: HygieneCare; dogId: string }): React.JSX.Element {
  const { mutate, isPending } = useMarkHygieneDone(dogId);
  const days = daysUntil(item.nextDueAt);
  const color = urgencyColor(days);

  return (
    <View className="mb-3 rounded-xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {item.label ?? CARE_LABELS[item.careType]}
          </Text>
          <Text className="mt-0.5 text-xs text-foreground/50">
            Tous les {item.frequencyDays} jours
          </Text>
          <Text className="mt-0.5 text-xs font-medium" style={{ color }}>
            {days > 0
              ? `Prochain dans ${days} jour${days > 1 ? 's' : ''}`
              : days === 0
                ? "Aujourd'hui"
                : `Dépassé de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, minWidth: 44 }}
          className="ml-3 items-center justify-center rounded-lg bg-primary px-3"
          disabled={isPending}
          onPress={() => mutate(item.id)}
        >
          <Text className="text-sm font-medium text-primary-foreground">
            {isPending ? '…' : 'Fait'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HygieneScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { cares, isLoading, isError } = useHygieneCares(dogId ?? '');

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir ses soins hygiène.
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
          Impossible de charger les soins hygiène.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-4 pt-12">
        <Text className="text-2xl font-bold text-foreground">Soins hygiène</Text>
      </View>
      <FlatList
        data={cares}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CareItem item={item} dogId={dogId} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">Aucun soin configuré.</Text>
          </View>
        }
      />
    </View>
  );
}
