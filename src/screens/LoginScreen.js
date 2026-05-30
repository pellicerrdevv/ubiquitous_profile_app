import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useSettings } from '../context/SettingsContext';

export default function LoginScreen({ navigation }) {
  const { theme, t, isDarkMode, setIsDarkMode, lang, setLang } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
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
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setFirebaseError(t.invalidCredentials);
      } else {
        setFirebaseError(t.connError + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t.title}</Text>
      <Text style={[styles.subtitle, { color: theme.subtitle }]}>{t.signIn}</Text>

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

      {firebaseError ? (
        <View style={[styles.firebaseErrorBox, { backgroundColor: theme.errorBg, borderLeftColor: theme.error }]}>
          <Text style={[styles.firebaseErrorText, { color: theme.error }]}>{firebaseError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t.loading : t.login}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: theme.primary }]}>{t.noAccount}</Text>
      </TouchableOpacity>

      <View style={[styles.settingsRow, { borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.settingToggle} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingToggle} onPress={() => setLang(lang === 'en' ? 'es' : 'en')}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>🌐 {lang === 'en' ? 'Español' : 'English'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8, fontSize: 15 },
  button: { padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 15 },
  inputError: { borderColor: '#ff3b30', backgroundColor: '#fff9f9' },
  errorText: { color: '#ff3b30', fontSize: 12, marginTop: -8, marginBottom: 12, fontWeight: '500', paddingLeft: 4 },
  firebaseErrorBox: { padding: 12, borderRadius: 8, marginTop: 5, marginBottom: 10, borderLeftWidth: 4 },
  firebaseErrorText: { fontSize: 13, fontWeight: '500' },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 40, borderTopWidth: 1, paddingTop: 20 },
  settingToggle: { padding: 10 }
});