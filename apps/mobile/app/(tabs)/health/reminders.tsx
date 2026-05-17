import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import type { Reminder } from '@dogapp/types';
import { ReminderType } from '@dogapp/types';
import { useMarkReminderDone, useReminders } from '../../../hooks/useReminders';
import { useAuthStore } from '../../../store/auth.store';

const TYPE_LABELS: Record<ReminderType, string> = {
  [ReminderType.VACCINE]: 'Vaccin',
  [ReminderType.DEWORMING]: 'Vermifuge',
  [ReminderType.ANTIPARASITIC]: 'Antiparasitaire',
  [ReminderType.CUSTOM]: 'Autre',
};

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

function urgencyColor(days: number): string {
  if (days <= 7) return '#ef4444';
  if (days <= 30) return '#f97316';
  return '#6b7280';
}

function ReminderItem({ item, dogId }: { item: Reminder; dogId: string }): React.JSX.Element {
  const { mutate, isPending } = useMarkReminderDone(dogId);
  const days = daysUntil(item.dueDate);
  const color = urgencyColor(days);

  return (
    <View className="mb-3 rounded-xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs font-medium" style={{ color }}>
            {days > 0 ? `J-${days}` : days === 0 ? "Aujourd'hui" : 'Dépassé'}
          </Text>
          <Text className="mt-0.5 text-base font-semibold text-foreground">{item.label}</Text>
          <Text className="mt-0.5 text-sm text-foreground/60">{TYPE_LABELS[item.type]}</Text>
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

export default function RemindersScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { reminders, isLoading, isError } = useReminders(dogId ?? '');
  const [activeFilter, setActiveFilter] = useState<ReminderType | null>(null);

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir ses rappels.
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
        <Text className="text-center text-destructive">Impossible de charger les rappels.</Text>
      </View>
    );
  }

  const filtered = activeFilter ? reminders.filter((r) => r.type === activeFilter) : reminders;

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-2 pt-12">
        <Text className="text-2xl font-bold text-foreground">Rappels</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8, gap: 8 }}
      >
        <Pressable
          accessibilityRole="button"
          style={{ minHeight: 44 }}
          className={`items-center justify-center rounded-full px-4 ${activeFilter === null ? 'bg-primary' : 'bg-card'}`}
          onPress={() => setActiveFilter(null)}
        >
          <Text
            className={`text-sm font-medium ${activeFilter === null ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            Tous
          </Text>
        </Pressable>
        {Object.values(ReminderType).map((type) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            style={{ minHeight: 44 }}
            className={`items-center justify-center rounded-full px-4 ${activeFilter === type ? 'bg-primary' : 'bg-card'}`}
            onPress={() => setActiveFilter(type)}
          >
            <Text
              className={`text-sm font-medium ${activeFilter === type ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              {TYPE_LABELS[type]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReminderItem item={item} dogId={dogId} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">Aucun rappel pour l'instant.</Text>
          </View>
        }
      />
    </View>
  );
}
