import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {CartProvider} from './src/context/CartContext';
import {ThemeProvider} from './src/context/ThemeContext';
import {WishlistProvider} from './src/context/WishlistContext';
import AppNavigator from './src/navigation/AppNavigator';

// Inner component so it can access token from AuthContext
const AppWithProviders = () => {
  const {token} = useAuth();

  return (
    <CartProvider token={token}>
      <WishlistProvider token={token}>
        <NavigationContainer>
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
        <AuthProvider>
          <AppWithProviders />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
