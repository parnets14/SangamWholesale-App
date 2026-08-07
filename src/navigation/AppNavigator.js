import React from 'react';
import {StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';

// Import Screens (unchanged)
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import BusinessDetailsScreen from '../screens/auth/BusinessDetailsScreen';
import BussinessPhotosScreen from '../screens/auth/BussinessPhotosScreen';
import TakePhotoScreen from '../screens/auth/TakePhotoScreen';
import SelectCategoryScreen from '../screens/auth/Select CategoryScreen';
import CartScreen from '../screens/Food/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import SearchScreen from '../screens/SearchScreen';
import SetupAccountScreen from '../screens/Account/SetupAccountScreen';
import ShopKYCScreen from '../screens/Account/ShopKYCScreen';
import AccountSettingsScreen from '../screens/Account/AccountSettingsScreen';
import ExpirySupportScreen from '../screens/Account/ExpirySupportScreen';
import TargetSchemesScreen from '../screens/Account/TargetSchemesScreen';
import ReturnsScreen from '../screens/Account/ReturnsScreen';
import DeliveriesScreen from '../screens/Account/DeliveriesScreen';
import EditUserDetailsScreen from '../screens/Account/EditUserDetailsScreen';
import EditBusinessDetailsScreen from '../screens/Account/EditBusinessDetailsScreen';
import EditAddressesScreen from '../screens/Account/EditAddressesScreen';
import ManageBankAccountScreen from '../screens/Account/ManageBankAccountScreen';
import LanguagePreferenceScreen from '../screens/Account/LanguagePreferenceScreen';
import ManageTeamScreen from '../screens/Account/ManageTeamScreen';
import PoliciesScreen from '../screens/Account/PoliciesScreen';
import ReferAndEarnScreen from '../screens/Account/ReferAndEarnScreen';
import NewAddressScreen from '../screens/Account/NewAddressScreen';
import FoodHomeScreen from '../screens/Food/FoodHomeScreen';
import MedicineHomeScreen from '../screens/Medicines/MedicineHomeScreen';
import CategoryScreen from '../screens/Food/CategoryScreen';
import ProductDetailsScreen from '../screens/Food/ProductDetailsScreen';
import ProductListScreen from '../screens/Food/ProductListScreen';
import WishlistScreen from '../screens/Food/WishlistScreen';
import UserDetailsScreen from '../screens/auth/UserDetailsScreen';
import CheckoutScreen from '../screens/Food/CheckoutScreen';
import TermsOfUseScreen from '../screens/TermsOfUseScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import PopularCategoriesScreen from '../screens/Food/PopularCategoriesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const FoodTabNavigator = () => {
  const {theme} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7B2533',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -5},
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          color: theme.textColor, // Dynamic text color
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={FoodHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <Icon name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <Icon name="heart" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="user" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const MedicineTabNavigator = () => {
  const {theme} = useTheme(); // Use theme

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7B2533',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.backgroundColor,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -5},
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          color: theme.textColor,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={MedicineHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <Icon name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => <Icon name="user" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {isLoggedIn} = useAuth();
  const {theme} = useTheme();

  return (
    <>
      <StatusBar
        backgroundColor={theme.statusBarBackground}
        barStyle={theme.statusBarStyle}
      />
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
            <Stack.Screen
              name="BusinessDetails"
              component={BusinessDetailsScreen}
            />
            <Stack.Screen
              name="BussinessPhotos"
              component={BussinessPhotosScreen}
            />
            <Stack.Screen
              name="SelectCategory"
              component={SelectCategoryScreen}
            />
            <Stack.Screen name="TakePhoto" component={TakePhotoScreen} />
            <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="FoodTab" component={FoodTabNavigator} />
            <Stack.Screen name="MedicineTab" component={MedicineTabNavigator} />
            <Stack.Screen
              name="BusinessDetails"
              component={BusinessDetailsScreen}
            />
            <Stack.Screen
              name="BussinessPhotos"
              component={BussinessPhotosScreen}
            />
            <Stack.Screen name="TakePhoto" component={TakePhotoScreen} />
            <Stack.Screen name="SetupAccount" component={SetupAccountScreen} />
            <Stack.Screen name="ShopKYC" component={ShopKYCScreen} />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
            />
            <Stack.Screen
              name="SelectCategory"
              component={SelectCategoryScreen}
            />
            <Stack.Screen
              name="ExpirySupport"
              component={ExpirySupportScreen}
            />
            <Stack.Screen
              name="TargetSchemes"
              component={TargetSchemesScreen}
            />
            <Stack.Screen name="Returns" component={ReturnsScreen} />
            <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
            <Stack.Screen
              name="EditUserDetails"
              component={EditUserDetailsScreen}
            />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen
              name="EditBusinessDetails"
              component={EditBusinessDetailsScreen}
            />
            <Stack.Screen
              name="EditAddresses"
              component={EditAddressesScreen}
            />
            <Stack.Screen
              name="ManageBankAccount"
              component={ManageBankAccountScreen}
            />
            <Stack.Screen
              name="LanguagePreference"
              component={LanguagePreferenceScreen}
            />
            <Stack.Screen name="ManageTeam" component={ManageTeamScreen} />
            <Stack.Screen name="Policies" component={PoliciesScreen} />
            <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
            <Stack.Screen name="NewAddress" component={NewAddressScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
            />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="PopularCategories" component={PopularCategoriesScreen} />
            {/* SpecialOffers placeholder — uses CategoryScreen until a dedicated screen is built */}
            <Stack.Screen name="SpecialOffers" component={CategoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
