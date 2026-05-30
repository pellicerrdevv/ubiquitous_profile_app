import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSettings } from '../context/SettingsContext';

export default function RegisterScreen({ navigation }) {
  const { theme, t } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFirebaseError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError(t.emailRequired);
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t.emailFormat);
      isValid = false;
    }

    if (!password) {
      setPasswordError(t.passwordRequired);
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t.passLength);
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t.confirmRequired);
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t.passMatch);
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Success', 'Account created successfully.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError(t.emailInUse);
      } else if (error.code === 'auth/invalid-email') {
        setFirebaseError(t.emailInvalid);
      } else if (error.code === 'auth/weak-password') {
        setFirebaseError(t.passWeak);
      } else {
        setFirebaseError(t.regError + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t.register}</Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.inputText }, emailError ? styles.inputError : null]}
        placeholder={t.email}
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      {emailError ? <Text style={styles.errorText}>⚠️ {emailError}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.inputText }, passwordError ? styles.inputError : null]}
        placeholder={t.password}
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />
      {passwordError ? <Text style={styles.errorText}>⚠️ {passwordError}</Text> : null}

      <TextInput
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.inputText }, confirmPasswordError ? styles.inputError : null]}
        placeholder={t.confirmPassword}
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmPasswordError) setConfirmPasswordError('');
        }}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />
      {confirmPasswordError ? <Text style={styles.errorText}>⚠️ {confirmPasswordError}</Text> : null}

      {firebaseError ? (
        <View style={[styles.firebaseErrorBox, { backgroundColor: theme.errorBg, borderLeftColor: theme.error }]}>
          <Text style={[styles.firebaseErrorText, { color: theme.error }]}>{firebaseError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t.registering : t.register}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.primary }]}>{t.alreadyAccount}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8, fontSize: 15 },
  button: { padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 15 },
  inputError: { borderColor: '#ff3b30', backgroundColor: '#fff9f9' },
  errorText: { color: '#ff3b30', fontSize: 12, marginTop: -8, marginBottom: 12, fontWeight: '500', paddingLeft: 4 },
  firebaseErrorBox: { padding: 12, borderRadius: 8, marginTop: 5, marginBottom: 10, borderLeftWidth: 4 },
  firebaseErrorText: { fontSize: 13, fontWeight: '500' },
});