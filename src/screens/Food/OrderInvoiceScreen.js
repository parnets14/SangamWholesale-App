import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';

const BRAND_COLOR = '#702834';

const SELLER = {
  name: 'SANGAM WHOLESALE PVT. LTD.',
  address:
    'Shop No:2, 1st Floor, Umapathi Building,\n9th Main Road, Weavers Colony,\nAnekal, Bengaluru – 562106',
  gstin: '29ABUCS3779C1ZM',
  cin: 'U46901KA2026PTC224184',
};

const DELIVERY_STATUS = {
  placed: 'Processing',
  accepted: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  undelivered: 'Undelivered',
};

const OrderInvoiceScreen = ({navigation, route}) => {
  const {theme} = useTheme();

  // order object passed from CheckoutScreen or DeliveriesScreen
  const {order} = route.params;
  // fromDeliveries flag lets the back button go back instead of to FoodTab
  const fromDeliveries = route.params?.fromDeliveries ?? false;

  const items = order.items || [];
  const subtotal =
    order.subtotal ??
    items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  const discount = order.discount ?? 0;
  const gst = order.gst ?? 0;
  const total = order.total ?? subtotal + gst;

  const statusLabel =
    DELIVERY_STATUS[order.deliveryStatus || 'placed'] || 'Processing';

  const paymentLabel =
    order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod;

  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const buildTextInvoice = () => {
    const itemLines = items
      .map(
        (it, i) =>
          `${i + 1}. ${it.name}  x${it.quantity}  Rs.${(it.price || 0) * (it.quantity || 1)}`,
      )
      .join('\n');

    return (
      `INVOICE — ${order.orderId}\n` +
      `Date: ${invoiceDate}\n\n` +
      `FROM:\n` +
      `${SELLER.name}\n` +
      `${SELLER.address}\n` +
      `GSTIN: ${SELLER.gstin}\n` +
      `CIN: ${SELLER.cin}\n` +
      `${'─'.repeat(40)}\n` +
      `ITEMS:\n${itemLines}\n` +
      `${'─'.repeat(40)}\n` +
      `Subtotal : Rs.${subtotal}\n` +
      (discount > 0 ? `Discount : -Rs.${discount}\n` : '') +
      `GST      : Rs.${gst}\n` +
      `TOTAL    : Rs.${total}\n` +
      `${'─'.repeat(40)}\n` +
      `Payment  : ${paymentLabel}\n` +
      `Status   : ${statusLabel}\n` +
      `Delivery : ${order.deliveryAddress || ''}\n\n` +
      `Thank you for your business!\n` +
      `${SELLER.name} — Computer generated invoice.`
    );
  };

  const handleDownload = async () => {
    const text = buildTextInvoice();
    try {
      await Share.share(
        {
          message: text,
          title: `Invoice_${order.orderId}`,
        },
        {dialogTitle: 'Save / Share Invoice'},
      );
    } catch (_) {}
  };

  const handleShare = async () => {
    await handleDownload();
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: BRAND_COLOR}]}>
        <TouchableOpacity
          onPress={() => {
            if (fromDeliveries) {
              navigation.goBack();
            } else {
              navigation.navigate('FoodTab', {
                screen: 'Cart',
                params: {lastOrder: order},
              });
            }
          }}
          style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Invoice card */}
        <View style={[styles.card, {backgroundColor: theme.cardBackground || '#fff'}]}>

          {/* Brand + invoice meta */}
          <View style={styles.invoiceTopRow}>
            <View>
              <Text style={styles.brandName}>Sangam Wholesale</Text>
              <Text style={styles.taxLabel}>Tax Invoice</Text>
            </View>
            <View style={styles.invoiceMetaRight}>
              <Text style={styles.invoiceWord}>INVOICE</Text>
              <Text style={styles.orderId}>#{order.orderId}</Text>
              <Text style={styles.invoiceDate}>{invoiceDate}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* From / Bill To */}
          <View style={styles.fromToRow}>
            {/* From — seller */}
            <View style={styles.fromToBlock}>
              <Text style={styles.fromToLabel}>FROM</Text>
              <Text style={styles.fromToName}>{SELLER.name}</Text>
              <Text style={styles.fromToDetail}>{SELLER.address}</Text>
              <Text style={styles.fromToDetail}>
                <Text style={styles.fromToMuted}>GSTIN: </Text>
                {SELLER.gstin}
              </Text>
              <Text style={styles.fromToDetail}>
                <Text style={styles.fromToMuted}>CIN: </Text>
                {SELLER.cin}
              </Text>
            </View>

            {/* Bill To — buyer */}
            <View style={styles.fromToBlock}>
              <Text style={styles.fromToLabel}>BILL TO</Text>
              <Text style={styles.fromToName}>
                {order.addressName || order.customerName || '—'}
              </Text>
              {order.addressContact ? (
                <Text style={styles.fromToDetail}>{order.addressContact}</Text>
              ) : null}
              {order.customerGstin ? (
                <Text style={styles.fromToDetail}>
                  <Text style={styles.fromToMuted}>GSTIN: </Text>
                  {order.customerGstin}
                </Text>
              ) : null}
              {order.deliveryAddress ? (
                <Text style={styles.fromToDetail}>{order.deliveryAddress}</Text>
              ) : null}
            </View>
          </View>

          {/* Meta strip: date / status / payment */}
          <View style={styles.metaStrip}>
            <View style={styles.metaCell}>
              <Text style={styles.metaKey}>Invoice Date</Text>
              <Text style={styles.metaVal}>{invoiceDate}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaKey}>Status</Text>
              <Text style={[styles.metaVal, {color: BRAND_COLOR}]}>
                {statusLabel}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaKey}>Payment</Text>
              <Text style={styles.metaVal}>{paymentLabel}</Text>
            </View>
          </View>

          {/* Items table header */}
          <View style={[styles.tableHeader, {borderBottomColor: BRAND_COLOR}]}>
            <Text style={[styles.colHash, styles.colHead]}>#</Text>
            <Text style={[styles.colItem, styles.colHead]}>ITEM</Text>
            <Text style={[styles.colQty, styles.colHead]}>QTY</Text>
            <Text style={[styles.colPrice, styles.colHead]}>PRICE</Text>
            <Text style={[styles.colAmt, styles.colHead]}>AMOUNT</Text>
          </View>

          {/* Items rows */}
          {items.map((it, i) => (
            <View
              key={it._id || i}
              style={[
                styles.tableRow,
                i % 2 === 1 && styles.tableRowAlt,
              ]}>
              <Text style={[styles.colHash, styles.colCell]}>{i + 1}</Text>
              <View style={styles.colItem}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {it.name}
                </Text>
              </View>
              <Text style={[styles.colQty, styles.colCell]}>{it.quantity}</Text>
              <Text style={[styles.colPrice, styles.colCell]}>₹{it.price}</Text>
              <Text style={[styles.colAmt, styles.colCell]}>
                ₹{(it.price || 0) * (it.quantity || 1)}
              </Text>
            </View>
          ))}

          {/* Totals block */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>₹{subtotal}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalVal, {color: '#16a34a'}]}>
                  -₹{discount}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST</Text>
              <Text style={styles.totalVal}>₹{gst}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={[styles.grandTotalVal, {color: BRAND_COLOR}]}>
                ₹{total}
              </Text>
            </View>
          </View>

          {/* Notes */}
          {order.orderNotes ? (
            <View style={styles.notesBlock}>
              <Text style={styles.notesText}>
                <Text style={styles.notesBold}>Note: </Text>
                {order.orderNotes}
              </Text>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerMain}>Thank you for your business!</Text>
            <Text style={styles.footerSub}>
              {SELLER.name} · GSTIN: {SELLER.gstin}
            </Text>
            <Text style={styles.footerSub}>
              This is a computer-generated invoice.
            </Text>
          </View>
        </View>

        {/* Download Invoice button */}
        <TouchableOpacity
          style={[styles.downloadBtn, {backgroundColor: BRAND_COLOR}]}
          onPress={handleDownload}
          activeOpacity={0.85}>
          <Icon name="download" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>Download Invoice</Text>
        </TouchableOpacity>

        {/* Continue shopping / back button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => {
            if (fromDeliveries) {
              navigation.goBack();
            } else {
              navigation.navigate('FoodTab', {
                screen: 'Cart',
                params: {lastOrder: order},
              });
            }
          }}>
          <Icon
            name={fromDeliveries ? 'arrow-left' : 'shopping-bag'}
            size={18}
            color={BRAND_COLOR}
          />
          <Text style={styles.ctaBtnText}>
            {fromDeliveries ? 'Back to Deliveries' : 'Continue Shopping'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {padding: 4, width: 30},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  scroll: {padding: 16, paddingBottom: 32},

  // Card
  card: {
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },

  // Brand + meta top row
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: BRAND_COLOR,
  },
  taxLabel: {fontSize: 11, color: '#9ca3af', marginTop: 2},
  invoiceMetaRight: {alignItems: 'flex-end'},
  invoiceWord: {fontSize: 13, fontWeight: '700', color: '#374151'},
  orderId: {fontSize: 13, color: '#6b7280', marginTop: 1},
  invoiceDate: {fontSize: 11, color: '#9ca3af', marginTop: 1},

  divider: {height: 2, backgroundColor: BRAND_COLOR, marginBottom: 14},

  // From / To
  fromToRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  fromToBlock: {flex: 1},
  fromToLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#9ca3af',
    marginBottom: 4,
  },
  fromToName: {fontSize: 13, fontWeight: '700', color: '#1f2937'},
  fromToDetail: {fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 16},
  fromToMuted: {color: '#9ca3af'},

  // Meta strip
  metaStrip: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 4,
  },
  metaCell: {flex: 1},
  metaKey: {fontSize: 10, color: '#9ca3af'},
  metaVal: {fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 2},

  // Table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    paddingBottom: 6,
    marginBottom: 4,
  },
  colHead: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {backgroundColor: '#fafafa'},
  colCell: {fontSize: 12, color: '#374151'},

  // Column widths
  colHash: {width: 22, textAlign: 'left'},
  colItem: {flex: 1, paddingRight: 4},
  colQty: {width: 34, textAlign: 'right'},
  colPrice: {width: 52, textAlign: 'right'},
  colAmt: {width: 60, textAlign: 'right', fontWeight: '600'},
  itemName: {fontSize: 12, color: '#1f2937'},

  // Totals
  totalsBlock: {
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 4,
  },
  totalLabel: {fontSize: 13, color: '#6b7280'},
  totalVal: {fontSize: 13, color: '#374151'},
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
    marginTop: 2,
  },
  grandTotalLabel: {fontSize: 15, fontWeight: '700', color: '#1f2937'},
  grandTotalVal: {fontSize: 15, fontWeight: '800'},

  // Notes
  notesBlock: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  notesText: {fontSize: 12, color: '#92400e', lineHeight: 18},
  notesBold: {fontWeight: '700'},

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerMain: {fontSize: 13, fontWeight: '600', color: '#374151'},
  footerSub: {fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'center'},

  // Download + CTA
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  downloadBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND_COLOR,
    backgroundColor: '#fff',
  },
  ctaBtnText: {color: BRAND_COLOR, fontSize: 15, fontWeight: '700'},
});

export default OrderInvoiceScreen;
