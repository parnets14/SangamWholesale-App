/**
 * CartToast — Zepto / Blinkit style "Added to cart" snackbar.
 *
 * • Slides up from just above the bottom action bar
 * • Shows product thumb + name + price
 * • "View Cart" button pulses to draw attention
 * • Auto-dismisses after 3.5 s
 * • Tapping "View Cart" collapses it then navigates
 *
 * Props
 *   visible      boolean
 *   product      { name, image, price, quantity, unit }
 *   cartCount    number   – total items in cart (for badge)
 *   onViewCart   () => void
 *   onDismiss    () => void
 *   bottomOffset number   – extra px above the action bar (default 80)
 */
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CartToast = ({
  visible,
  product,
  cartCount = 0,
  onViewCart,
  onDismiss,
  bottomOffset = 80,
}) => {
  const translateY = useRef(new Animated.Value(140)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const pulse      = useRef(new Animated.Value(1)).current;
  const timer      = useRef(null);
  const pulseLoop  = useRef(null);

  const dismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    if (pulseLoop.current) pulseLoop.current.stop();
    Animated.parallel([
      Animated.timing(translateY, {toValue: 140, duration: 280, useNativeDriver: true}),
      Animated.timing(opacity,    {toValue: 0,   duration: 240, useNativeDriver: true}),
    ]).start(() => onDismiss && onDismiss());
  };

  useEffect(() => {
    if (visible) {
      // slide up + fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // pulse the button
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {toValue: 0.6, duration: 600, useNativeDriver: true}),
          Animated.timing(pulse, {toValue: 1,   duration: 600, useNativeDriver: true}),
        ]),
      );
      pulseLoop.current.start();

      // auto-dismiss
      timer.current = setTimeout(dismiss, 3500);
    } else {
      dismiss();
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (pulseLoop.current) pulseLoop.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible && !product) return null;

  const imageUri = product?.image
    ? `https://sangamwholesale.com/products/${product.image}`
    : null;

  const handleViewCart = () => {
    if (timer.current) clearTimeout(timer.current);
    if (pulseLoop.current) pulseLoop.current.stop();
    Animated.parallel([
      Animated.timing(translateY, {toValue: 140, duration: 250, useNativeDriver: true}),
      Animated.timing(opacity,    {toValue: 0,   duration: 200, useNativeDriver: true}),
    ]).start(() => onViewCart && onViewCart());
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {bottom: bottomOffset, opacity, transform: [{translateY}]},
      ]}
      pointerEvents="box-none">
      {/* card */}
      <View style={styles.card}>
        {/* green strip on left */}
        <View style={styles.greenStrip} />

        {/* product thumb */}
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Icon name="package" size={20} color="#7B2533" />
          </View>
        )}

        {/* text */}
        <View style={styles.textBlock}>
          <View style={styles.topRow}>
            <Icon name="check-circle" size={12} color="#22c55e" />
            <Text style={styles.addedLabel}>  Added to cart</Text>
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {product?.name}
          </Text>
          <Text style={styles.meta}>
            {'\u20B9'}{product?.price}
            {product?.unit ? `  ·  ${product.quantity} ${product.unit}` : ''}
          </Text>
        </View>

        {/* View Cart button */}
        <Animated.View style={{opacity: pulse}}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={handleViewCart}
            activeOpacity={0.85}>
            <Icon name="shopping-cart" size={14} color="#fff" />
            <Text style={styles.viewBtnText}>View Cart</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 9999,
    elevation: 20,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 18,
  },
  greenStrip: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#22c55e',
    borderRadius: 2,
    marginRight: 10,
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#2c2c2e',
    marginRight: 10,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addedLabel: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  productName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  meta: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'relative',
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#22c55e',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#1c1c1e',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
});

export default CartToast;
