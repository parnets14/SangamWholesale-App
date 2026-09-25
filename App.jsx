import React, {useEffect, useRef} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import {WishlistProvider} from './src/context/WishlistContext';
import AppNavigator from './src/navigation/AppNavigator';
import {createNavigationContainerRef} from '@react-navigation/native';

// Navigation ref — lets push handlers navigate without a component prop
export const navigationRef = createNavigationContainerRef();

const GlobalStatusBar = () => {
  const {theme} = useTheme();
  return (
    <StatusBar
      backgroundColor={theme.statusBarBackground}
      barStyle={theme.statusBarStyle}
      translucent={false}
    />
  );
};

const AppWithProviders = () => {
  const {token} = useAuth();
  const listenersRef = useRef(null);

  // ── One-time setup: channel + permission + listeners ──────────────────────
  useEffect(() => {
    const setupPush = async () => {
      try {
        const push = require('./src/services/push');

        push.setNavigator((screen, params) => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(screen, params);
          }
        });

        await push.ensureChannel();
        await push.requestNotificationPermission();

        // Killed-state tap navigation
        const initial = await push.checkInitialNotification();
        if (initial?.data) {
          setTimeout(() => {
            if (navigationRef.isReady()) navigationRef.navigate('Notifications');
          }, 500);
        }

        // Drain pending Notifee background tap
        const AsyncStorage =
          require('@react-native-async-storage/async-storage').default;
        const pending = await AsyncStorage.getItem('udaan_pendingNotifNav');
        if (pending) {
          AsyncStorage.removeItem('udaan_pendingNotifNav');
          setTimeout(() => {
            if (navigationRef.isReady()) navigationRef.navigate('Notifications');
          }, 500);
        }

        // Register foreground listeners once
        const unsubMsg  = push.listenForegroundMessages();
        const unsubTap  = push.listenForegroundNotifTaps();
        const unsubBg   = push.listenBackgroundNotifTaps();
        listenersRef.current = {unsubMsg, unsubTap, unsubBg};
      } catch (e) {
        console.warn('[push] setup failed:', e.message);
      }
    };

    setupPush();

    return () => {
      const l = listenersRef.current;
      if (l) {
        l.unsubMsg && l.unsubMsg();
        l.unsubTap && l.unsubTap();
        l.unsubBg  && l.unsubBg();
      }
    };
  }, []); // run once on mount

  // ── Register FCM token whenever auth token changes ─────────────────────────
  useEffect(() => {
    if (!token) return;
    const push = require('./src/services/push');
    push.registerFcmToken(token).catch(e =>
      console.warn('[push] registerFcmToken failed:', e.message),
    );
  }, [token]);

  return (
    <CartProvider token={token}>
      <WishlistProvider token={token}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </WishlistProvider>
    </CartProvider>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GlobalStatusBar />
        <AuthProvider>
          <AppWithProviders />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
