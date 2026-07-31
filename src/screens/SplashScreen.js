import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';

const {width} = Dimensions.get('window');

const SplashScreen = () => {
  const {isLoggedIn} = useAuth();
  const navigation = useNavigation();
  const {theme} = useTheme();
  const logoScale = new Animated.Value(0.5);
  const textOpacity = new Animated.Value(0);
  const loadingProgress = new Animated.Value(0);

  useEffect(() => {
    // Animate logo
    Animated.spring(logoScale, {
      toValue: 1,
      tension: 15,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Animate text and loading bar
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        navigation.replace('Login');
      } else {
        navigation.replace('FoodTab');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, isLoggedIn]);

  return (
    <>
      <StatusBar
        backgroundColor={theme.statusBarBackground}
        barStyle={theme.statusBarStyle}
      />
      <View
        style={[
          styles.container,
          {backgroundColor: theme.statusBarBackground},
        ]}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{scale: logoScale}],
            },
          ]}>
          <Image
            source={require('../assets/images/Sangam-logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
            },
          ]}>
          <Text style={[styles.title, {color: theme.splashText}]}>Sangam Wholesale</Text>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    padding: 6,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#fff',
    width: width * 0.35,
    height: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
});

export default SplashScreen;
