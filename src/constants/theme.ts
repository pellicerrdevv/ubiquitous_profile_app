/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    // Componentes añadidos
    primary: '#007AFF',
    card: '#ffffff',
    subtitle: '#666666',
    border: '#dddddd',
    error: '#ff3b30',
    errorBg: '#fff9f9',
    cardBorder: '#e0e0e0',
    inputText: '#333333'
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    // Componentes añadidos
    primary: '#0A84FF',
    card: '#1e1e1e',
    subtitle: '#aaaaaa',
    border: '#333333',
    error: '#ff453a',
    errorBg: '#2c1514',
    cardBorder: '#2c2c2c',
    inputText: '#ffffff'
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Diccionario de textos para bilingüismo (User Settings)
export const i18n = {
  en: {
    title: 'My Visited Places',
    signIn: 'Sign In',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    login: 'Login',
    register: 'Register',
    noAccount: "Don't have an account? Create one",
    alreadyAccount: 'Already have an account? Login',
    loading: 'Loading...',
    registering: 'Registering...',
    emailRequired: 'Email is mandatory',
    emailFormat: 'Introduce a valid email format (example: user@email.com).',
    passwordRequired: 'Password is mandatory.',
    invalidCredentials: 'Invalid email or password.',
    connError: 'Error when connecting: ',
    passLength: 'Password should have at least 6 characters.',
    confirmRequired: 'Confirm the password.',
    passMatch: 'The passwords do not match.',
    emailInUse: 'This email is already in use.',
    emailInvalid: 'The email is invalid.',
    passWeak: 'Password too weak.',
    regError: 'Registration error: ',
    logout: 'Log out',
    changeProfilePicture: '📸 Change Profile Picture',
    focusedText: ' • Focused',
    registerLoc: '📍 Register current location',
    stats: 'Statistics',
    totalVisits: 'Total visits',
    uniqueLocs: 'Unique locations',
    lastLoc: 'Last location',
    notCaptured: 'Not captured',
    history: 'Trip history',
    noVisits: 'There are no registered places yet.',
    visitBadge: '📌 Visit',
    webMap: '🗺️ Interactive map is only available on phone.',
    address: 'Address',
    unknownAddress: 'Unknown address',
    successTitle: '¡Location registered!'
  },
  es: {
    title: 'Mis Sitios Visitados',
    signIn: 'Iniciar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    noAccount: '¿No tienes cuenta? Regístrate aquí',
    alreadyAccount: '¿Ya tienes cuenta? Inicia Sesión',
    loading: 'Cargando...',
    registering: 'Registrando...',
    emailRequired: 'El correo es obligatorio',
    emailFormat: 'Introduce un formato de correo válido (ej: usuario@email.com).',
    passwordRequired: 'La contraseña es obligatoria.',
    invalidCredentials: 'El correo o la contraseña son incorrectos.',
    connError: 'Error al conectar: ',
    passLength: 'La contraseña debe tener al menos 6 caracteres.',
    confirmRequired: 'Confirma la contraseña.',
    passMatch: 'Las contraseñas no coinciden.',
    emailInUse: 'Este correo electrónico ya está en uso.',
    emailInvalid: 'El correo electrónico no es válido.',
    passWeak: 'La contraseña es muy débil.',
    regError: 'Error en el registro: ',
    logout: 'Cerrar Sesión',
    changeProfilePicture: '📸 Cambiar Foto de Perfil',
    focusedText: ' • Enfocado',
    registerLoc: '📍 Registrar ubicación actual',
    stats: 'Estadísticas',
    totalVisits: 'Total de visitas',
    uniqueLocs: 'Lugares únicos',
    lastLoc: 'Última ubicación',
    notCaptured: 'No capturada',
    history: 'Historial de viajes',
    noVisits: 'Aún no hay lugares registrados.',
    visitBadge: '📌 Visita',
    webMap: '🗺️ El mapa interactivo solo está disponible en el móvil.',
    address: 'Dirección',
    unknownAddress: 'Dirección desconocida',
    successTitle: '¡Ubicación registrada!'
  }
};