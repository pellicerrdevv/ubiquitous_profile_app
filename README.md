# Ubiquitous Profile App

Mobile application for tracking visited places using location services.

## Features

- User authentication (login/register)
- User profile management
- Location tracking
- Visit statistics

## Setup

### Prerequisites
- Node.js v22+
- npm v10+
- Expo CLI

### Installation

1. Clone repository
```bash
git clone https://github.com/pellicerrdevv/ubiquitous_profile_app
cd ubiquitous_profile_app
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
- Create a Firebase project at https://firebase.google.com
- Copy credentials to `src/firebaseConfig.js`

4. Run the app
```bash
npx expo start
```

Press `a` for Android or `i` for iOS

## Project Structure

```
ubiquitous_profile_app/
├── App.js
├── src/
│   ├── firebaseConfig.js
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       └── ProfileScreen.js
├── package.json
└── README.md
```

## Technologies

- React Native
- Expo
- Firebase (Authentication & Firestore)
- React Navigation

## License

MIT
