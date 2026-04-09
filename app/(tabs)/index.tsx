import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

import { getListings } from '../../src/api/client';
import ListingCard from '../../src/components/ListingCard';

interface Listing {
  id: number;
  title: string;
  price: number;
  locationName: string;
  imageUrl?: string;
}

export default function HomeScreen() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // NEW: State to track if the user is currently pulling to refresh
  const [refreshing, setRefreshing] = useState(false);

  // We moved the fetch logic into its own function so we can call it on load AND on refresh
  const fetchListings = async () => {
    try {
      const response = await getListings();
      setListings(response.data);
      setError(false); // Clear any previous errors if it succeeds
    } catch (err) {
      console.error("Failed to load:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Run once when the screen first loads
  useEffect(() => {
    fetchListings();
  }, []);

  // NEW: The function that runs when you pull down the screen
  const onRefresh = async () => {
    setRefreshing(true); // Shows the little spinning circle
    await fetchListings(); // Goes to the database to get fresh data
    setRefreshing(false); // Hides the spinning circle
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not connect to server.</Text>
        <Text>Check your IP address and ensure Fastify is running!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 18, color: '#555' }}>No items for sale right now!</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => router.push(`/listing/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.list}
          // NEW: We attach the pull-to-refresh component to the FlatList here
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2ecc71" // iOS spinner color
              colors={['#2ecc71']} // Android spinner color
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});