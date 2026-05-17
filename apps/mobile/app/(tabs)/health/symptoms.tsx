import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import type { SymptomLog } from '@dogapp/types';
import { useCreateSymptom, useSymptoms } from '../../../hooks/useSymptoms';
import { useAuthStore } from '../../../store/auth.store';

const PRESET_SYMPTOMS = [
  'Vomissement',
  'Diarrhée',
  'Léthargie',
  'Perte appétit',
  'Boiterie',
  'Toux',
  'Grattage',
  'Tremblements',
];

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Léger',
  2: 'Modéré',
  3: 'Sévère',
};

const SEVERITY_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#f97316',
  3: '#ef4444',
};

function LogItem({ item }: { item: SymptomLog }): React.JSX.Element {
  const color = SEVERITY_COLORS[item.severity] ?? '#6b7280';
  return (
    <View className="mb-3 rounded-xl bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-foreground/50">{item.loggedAt.slice(0, 10)}</Text>
        <Text className="text-xs font-medium" style={{ color }}>
          {SEVERITY_LABELS[item.severity] ?? item.severity}
        </Text>
      </View>
      <Text className="mt-1 text-sm text-foreground">{item.symptoms.join(', ')}</Text>
      {item.notes ? <Text className="mt-1 text-xs text-foreground/60">{item.notes}</Text> : null}
    </View>
  );
}

function CreateForm({ dogId, onDone }: { dogId: string; onDone: () => void }): React.JSX.Element {
  const { mutate, isPending } = useCreateSymptom(dogId);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [severity, setSeverity] = useState(1);
  const [notes, setNotes] = useState('');

  function toggle(s: string): void {
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function submit(): void {
    const all = custom.trim() ? [...selected, custom.trim()] : selected;
    if (all.length === 0) return;
    const payload = notes.trim()
      ? { symptoms: all, severity, notes: notes.trim() }
      : { symptoms: all, severity };
    mutate(payload);
    onDone();
  }

  return (
    <View className="p-6">
      <Text className="mb-3 text-base font-semibold text-foreground">Symptômes</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {PRESET_SYMPTOMS.map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            style={{ minHeight: 44 }}
            className={`items-center justify-center rounded-full px-3 ${selected.includes(s) ? 'bg-primary' : 'bg-card'}`}
            onPress={() => toggle(s)}
          >
            <Text
              className={`text-sm ${selected.includes(s) ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <TextInput
        className="mt-3 rounded-lg bg-card px-3 py-2 text-foreground"
        style={{ minHeight: 44 }}
        placeholder="Autre symptôme…"
        placeholderTextColor="#9ca3af"
        value={custom}
        onChangeText={setCustom}
      />
      <Text className="mb-2 mt-4 text-base font-semibold text-foreground">Sévérité</Text>
      <View className="flex-row gap-3">
        {[1, 2, 3].map((lvl) => (
          <Pressable
            key={lvl}
            accessibilityRole="button"
            style={{ minHeight: 44, flex: 1 }}
            className={`items-center justify-center rounded-lg ${severity === lvl ? 'bg-primary' : 'bg-card'}`}
            onPress={() => setSeverity(lvl)}
          >
            <Text
              className={`text-sm font-medium ${severity === lvl ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              {SEVERITY_LABELS[lvl]}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        className="mt-3 rounded-lg bg-card px-3 py-2 text-foreground"
        style={{ minHeight: 44 }}
        placeholder="Notes (optionnel)…"
        placeholderTextColor="#9ca3af"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, flex: 1 }}
          className="items-center justify-center rounded-lg bg-card"
          onPress={onDone}
        >
          <Text className="text-sm font-medium text-foreground">Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, flex: 1 }}
          className="items-center justify-center rounded-lg bg-primary"
          disabled={isPending || selected.length === 0}
          onPress={submit}
        >
          <Text className="text-sm font-medium text-primary-foreground">
            {isPending ? '…' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SymptomsScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { logs, isLoading, isError } = useSymptoms(dogId ?? '');
  const [showForm, setShowForm] = useState(false);

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour voir le journal des symptômes.
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
        <Text className="text-center text-destructive">Impossible de charger le journal.</Text>
      </View>
    );
  }

  if (showForm) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pb-2 pt-12">
          <Text className="text-2xl font-bold text-foreground">Nouveau symptôme</Text>
        </View>
        <CreateForm dogId={dogId} onDone={() => setShowForm(false)} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pb-4 pt-12">
        <Text className="text-2xl font-bold text-foreground">Journal symptômes</Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, minWidth: 44 }}
          className="items-center justify-center rounded-lg bg-primary px-4"
          onPress={() => setShowForm(true)}
        >
          <Text className="text-sm font-medium text-primary-foreground">+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="mt-12 items-center">
            <Text className="text-center text-foreground/50">Aucun symptôme enregistré.</Text>
          </View>
        }
      />
    </View>
  );
}
