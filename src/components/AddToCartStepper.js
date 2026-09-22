/**
 * AddToCartStepper
 *
 * Shows "ADD" button when qty === 0.
 * Transitions to  [−]  qty  [+]  inline stepper when qty > 0.
 * Pressing [−] on qty 1 removes the item from cart.
 *
 * Props
 *   productId    string
 *   stock        number   (max qty)
 *   size         'sm' | 'md'  (default 'md')
 */
import React, {useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useCart} from '../context/CartContext';

const AddToCartStepper = ({product, size = 'md', onFirstAdd}) => {
  const {addToCart, removeFromCart, updateQuantity, getCartQuantity} = useCart();
  const qty = getCartQuantity(product._id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pop = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {toValue: 0.88, duration: 80, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, friction: 4, useNativeDriver: true}),
    ]).start();
  };

  const handleAdd = () => {
    pop();
    addToCart({...product, quantity: 1});
    if (onFirstAdd) onFirstAdd();
  };

  const handleIncrease = () => {
    pop();
    if (qty < (product.stock || 99)) {
      updateQuantity(product._id, 1);
    }
  };

  const handleDecrease = () => {
    pop();
    if (qty <= 1) {
      removeFromCart(product._id);
    } else {
      updateQuantity(product._id, -1);
    }
  };

  const sm = size === 'sm';

  if (qty === 0) {
    return (
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <TouchableOpacity
          style={[styles.addBtn, sm && styles.addBtnSm]}
          onPress={handleAdd}
          activeOpacity={0.8}>
          <Icon name="plus" size={sm ? 12 : 14} color="#fff" />
          <Text style={[styles.addBtnText, sm && styles.addBtnTextSm]}>ADD</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.stepper, sm && styles.stepperSm, {transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        style={[styles.stepBtn, sm && styles.stepBtnSm]}
        onPress={handleDecrease}
        activeOpacity={0.7}
        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
        <Icon name={qty === 1 ? 'trash-2' : 'minus'} size={sm ? 11 : 13} color="#7B2533" />
      </TouchableOpacity>

      <Text style={[styles.qtyText, sm && styles.qtyTextSm]}>{qty}</Text>

      <TouchableOpacity
        style={[styles.stepBtn, sm && styles.stepBtnSm]}
        onPress={handleIncrease}
        activeOpacity={0.7}
        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
        <Icon name="plus" size={sm ? 11 : 13} color="#7B2533" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  /* ADD button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    elevation: 3,
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  addBtnSm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  addBtnTextSm: {
    fontSize: 11,
    marginLeft: 3,
  },

  /* stepper */
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#7B2533',
    borderRadius: 22,
    paddingHorizontal: 4,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  stepperSm: {
    borderRadius: 14,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5e8ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnSm: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  qtyText: {
    color: '#7B2533',
    fontSize: 15,
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
  },
  qtyTextSm: {
    fontSize: 12,
    minWidth: 20,
  },
});

export default AddToCartStepper;
