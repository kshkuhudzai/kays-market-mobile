import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

// Tells the web browser to properly close after Google Auth finishes
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- GOOGLE AUTH CONFIGURATION ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '922544714221-r0g6cfgeq0m878h0kbm7jdevpia1f3ct.apps.googleusercontent.com',
    webClientId: '922544714221-r0g6cfgeq0m878h0kbm7jdevpia1f3ct.apps.googleusercontent.com',
    // Removed useProxy since Expo deprecated their proxy service.
    // Expo will now generate the correct native or local scheme automatically.
    redirectUri: AuthSession.makeRedirectUri(),
  });

  // Listen for the Google Auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch user profile from Google using the token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();

      // 2. Send the Google email/name to our Fastify backend
      const backendResponse = await fetch('http://192.168.100.105:3000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          googleId: userInfo.id,
        }),
      });

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(data.error || 'Backend Google login failed');
      }

      // 3. Save standard token and route to main feed
      await SecureStore.setItemAsync('userToken', data.token);
      router.replace('/(tabs)');

    } catch (error: any) {
      Alert.alert("Google Login Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STANDARD EMAIL LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://192.168.100.105:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Save the JWT token securely on the device
      await SecureStore.setItemAsync('userToken', data.token);

      // Successfully logged in! Route them to the main app feed
      router.replace('/(tabs)');

    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>Welcome Back</Text>
        <Text style={styles.subText}>Log in to start buying and selling</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#95a5a6"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#95a5a6"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* --- DIVIDER --- */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* --- GOOGLE BUTTON --- */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => promptAsync()}
          activeOpacity={0.8}
          disabled={!request || isLoading}
        >
          <Image
            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
            style={{ width: 24, height: 24, marginRight: 12 }}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={() => router.push('/register' as any)}
        >
          <Text style={styles.switchModeText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    width: '100%',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dcdde1'
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600'
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchModeButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});