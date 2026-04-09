import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getListings } from '../../src/api/client';

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // We fetch the listings, then find the specific one that matches our ID
        const response = await getListings();
        const foundItem = response.data.find((item: any) => item.id.toString() === id);
        setListing(foundItem);
      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Listing not found!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Magic trick: This dynamically changes the screen header to match the item title! */}
      <Stack.Screen options={{ title: listing.title }} />

      {/* Image Section */}
      {listing.imageUrl ? (
        <Image
          source={{ uri: listing.imageUrl.replace('localhost', '192.168.100.105') }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImageContainer]}>
          <Text style={styles.noImageText}>📷 No Image Available</Text>
        </View>
      )}

      {/* Details Section */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>${listing.price.toFixed(2)}</Text>
        </View>

        <Text style={styles.location}>📍 {listing.locationName}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {listing.description || 'No description provided by the seller.'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Seller Contact</Text>
        <View style={styles.sellerCard}>
          <Text style={styles.sellerText}>👤 {listing.author?.name || 'Unknown Seller'}</Text>
          <Text style={styles.sellerText}>📞 {listing.author?.phoneNumber || 'No phone number'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f9fa',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  noImageText: {
    color: '#adb5bd',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  location: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  sellerCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sellerText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  }
});