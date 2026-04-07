import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await getListings();
        // THE FIX: We reach inside the response object to get the actual array
        setListings(response.data);
      } catch (err) {
        console.error("Failed to load:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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
          renderItem={({ item }) => <ListingCard item={item} />}
          contentContainerStyle={styles.list}
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