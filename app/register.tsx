import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Password Strength Logic ---
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1; // Length
    if (/[A-Z]/.test(pass)) score += 1; // Uppercase
    if (/[0-9]/.test(pass)) score += 1; // Number
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Special Character
    return score; // Max score is 4
  };

  const strengthScore = calculateStrength(password);

  const getStrengthColor = () => {
    if (strengthScore === 0) return '#e0e0e0'; // Gray (empty)
    if (strengthScore === 1) return '#e74c3c'; // Red (weak)
    if (strengthScore === 2) return '#f39c12'; // Orange (fair)
    if (strengthScore === 3) return '#f1c40f'; // Yellow (good)
    return '#2ecc71'; // Green (strong)
  };

  const getStrengthText = () => {
    if (password.length === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (strengthScore < 2) {
      Alert.alert("Error", "Please choose a stronger password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.100.105:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          phoneNumber,
          password,
          whatsappEnabled: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      Alert.alert("Success!", "Account created successfully. You can now log in.");
      router.back();

    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.subText}>Join the marketplace today</Text>

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#95a5a6" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#95a5a6" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Phone Number (e.g. 0771234567)" placeholderTextColor="#95a5a6" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

        <TextInput style={styles.input} placeholder="Password (min 8 characters)" placeholderTextColor="#95a5a6" value={password} onChangeText={setPassword} secureTextEntry />

        {/* --- Live Password Strength UI --- */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBars}>
              <View style={[styles.bar, { backgroundColor: strengthScore >= 1 ? getStrengthColor() : '#e0e0e0' }]} />
              <View style={[styles.bar, { backgroundColor: strengthScore >= 2 ? getStrengthColor() : '#e0e0e0' }]} />
              <View style={[styles.bar, { backgroundColor: strengthScore >= 3 ? getStrengthColor() : '#e0e0e0' }]} />
              <View style={[styles.bar, { backgroundColor: strengthScore >= 4 ? getStrengthColor() : '#e0e0e0' }]} />
            </View>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
              {getStrengthText()}
            </Text>
          </View>
        )}

        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#95a5a6" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchModeButton} onPress={() => router.back()}>
          <Text style={styles.switchModeText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  headerText: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  subText: { fontSize: 16, color: '#7f8c8d', marginBottom: 32 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 16, color: '#333' },

  // New Styles for Password Strength
  strengthContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  strengthBars: { flexDirection: 'row', flex: 1, marginRight: 16, gap: 4 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  strengthText: { fontSize: 14, fontWeight: '600', width: 50, textAlign: 'right' },

  registerButton: { backgroundColor: '#3498db', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8, elevation: 4 },
  registerButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  switchModeButton: { marginTop: 24, alignItems: 'center' },
  switchModeText: { color: '#2c3e50', fontSize: 16, fontWeight: '600' },
});