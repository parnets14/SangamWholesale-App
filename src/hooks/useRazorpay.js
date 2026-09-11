import {useCallback} from 'react';
import {Alert} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {RAZORPAY_KEY_ID, ENDPOINTS} from '../config/api';

/**
 * useRazorpay (React Native)
 *
 * Returns an `openRazorpay` function. Call it with:
 * {
 *   amount,          — total in RUPEES (e.g. 499.18)
 *   user,            — { fullName, phone, email } from AuthContext
 *   token,           — JWT for API calls
 *   onSuccess,       — async (paymentResult) => void  — called after verified
 *   onFailure,       — (error) => void                — called on error/cancel
 * }
 */
const useRazorpay = () => {
  const openRazorpay = useCallback(
    async ({amount, user, token, onSuccess, onFailure}) => {
      // ── 1. Create Razorpay order on the backend ──────────────────────────
      let razorpayOrder;
      try {
        const res = await fetch(ENDPOINTS.PAYMENTS_CREATE_ORDER, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
          },
          // amount in rupees — backend converts to paise
          body: JSON.stringify({amount}),
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert(
            'Payment Error',
            data.message || 'Could not create payment order.',
          );
          onFailure && onFailure(new Error(data.message));
          return;
        }

        razorpayOrder = data; // { order_id, amount (paise), currency }
      } catch (err) {
        Alert.alert(
          'Network Error',
          'Could not reach payment server. Please try again.',
        );
        onFailure && onFailure(err);
        return;
      }

      // ── 2. Open Razorpay checkout ─────────────────────────────────────────
      const options = {
        description: 'Order Payment',
        image: 'https://sangamwholesale.com/sangamwholesale.png',
        currency: razorpayOrder.currency || 'INR',
        key: RAZORPAY_KEY_ID,
        amount: String(razorpayOrder.amount), // paise, as returned by backend
        order_id: razorpayOrder.order_id,
        name: 'Sangam Wholesale',
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.fullName || '',
        },
        theme: {color: '#7B2533'},
      };

      try {
        const paymentData = await RazorpayCheckout.open(options);
        // paymentData: { razorpay_payment_id, razorpay_order_id, razorpay_signature }

        // ── 3. Verify payment signature on the backend ──────────────────────
        const verifyRes = await fetch(ENDPOINTS.PAYMENTS_VERIFY, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
          },
          body: JSON.stringify({
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.success) {
          Alert.alert(
            'Verification Failed',
            'Payment could not be verified. Please contact support.',
          );
          onFailure && onFailure(new Error('Signature mismatch'));
          return;
        }

        // All good — hand back payment IDs to the caller
        onSuccess && onSuccess(paymentData);
      } catch (err) {
        // RazorpayCheckout.open rejects with { code, description } on cancel/failure
        if (err?.code) {
          // User cancelled or payment failed inside Razorpay SDK
          const reason = err.description || 'Payment was cancelled.';
          if (err.code !== 0) {
            // code 0 == user dismissed; anything else is a real failure
            Alert.alert('Payment Failed', reason);
          }
          onFailure && onFailure(new Error(reason));
        } else {
          Alert.alert(
            'Payment Error',
            'Something went wrong during payment. Please try again.',
          );
          onFailure && onFailure(err);
        }
      }
    },
    [],
  );

  return {openRazorpay};
};

export default useRazorpay;
