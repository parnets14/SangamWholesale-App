import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../config/api';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'wishlist_items';

export const WishlistProvider = ({children, token}) => {
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist — from API if logged in, else from AsyncStorage
  const loadWishlist = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const res = await fetch(ENDPOINTS.WISHLIST, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.wishlist)) {
          // Backend returns populated Product objects or ObjectId strings
          const ids = data.wishlist.map(p =>
            typeof p === 'object' ? p._id : p,
          );
          const newSet = new Set(ids);
          setWishlist(newSet);
          await AsyncStorage.setItem(
            WISHLIST_STORAGE_KEY,
            JSON.stringify([...newSet]),
          );
          return;
        }
      } catch (e) {
        console.warn('[WishlistContext] API load failed, falling back to storage', e);
      } finally {
        setLoading(false);
      }
    }
    // Fallback: load from AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) setWishlist(new Set(JSON.parse(stored)));
    } catch (e) {
      console.warn('[WishlistContext] AsyncStorage load failed', e);
    }
  }, [token]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Persist locally whenever wishlist changes
  useEffect(() => {
    AsyncStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify([...wishlist]),
    ).catch(() => {});
  }, [wishlist]);

  const addToWishlist = async productId => {
    setWishlist(prev => new Set(prev).add(productId));

    if (token) {
      try {
        await fetch(ENDPOINTS.WISHLIST, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({productId}),
        });
      } catch (e) {
        console.warn('[WishlistContext] addToWishlist API failed', e);
      }
    }
  };

  const removeFromWishlist = async productId => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      newWishlist.delete(productId);
      return newWishlist;
    });

    if (token) {
      try {
        await fetch(`${ENDPOINTS.WISHLIST}/${productId}`, {
          method: 'DELETE',
          headers: {Authorization: `Bearer ${token}`},
        });
      } catch (e) {
        console.warn('[WishlistContext] removeFromWishlist API failed', e);
      }
    }
  };

  const toggleWishlist = async productId => {
    if (wishlist.has(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isWishlisted = productId => wishlist.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: loadWishlist,
      }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
