import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function SellScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // THE FIX: New state to track if we are currently uploading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !locationName || !imageUri || description.length < 10) {
      Alert.alert('Missing Info', 'Please fill out all fields. Description must be at least 10 characters long.');
      return;
    }

    // THE FIX: Prevent running if already submitting, then lock the form
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // API STEP 1: Upload the Image File
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const uploadResponse = await fetch('http://192.168.100.105:3000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to server');
      }

      const uploadData = await uploadResponse.json();
      const uploadedImageUrl = uploadData.url;

      // API STEP 2: Create the Listing Record
      const listingPayload = {
        title: title,
        description: description,
        price: parseFloat(price),
        category: 'Electronics',
        latitude: -17.824858,
        longitude: 31.053028,
        locationName: locationName,
        imageUrl: uploadedImageUrl
      };

      const listingResponse = await fetch('http://192.168.100.105:3000/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingPayload),
      });

      if (!listingResponse.ok) {
        const errorData = await listingResponse.json();
        console.error('Server Validation Error:', errorData);
        throw new Error('Failed to create listing record in database');
      }

      Alert.alert('Success', 'Item posted successfully!');

      // Clear the form
      setTitle('');
      setPrice('');
      setLocationName('');
      setDescription('');
      setImageUri(null);

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Could not post the item. Check your console for details.');
    } finally {
      // THE FIX: Unlock the form regardless of success or failure
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.headerTitle}>Post a New Item</Text>

        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={isSubmitting} // Disable image picking while uploading
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>📷 Tap to Add a Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PlayStation 5"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#bdc3c7"
            editable={!isSubmitting} // Disable typing while uploading
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 450.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#bdc3c7"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sam Levy's Village"
            value={locationName}
            onChangeText={setLocationName}
            placeholderTextColor="#bdc3c7"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the condition, what's included, etc. (Min 10 characters)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor="#bdc3c7"
            editable={!isSubmitting}
          />
        </View>

        {/* THE FIX: Update button to show loading spinner and disable taps */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Publish Listing</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, flexGrow: 1, paddingBottom: 100 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  imagePickerContainer: { marginBottom: 25, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
  placeholderBox: { width: '100%', height: 200, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#7f8c8d', fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#34495e', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#2c3e50' },
  textArea: { height: 120, paddingTop: 12 },
  submitButton: { backgroundColor: '#2ecc71', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  submitButtonDisabled: { backgroundColor: '#95a5a6' }, // Grays out the button when loading
  submitButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
}); 