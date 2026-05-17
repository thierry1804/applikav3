import { ActivityIndicator, FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import type { VetPlace } from '../../../hooks/useVets';
import {
  useAddFavoriteVet,
  useFavoriteVets,
  useRemoveFavoriteVet,
  useVetSearch,
} from '../../../hooks/useVets';

function VetCard({
  vet,
  isFavorite,
  onToggleFavorite,
}: {
  vet: VetPlace;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}): React.JSX.Element {
  return (
    <View className="mb-3 rounded-xl bg-card p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{vet.name}</Text>
          <Text className="mt-0.5 text-sm text-foreground/60">{vet.address}</Text>
          <Text className="mt-0.5 text-xs text-foreground/40">
            À {vet.distanceKm.toFixed(1)} km
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44, minWidth: 44 }}
          className="ml-2 items-center justify-center"
          onPress={onToggleFavorite}
        >
          <Text className="text-xl">{isFavorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      {vet.phone ? (
        <TouchableOpacity
          accessibilityRole="button"
          style={{ minHeight: 44 }}
          className="mt-2 items-center justify-center rounded-lg bg-primary/10 py-2"
          onPress={() => void Linking.openURL(`tel:${vet.phone}`)}
        >
          <Text className="text-sm font-medium text-primary">Appeler {vet.phone}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function VetsScreen(): React.JSX.Element {
  const [tab, setTab] = useState<'search' | 'favorites'>('search');
  const mockLat = 48.8566;
  const mockLng = 2.3522;
  const { vets, isLoading: searchLoading } = useVetSearch(mockLat, mockLng);
  const { favorites, isLoading: favsLoading } = useFavoriteVets();
  const { mutate: addFav } = useAddFavoriteVet();
  const { mutate: removeFav } = useRemoveFavoriteVet();

  const favPlaceIds = new Set(favorites.map((f) => f.placeId));

  function toggleFavorite(vet: VetPlace): void {
    if (favPlaceIds.has(vet.placeId)) {
      removeFav(vet.placeId);
    } else {
      addFav({
        placeId: vet.placeId,
        name: vet.name,
        address: vet.address,
        phone: vet.phone,
        latitude: vet.latitude,
        longitude: vet.longitude,
      });
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-2 pt-12">
        <Text className="text-2xl font-bold text-foreground">Vétérinaires</Text>
      </View>
      <View className="flex-row px-6 pb-3">
        <TouchableOpacity
          accessibilityRole="tab"
          style={{ minHeight: 44, flex: 1 }}
          className={`items-center justify-center rounded-l-lg border border-primary/30 ${tab === 'search' ? 'bg-primary' : 'bg-background'}`}
          onPress={() => setTab('search')}
        >
          <Text
            className={`text-sm font-medium ${tab === 'search' ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            Recherche
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="tab"
          style={{ minHeight: 44, flex: 1 }}
          className={`items-center justify-center rounded-r-lg border border-primary/30 ${tab === 'favorites' ? 'bg-primary' : 'bg-background'}`}
          onPress={() => setTab('favorites')}
        >
          <Text
            className={`text-sm font-medium ${tab === 'favorites' ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            Favoris
          </Text>
        </TouchableOpacity>
      </View>
      {tab === 'search' ? (
        searchLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={vets}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <VetCard
                vet={item}
                isFavorite={favPlaceIds.has(item.placeId)}
                onToggleFavorite={() => toggleFavorite(item)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            ListEmptyComponent={
              <View className="mt-12 items-center">
                <Text className="text-center text-foreground/50">Aucun vétérinaire trouvé.</Text>
              </View>
            }
          />
        )
      ) : favsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VetCard
              vet={{
                placeId: item.placeId,
                name: item.name,
                address: item.address ?? '',
                phone: item.phone,
                latitude: item.latitude,
                longitude: item.longitude,
                distanceKm: 0,
              }}
              isFavorite
              onToggleFavorite={() => removeFav(item.placeId)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="mt-12 items-center">
              <Text className="text-center text-foreground/50">Aucun favori enregistré.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
