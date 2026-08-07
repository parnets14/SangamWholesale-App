import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../config/api';

const CartContext = createContext();
const CART_STORAGE_KEY = 'cart_items';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({children, token}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await fetch(ENDPOINTS.CART, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.cart)) {
          const items = data.cart
            .filter(item => item.product)
            .map(item => ({
              ...item.product,
              quantity: item.quantity,
            }));
          setCartItems(items);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
          return;
        }
      } catch (e) {
        console.warn('[CartContext] API load failed, falling back to storage', e);
      } finally {
        setLoading(false);
      }
    }
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) setCartItems(JSON.parse(stored));
    } catch (e) {
      console.warn('[CartContext] AsyncStorage load failed', e);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)).catch(() => {});
  }, [cartItems]);

  const addToCart = async product => {
    const qty = product.quantity || 1;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? {...item, quantity: item.quantity + qty}
            : item,
        );
      }
      return [...prevItems, {...product, quantity: qty}];
    });

    if (token) {
      try {
        await fetch(ENDPOINTS.CART, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({productId: product._id, quantity: qty}),
        });
      } catch (e) {
        console.warn('[CartContext] addToCart API failed', e);
      }
    }
  };

  const removeFromCart = async productId => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));

    if (token) {
      try {
        await fetch(`${ENDPOINTS.CART}/${productId}`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        });
      } catch (e) {
        console.warn('[CartContext] removeFromCart API failed', e);
      }
    }
  };

  const updateQuantity = async (productId, change) => {
    let newQty = 1;
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item._id === productId) {
          newQty = Math.max(1, item.quantity + change);
          return {...item, quantity: newQty};
        }
        return item;
      }),
    );

    if (token) {
      try {
        await fetch(`${ENDPOINTS.CART}/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({quantity: newQty}),
        });
      } catch (e) {
        console.warn('[CartContext] updateQuantity API failed', e);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);

    if (token) {
      try {
        await fetch(`${ENDPOINTS.CART}/clear`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        });
      } catch (e) {
        console.warn('[CartContext] clearCart API failed', e);
      }
    }
  };

  const getTotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total +
        (parseInt((item.price + '').replace('₹', '').replace(',', '')) || 0) *
          item.quantity,
      0,
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        refreshCart: loadCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
