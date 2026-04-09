import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface ListingProps {
  item: {
    id: number;
    title: string;
    price: number;
    imageUrl?: string;
    locationName: string;
  };
  onPress?: () => void;
}

export default function ListingCard({ item, onPress }: ListingProps) {

  // THE ULTIMATE FIX: Ignore the IP saved in the database completely.
  // Just grab the actual image name at the end, and force it to your exact server address.
  const getValidImageUrl = (url?: string) => {
    if (!url) return null;

    // This takes something like "http://localhost/uploads/123-pic.jpg"
    // and just extracts "123-pic.jpg"
    const filename = url.split('/').pop();

    // Now we force it to the exact correct IP and PORT
    return `http://192.168.100.105:3000/uploads/${filename}`;
  };

  const validImageUrl = getValidImageUrl(item.imageUrl);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {validImageUrl ? (
        <Image
          source={{ uri: validImageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImageContainer]}>
          <Text style={styles.noImageText}>📷 No Image Available</Text>
        </View>
      )}

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>${Number(item.price || 0).toFixed(2)}</Text>
        </View>
        <Text style={styles.location}>📍 {item.locationName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8f9fa',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  noImageText: {
    color: '#adb5bd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  location: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});