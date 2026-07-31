import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from storage on initial render
  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...');
    const loadAuthData = async () => {
      try {
        console.log('[AuthProvider] Loading data from AsyncStorage...');
        const [token, user, category] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
        ]);

        console.log('[AuthProvider] Loaded data:', {token, user, category});

        if (token) {
          console.log('[AuthProvider] Setting user token:', token);
          setToken(token);
        }
        if (user) {
          const parsedUser = JSON.parse(user);
          console.log('[AuthProvider] Setting user data:', parsedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to load auth data:', error);
      } finally {
        console.log('[AuthProvider] Finished loading auth data');
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = useCallback(async (token, user) => {
    console.log('🔐 [AuthProvider] LOGIN CALLED');
    console.log('🔐 [AuthProvider] Token received:', token);
    console.log(
      '🔐 [AuthProvider] User data received:',
      JSON.stringify(user, null, 2),
    );

    try {
      console.log('💾 [AuthProvider] Saving auth data to AsyncStorage...');

      // Save token
      await AsyncStorage.setItem('token', token);
      console.log('✅ [AuthProvider] Token saved to AsyncStorage');

      // Save user data
      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('✅ [AuthProvider] User data saved to AsyncStorage');

      // Update state
      console.log('🔄 [AuthProvider] Updating state...');
      setToken(token);
      setUser(user);

      console.log('✅ [AuthProvider] State updated successfully');
      console.log('🔐 [AuthProvider] Current token in state:', token);
      console.log(
        '👤 [AuthProvider] Current user in state:',
        JSON.stringify(user, null, 2),
      );
    } catch (error) {
      console.error('❌ [AuthProvider] Failed to save auth data:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('🚪 [AuthProvider] LOGOUT CALLED');
    try {
      console.log('🗑️ [AuthProvider] Clearing auth data from storage...');
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('❌ [AuthProvider] Failed to logout:', error);
      throw error;
    }
  }, []);

  const value = {
    isLoggedIn: !!token && !!user,
    token,
    user,
    login,
    logout,
  };

  // Log current state whenever it changes
  useEffect(() => {
    console.log('🔐 isLoggedIn:', !!token);
    console.log('🔐 token:', token);
    console.log('👤 user:', user ? JSON.stringify(user, null, 2) : 'null');
    console.log('-----------------------------------');
  }, [token, user]);

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth must be used within an AuthProvider');
  }
  return context;
};
