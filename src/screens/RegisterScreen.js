import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados independientes para cada tipo de error
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  // Validación  para creación de cuentas
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFirebaseError('');

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is mandatory.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Introduce a valid email format.');
      isValid = false;
    }

    
    if (!password) {
      setPasswordError('Password is mandatory.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password should have at least 6 characters.');
      isValid = false;
    }

    // Validar que coincidan
    if (!confirmPassword) {
      setConfirmPasswordError('Confirm the password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('The passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('¡Éxito!', 'Cuenta creada correctamente.'); // Alerta limpia antes de ir al perfil
      //navigation.navigate('ProfileScreen');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError('This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setFirebaseError('The email is invalid.');
      } else if (error.code === 'auth/weak-password') {
        setFirebaseError('Password too weak.');
      } else {
        setFirebaseError('Registration error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* INPUT EMAIL */}
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Email"
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

      {/* INPUT PASSWORD */}
      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Password"
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

      {/* INPUT CONFIRM PASSWORD */}
      <TextInput
        style={[styles.input, confirmPasswordError ? styles.inputError : null]}
        placeholder="Confirm Password"
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

      {/* Caja de error general de Firebase */}
      {firebaseError ? (
        <View style={styles.firebaseErrorBox}>
          <Text style={styles.firebaseErrorText}>{firebaseError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Registrando...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8, backgroundColor: 'white', fontSize: 15, color: '#333' },
  button: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 15 },

  // Estilos de Alertas Visuales
  inputError: { borderColor: '#ff3b30', backgroundColor: '#fff9f9' },
  errorText: { color: '#ff3b30', fontSize: 12, marginTop: -8, marginBottom: 12, fontWeight: '500', paddingLeft: 4 },
  firebaseErrorBox: { backgroundColor: '#ffe5e5', padding: 12, borderRadius: 8, marginTop: 5, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ff3b30' },
  firebaseErrorText: { color: '#d61c1c', fontSize: 13, fontWeight: '500' },
});