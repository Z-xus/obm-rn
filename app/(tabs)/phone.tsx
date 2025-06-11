import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

export default function PhoneAuth() {
  // Firebase auth states
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (user) {
      Alert.alert('Success', 'Phone authentication successful!');
      console.log('User authenticated:', user.uid);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    // IMPORTANT: Configure auth settings for testing
    // Remove these lines in production
    if (__DEV__) {
      // auth().settings.appVerificationDisabledForTesting = true;
      // Alternatively, you can force reCAPTCHA flow:
      auth().settings.forceRecaptchaFlowForTesting = true;
      console.log("hi");
    }

    return subscriber; // unsubscribe on unmount
  }, []);

  // Handle phone number sign in
  async function handleSignInWithPhoneNumber() {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Ensure phone number is in E.164 format
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      // If no country code, assume US (+1) for testing
      // In production, implement proper country code selection
      formattedNumber = '+1' + formattedNumber.replace(/\D/g, '');
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', formattedNumber);
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      setConfirm(confirmation);
      Alert.alert('Success', 'Verification code sent to your phone');
      console.log('Confirmation result:', confirmation);
    } catch (error: any) {
      console.error('Phone auth error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle specific error cases
      let errorMessage = 'Failed to send verification code';
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number format';
          break;
        case 'auth/missing-phone-number':
          errorMessage = 'Phone number is required';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS quota exceeded. Try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled';
          break;
        case 'auth/missing-client-identifier':
          errorMessage = 'App verification failed. Check your Firebase configuration.';
          break;
        default:
          errorMessage = error.message || 'Unknown error occurred';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Confirm verification code
  async function confirmCode() {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      console.log('Confirming code:', code);
      await confirm?.confirm(code);
      // User will be set in onAuthStateChanged
    } catch (error: any) {
      console.error('Code confirmation error:', error);
      console.error('Error code:', error.code);

      let errorMessage = 'Invalid verification code';
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code. Please try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Session expired. Please start over.';
          break;
        default:
          errorMessage = error.message || 'Verification failed';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function signOut() {
    try {
      await auth().signOut();
      setConfirm(null);
      setCode('');
      setPhoneNumber('');
      Alert.alert('Success', 'Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  }

  // Reset form
  function resetForm() {
    setConfirm(null);
    setCode('');
    setPhoneNumber('');
  }

  // Resend code
  async function resendCode() {
    await handleSignInWithPhoneNumber();
  }

  // If user is authenticated, show success screen
  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Welcome!</Text>
          <Text style={styles.successText}>
            You are successfully signed in with phone number:
          </Text>
          <Text style={styles.phoneText}>{user.phoneNumber}</Text>

          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If confirmation is set, show OTP input
  if (confirm) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to {phoneNumber}
            </Text>

            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={confirmCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={resendCode}
              disabled={loading}
            >
              <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={resetForm}
            >
              <Text style={styles.linkText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Phone number input screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to receive a verification code
          </Text>

          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignInWithPhoneNumber}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Code</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>

          {__DEV__ && (
            <Text style={styles.debugText}>
              Development Mode: App verification disabled for testing
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===========================================
// STYLES
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 32,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: '#fff',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
