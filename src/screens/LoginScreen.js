import React, { useState } from 'react';
import { useRouter } from 'expo-router'; // Lo mantengo intacto por si lo usáis en vuestro enrutador
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  //  Estados para los mensajes de error visuales
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  //  Función quirúrgica de validación
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setFirebaseError('');

    // Validación de formato de Email usando RegEx
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is mandatory');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Introduce a valid email format (example: user@email.com).');
      isValid = false;
    }

    // Validación de contraseña obligatoria
    if (!password) {
      setPasswordError('Password is mandatory.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    // Frena el proceso si los inputs están mal antes de llamar a Firebase
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      //  Mapeo de errores amigables en español en lugar de un Alert feo
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setFirebaseError('Invalid email or password.');
      } else {
        setFirebaseError('Error when connecting: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Visited Places</Text>
      <Text style={styles.subtitle}>Sign In</Text>

      {/*  CAMBIO: Input de Email con borde rojo condicional si hay error */}
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError(''); // Limpia el error al escribir
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      {emailError ? <Text style={styles.errorText}>⚠️ {emailError}</Text> : null}

      {/* Input de Contraseña con borde rojo condicional si hay error */}
      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError(''); // Limpia el error al escribir
        }}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />
      {passwordError ? <Text style={styles.errorText}>⚠️ {passwordError}</Text> : null}

      {/* Cuadro de error general de Firebase justo encima del botón */}
      {firebaseError ? (
        <View style={styles.firebaseErrorBox}>
          <Text style={styles.firebaseErrorText}>{firebaseError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Cargando...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8, backgroundColor: 'white', fontSize: 15, color: '#333' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 15 },
  
  //  Gráficos para las Alertas
  inputError: { borderColor: '#ff3b30', backgroundColor: '#fff9f9' },
  errorText: { color: '#ff3b30', fontSize: 12, marginTop: -8, marginBottom: 12, fontWeight: '500', paddingLeft: 4 },
  firebaseErrorBox: { backgroundColor: '#ffe5e5', padding: 12, borderRadius: 8, marginTop: 5, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ff3b30' },
  firebaseErrorText: { color: '#d61c1c', fontSize: 13, fontWeight: '500' },
});