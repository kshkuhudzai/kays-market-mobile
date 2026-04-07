import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface ListingProps {
  item: {
    title: string;
    price: number;
    imageUrl?: string;
    locationName: string;
  };
}

export default function ListingCard({ item }: ListingProps) {
  return (
    <View style={styles.card}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl.replace('localhost', '192.168.100.105') }}
          style={styles.image}
        />
      )}
      <View style={styles.details}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price.toLocaleString()}</Text>
        <Text style={styles.location}>{item.locationName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  details: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#2ecc71',
    marginTop: 5,
  },
  location: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});