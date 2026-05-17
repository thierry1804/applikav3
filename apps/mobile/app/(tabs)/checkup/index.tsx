import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { CheckupRecommendation } from '@dogapp/types';
import { useCheckupQuestions, useSubmitCheckup } from '../../../hooks/useCheckup';
import { useAuthStore } from '../../../store/auth.store';

const RECOMMENDATION_CONFIG: Record<
  CheckupRecommendation,
  { label: string; color: string; detail: string }
> = {
  [CheckupRecommendation.GOOD]: {
    label: 'Excellent',
    color: '#22c55e',
    detail: 'Votre chien est en bonne santé. Continuez comme ça !',
  },
  [CheckupRecommendation.WATCH]: {
    label: 'À surveiller',
    color: '#f97316',
    detail: 'Quelques points méritent attention. Observez votre chien dans les prochains jours.',
  },
  [CheckupRecommendation.CONSULT]: {
    label: 'Consulter',
    color: '#ef4444',
    detail: 'Nous vous recommandons de consulter un vétérinaire prochainement.',
  },
};

type Step = 'intro' | 'questions' | 'result';

export default function CheckupScreen(): React.JSX.Element {
  const dogId = useAuthStore((s) => s.selectedDogId);
  const { questions, isLoading } = useCheckupQuestions(dogId ?? '');
  const { mutate, isPending, result } = useSubmitCheckup(dogId ?? '');
  const [step, setStep] = useState<Step>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  if (!dogId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-foreground/70">
          Sélectionnez un chien pour commencer le check-up.
        </Text>
      </View>
    );
  }

  if (step === 'intro') {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-3 text-3xl font-bold text-foreground">Check-up rapide</Text>
        <Text className="mb-8 text-center text-base text-foreground/60">
          Répondez à quelques questions pour évaluer la santé de votre chien.
        </Text>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 52, minWidth: 200 }}
            className="items-center justify-center rounded-xl bg-primary px-8"
            onPress={() => {
              setStep('questions');
              setCurrentIdx(0);
              setAnswers({});
            }}
          >
            <Text className="text-base font-semibold text-primary-foreground">Commencer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (step === 'questions') {
    const question = questions[currentIdx];
    if (!question) {
      mutate(answers);
      setStep('result');
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
        </View>
      );
    }

    const total = questions.length;
    const progress = ((currentIdx + 1) / total) * 100;

    function answer(value: boolean): void {
      if (!question) return;
      const newAnswers = { ...answers, [question.id]: value };
      setAnswers(newAnswers);
      if (currentIdx + 1 >= total) {
        mutate(newAnswers);
        setStep('result');
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }

    return (
      <View className="flex-1 bg-background px-6 pt-12">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm text-foreground/50">
            {currentIdx + 1} / {total}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 44, minWidth: 44 }}
            className="items-center justify-center"
            onPress={() => setStep('intro')}
          >
            <Text className="text-sm text-foreground/50">Annuler</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-8 h-2 rounded-full bg-card">
          <View className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </View>
        <Text className="mb-10 text-xl font-semibold text-foreground">{question.text}</Text>
        <View className="gap-4">
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 56 }}
            className="items-center justify-center rounded-xl bg-green-500 px-6"
            onPress={() => answer(true)}
          >
            <Text className="text-base font-semibold text-white">Oui</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={{ minHeight: 56 }}
            className="items-center justify-center rounded-xl bg-card px-6"
            onPress={() => answer(false)}
          >
            <Text className="text-base font-semibold text-foreground">Non</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isPending || !result) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const config = RECOMMENDATION_CONFIG[result.recommendation];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center px-6 pt-12">
        <Text className="mb-2 text-2xl font-bold text-foreground">Résultat</Text>
        <Text className="mb-6 text-5xl font-bold" style={{ color: config.color }}>
          {result.score}%
        </Text>
        <View
          className="mb-4 rounded-xl px-6 py-3"
          style={{ backgroundColor: `${config.color}22` }}
        >
          <Text className="text-lg font-semibold" style={{ color: config.color }}>
            {config.label}
          </Text>
        </View>
        <Text className="mb-10 text-center text-base text-foreground/70">{config.detail}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 52, minWidth: 200 }}
          className="items-center justify-center rounded-xl bg-primary px-8"
          onPress={() => {
            setStep('intro');
            setAnswers({});
            setCurrentIdx(0);
          }}
        >
          <Text className="text-base font-semibold text-primary-foreground">Recommencer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
