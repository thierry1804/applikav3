import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import type { WeightLog } from '@dogapp/types';
import { useLogWeight, useWeightLogs } from '../../../hooks/useWeight';
import { useAuthStore } from '../../../store/auth.store';

function WeightItem({ item }: { item: WeightLog }): React.JSX.Element {
  return (
    <View className="mb-2 flex-row items-center justify-between rounded-xl bg-card px-4 py-3">
      <Text className="text-sm text-foreground/60">{item.weighedAt.slice(0, 10)}</Text>
      <Text className="text-base font-semibold text-foreground">{item.weightKg} kg</Text>
    </View>
  );
}

function LogWeightModal({
  dogId,
  onClose,
}: {
  dogId: string;
  onClose: () => void;
}): React.JSX.Element {
  const { mutate, isPending } = useLogWeight(dogId);
  const [value, setValue] = useState('');

  function submit(): void {
    const kg = parseFloat(value.replace(',', '.'));
    if (isNaN(kg) || kg <= 0) return;
    mutate(kg);
    onClose();
  }

  return (
    <View className="flex-1 items-center justify-center bg-black/50 px-6">
      <View className="w-full rounded-2xl bg-background p-6">
        <Text className="mb-4 text-lg font-bold text-foreground">Enregistrer un poids</Text>
        <TextInput
          className="rounded-lg bg-card px-3 py-3 text-foreground"
          style={{ minHeight: 44 }}
          placeholder="Poids en kg (ex: 12.5)"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          value={value}
          onChangeText={setValue}
          autoFocus
        />
        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 44, flex: 1 }}
            className="items-center justify-center rounded-lg bg-card"
            onPress={onClose}
          >
            <Text className="text-sm font-medium text-foreground">Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 44, flex: 1 }}
            className="items-center justify-center rounded-lg bg-primary"
            disabled={isPending}
            onPress={submit}
          >
            <Text className="text-sm font-medium text-primary-foreground">
              {isPending ? '…' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function WeightScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { logs, isLoading, isError } = useWeightLogs(dogId ?? '');
  const [modalVisible, setModalVisible] = useState(false);

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir son suivi de poids.
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
          Impossible de charger le suivi de poids.
        </Text>
      </View>
    );
  }

  const latest = logs[0];

  return (
    <View className="flex-1 bg-background">
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <LogWeightModal dogId={dogId} onClose={() => setModalVisible(false)} />
      </Modal>
      <View className="px-6 pb-4 pt-12">
        <Text className="text-2xl font-bold text-foreground">Suivi de poids</Text>
        {latest ? (
          <Text className="mt-1 text-sm text-foreground/60">
            Dernier poids : {latest.weightKg} kg ({latest.weighedAt.slice(0, 10)})
          </Text>
        ) : null}
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WeightItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">Aucune pesée enregistrée.</Text>
          </View>
        }
      />
      <View className="absolute bottom-8 right-6">
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 56, minWidth: 56 }}
          className="items-center justify-center rounded-full bg-primary shadow-lg"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-xl font-bold text-primary-foreground">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
