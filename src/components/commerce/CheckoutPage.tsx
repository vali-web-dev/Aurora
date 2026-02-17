'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/aurora/Form';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { useCartStore, type CartLine } from '@/lib/commerce/cart-store';
import { useAddressStore, type SavedAddress } from '@/lib/commerce/use-address-store';
import { useProfileStore } from '@/lib/commerce/profile-store';
import { usePaymentStore } from '@/lib/commerce/payment-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import type { Order, Address, Product, OrderItem } from '@/data/types';
import { buildTextReceipt } from '@/components/commerce/ReceiptTemplate';
import { AuroraDataService } from '@/data/types';

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const steps = [
  { title: 'Address', description: 'Delivery details and contact info.' },
  { title: 'Payment', description: 'Select a payment method.' },
  { title: 'Confirm', description: 'Review and place the order.' },
];

const trackingSteps = [
  { title: 'Order confirmed', detail: 'Payment verified and order created.' },
  { title: 'Packed', detail: 'Items are being prepared by providers.' },
  { title: 'In transit', detail: 'Shipment is on the way to your address.' },
  { title: 'Out for delivery', detail: 'Carrier is delivering today.' },
  { title: 'Delivered', detail: 'Package delivered to your doorstep.' },
];

const paymentLabels: Record<string, string> = {
  card: 'Card ending in 4242',
  wallet: 'Aurora Wallet',
  bank: 'Bank transfer',
};

const formatProvider = (providerId: string) =>
  providerId.charAt(0).toUpperCase() + providerId.slice(1);

const shippingWindows: Record<string, { min: number; max: number }> = {
  amazon: { min: 2, max: 4 },
  shopify: { min: 3, max: 6 },
  etsy: { min: 4, max: 8 },
  walmart: { min: 3, max: 5 },
  bestbuy: { min: 2, max: 5 },
};

const getShippingWindow = (providerId: string) =>
  shippingWindows[providerId] ?? { min: 3, max: 7 };

const getDeliveryWindow = (lines: CartLine[]) => {
  if (lines.length === 0) return null;
  return lines.reduce<{ min: number; max: number }>(
    (acc: { min: number; max: number }, line: CartLine) => {
      const window = getShippingWindow(line.product.providerId);
      return {
        min: Math.min(acc.min, window.min),
        max: Math.max(acc.max, window.max),
      };
    },
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );
};

export function CheckoutPage() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { items, itemCount, subtotal, tax, total, clearCart } = useCartStore();
  const { addresses, addAddress, getDefaultAddress, setDefaultAddress } = useAddressStore();
  const { payments, getDefaultPayment } = usePaymentStore();
  const { addOrder } = useOrderStore();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [mockOrder, setMockOrder] = useState<Order | null>(null);
  const [receiptMethod, setReceiptMethod] = useState('card');
  const timerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formCountry, setFormCountry] = useState('ca');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const deliveryWindow = getDeliveryWindow(items);
  const providerReceipts = items.reduce<Record<string, { items: CartLine[]; total: number }>>(
    (acc: Record<string, { items: CartLine[]; total: number }>, line: CartLine) => {
      const key = line.product.providerId;
      if (!acc[key]) {
        acc[key] = { items: [], total: 0 };
      }
      acc[key].items.push(line);
      acc[key].total += line.product.priceCents * line.quantity;
      return acc;
    },
    {}
  );

  useEffect(() => {
    if (!profile) {
      router.replace('/commerce/delivery');
    }
  }, [profile, router]);

  // Initialize form fields from profile once
  useEffect(() => {
    if (profile && !hasInitialized) {
      setFormName(profile.fullName);
      setFormEmail(profile.email);
      
      // Initialize with default saved address
      const defaultAddr = getDefaultAddress();
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
      
      // Initialize with default payment
      const defaultPayment = getDefaultPayment();
      if (defaultPayment) {
        setSelectedPaymentId(defaultPayment.id);
      }
      
      setHasInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, hasInitialized]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const pushNotice = (message: string, tone: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotice({ message, tone });
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 2600);
  };

  const getSelectedAddress = (): Address => {
    if (useNewAddress || addresses.length === 0) {
      return {
        name: formName,
        street: formStreet,
        city: formCity,
        province: formProvince,
        zip: formPostalCode,
        country: formCountry,
      };
    }
    const addr = addresses.find((a) => a.id === selectedAddressId);
    if (addr) {
      return {
        name: addr.name,
        street: addr.street,
        city: addr.city,
        province: addr.province,
        zip: addr.zip,
        country: addr.country,
      };
    }
    return {
      name: '',
      street: '',
      city: '',
      province: '',
      zip: '',
      country: formCountry,
    };
  };

  const buildMockOrder = (): Order => {
    const now = new Date();
    const selectedAddr = getSelectedAddress();
    const selectedPayment = payments.find(p => p.id === selectedPaymentId) || getDefaultPayment();

    return {
      id: `AUR-${Date.now().toString(36).toUpperCase()}`,
      userId: 'user-1',
      cartItems: items.map((line: CartLine) => ({
        productId: line.product.id,
        quantity: line.quantity,
        unitPriceCents: line.product.priceCents,
        sellerId: `seller-${line.product.providerId}-1`,
        sellerName: formatProvider(line.product.providerId),
        asin: `B0${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      })),
      invoiceNumber: `CA${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      invoiceDate: now,
      shipmentNumber: Math.random().toString().slice(2, 18),
      shipmentDate: now,
      subtotalCents: items.reduce((sum: number, line: CartLine) => sum + line.product.priceCents * line.quantity, 0),
      discountCents: 0,
      taxFederalCents: Math.round(subtotal * 0.05),
      taxProvincialCents: Math.round(subtotal * 0.08),
      totalCents: total,
      shippingCostCents: 0,
      shippingDiscount: 0,
      currency: 'USD',
      status: 'processing',
      billingAddress: selectedAddr,
      shippingAddress: selectedAddr,
      paymentMethod: (selectedPayment?.type || 'card') as 'card' | 'wallet' | 'bank',
      createdAt: now,
    };
  };

  const handlePlaceOrder = () => {
    // Validate address
    const addr = getSelectedAddress();
    if (!addr.name || !addr.street || !addr.city || !addr.province || !addr.zip) {
      pushNotice('Please complete your address information.', 'error');
      return;
    }

    // Validate payment selection
    if (!selectedPaymentId && payments.length > 0) {
      pushNotice('Please select a payment method.', 'error');
      return;
    }

    if (payments.length === 0) {
      pushNotice('Please add a payment method in your delivery profile.', 'error');
      return;
    }

    if (items.length === 0 || paymentStatus === 'processing') return;

    if (!window.confirm('Place this order now?')) {
      pushNotice('Order placement canceled.', 'info');
      return;
    }

    // Save address if the user opts in or if no address exists yet
    if (saveAddressForFuture && (useNewAddress || addresses.length === 0)) {
      const label = addressLabel.trim() || 'Primary';
      addAddress(addr, label, addresses.length === 0);
      pushNotice('Address saved for future orders.', 'success');
    }

    setPaymentStatus('processing');
    const selectedPayment = payments.find(p => p.id === selectedPaymentId);
    timerRef.current = window.setTimeout(() => {
      setReceiptMethod(selectedPayment?.type || 'card');
      const order = buildMockOrder();
      setMockOrder(order);
      setOrderId(order.id);
      // Save order to persistent storage
      addOrder(order);
      setPaymentStatus('success');
      clearCart();
      pushNotice('Order placed successfully.', 'success');
    }, 800);
  };

  const buildReceiptText = () => {
    if (!mockOrder) return '';
    const products = new Map(AuroraDataService.getProducts().map((p: Product) => [p.id, p]));
    return buildTextReceipt(mockOrder, products);
  };

  const handleDownloadReceipt = () => {
    if (paymentStatus !== 'success' || !mockOrder) {
      pushNotice('Receipt is not ready yet.', 'error');
      return;
    }
    const content = buildReceiptText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurora-receipt-${mockOrder.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    pushNotice('Receipt downloaded.', 'success');
  };

  const handlePrintReceipt = () => {
    if (paymentStatus !== 'success' || !mockOrder) {
      pushNotice('Receipt is not ready yet.', 'error');
      return;
    }
    const products = new Map(AuroraDataService.getProducts().map((p: Product) => [p.id, p]));
    const { buildHtmlReceipt } = require('@/components/commerce/ReceiptTemplate');
    const htmlContent = buildHtmlReceipt(mockOrder, products);
    const popup = window.open('', 'aurora-receipt', 'width=900,height=1000');
    if (!popup) return;
    popup.document.write(htmlContent);
    popup.document.close();
    popup.focus();
    popup.print();
    pushNotice('Receipt opened for printing.', 'success');
  };

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Checkout"
        description="A unified checkout for every provider in your cart."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm" variant={itemCount > 0 ? 'info' : 'default'}>
              Items: {itemCount}
            </Badge>
            <Link href="/commerce/cart">
              <Button variant="secondary">Back to Cart</Button>
            </Link>
          </div>
        }
      />

      <SurfaceSection title="Progress">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step: { title: string; description: string }, index: number) => (
            <Card key={step.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>{step.title}</CardTitle>
                <Badge size="sm" variant={index === 0 ? 'info' : 'default'}>
                  Step {index + 1}
                </Badge>
              </div>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Delivery Details">
        <div className="space-y-4">
          {addresses.length > 0 && !useNewAddress && (
            <Card className="space-y-3 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
              <p className="aurora-label text-slate-900 dark:text-slate-50">Saved Addresses</p>
              <div className="space-y-2">
                {addresses.map((addr: SavedAddress) => (
                  <div key={addr.id} className="flex items-start gap-3 rounded border border-slate-200 p-3 dark:border-slate-700">
                    <input
                      type="radio"
                      name="saved-address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value as string)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="aurora-label text-sm font-medium text-slate-900 dark:text-slate-50">{addr.label}</p>
                      <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                        {addr.name} • {addr.street}, {addr.city} {addr.province} {addr.zip}
                      </p>
                      {addr.isDefault && (
                        <Badge size="sm" variant="default" className="mt-1">Default</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUseNewAddress(true);
                  setFormName('');
                  setFormEmail('');
                  setFormStreet('');
                  setFormCity('');
                  setFormProvince('');
                  setFormPostalCode('');
                  setAddressLabel('');
                }}
              >
                Use Different Address
              </Button>
            </Card>
          )}

          {(useNewAddress || addresses.length === 0) && (
            <Card className="space-y-4">
              {addresses.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setUseNewAddress(false)}
                >
                  ← Back to Saved Addresses
                </Button>
              )}
              <p className="aurora-label text-slate-900 dark:text-slate-50">
                {addresses.length === 0 ? 'Enter Your Address' : 'Enter a New Address'}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Ava Montgomery"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="ava@aurora.world"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Input
                  label="Address"
                  placeholder="742 Aurora Way"
                  className="md:col-span-2"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Input
                  label="City"
                  placeholder="San Francisco"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Input
                  label="Province/State"
                  placeholder="CA"
                  value={formProvince}
                  onChange={(e) => setFormProvince(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Input
                  label="Postal code"
                  placeholder="94103"
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  disabled={paymentStatus === 'success'}
                />
                <Select
                  label="Country"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  options={[
                    { value: 'us', label: 'United States' },
                    { value: 'ca', label: 'Canada' },
                    { value: 'uk', label: 'United Kingdom' },
                  ]}
                  disabled={paymentStatus === 'success'}
                />
              </div>

              <div className="rounded border border-slate-200 p-3 dark:border-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveAddressForFuture}
                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                    disabled={paymentStatus === 'success'}
                  />
                  <span className="aurora-label text-slate-600 dark:text-slate-400">
                    Save this address for future orders
                  </span>
                </label>
                {saveAddressForFuture && (
                  <Input
                    label="Address label"
                    placeholder="e.g., Home, Work, Primary"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    disabled={paymentStatus === 'success'}
                    className="mt-3"
                  />
                )}
              </div>
            </Card>
          )}
        </div>
      </SurfaceSection>

      <SurfaceSection title="Payment">
        {payments.length === 0 ? (
          <Card className="space-y-4">
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              No payment methods saved. Please add one in your{' '}
              <Link href="/commerce/delivery" className="aurora-label text-blue-600 hover:underline dark:text-blue-400">
                delivery profile
              </Link>
              .
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push('/commerce/delivery')}
            >
              Add Payment Method
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card
                key={payment.id}
                className={`cursor-pointer transition-colors ${
                  selectedPaymentId === payment.id
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  if (paymentStatus !== 'success') {
                    setSelectedPaymentId(payment.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPaymentId === payment.id}
                      onChange={() => setSelectedPaymentId(payment.id)}
                      disabled={paymentStatus === 'success'}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="aurora-label font-medium text-slate-900 dark:text-slate-50">
                          {payment.label}
                        </p>
                        {payment.isDefault && (
                          <Badge size="sm" variant="default">Default</Badge>
                        )}
                      </div>
                      <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                        {payment.type === 'card' && `${payment.cardBrand} •••• ${payment.cardLast4} (Exp: ${payment.cardExpiry})`}
                        {payment.type === 'wallet' && `${payment.walletProvider} - ${payment.walletEmail}`}
                        {payment.type === 'bank' && `${payment.bankName} •••• ${payment.bankAccountLast4}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Need a different payment method?{' '}
              <Link href="/commerce/delivery" className="aurora-label text-blue-600 hover:underline dark:text-blue-400">
                Add one in your profile
              </Link>
            </p>
          </div>
        )}
      </SurfaceSection>

      <SurfaceSection title="Confirmation">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 space-y-3">
            <CardTitle>Order Summary</CardTitle>
            <div className="space-y-2 text-sm">
              {items.length === 0 ? (
                <p className="aurora-label text-slate-600 dark:text-slate-400">No items in cart.</p>
              ) : (
                items.map((line: CartLine) => (
                  <div key={line.product.id} className="flex justify-between">
                    <span className="aurora-label text-slate-600 dark:text-slate-400">
                      {line.product.title} • {line.quantity}x
                    </span>
                    <span className="aurora-label text-slate-900 dark:text-slate-50">
                      {formatMoney(line.product.priceCents * line.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-200 pt-3 text-sm">
              {deliveryWindow && (
                <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery window</span>
                  <span>{deliveryWindow.min}-{deliveryWindow.max} days</span>
                </div>
              )}
              <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated tax</span>
                <span>{formatMoney(tax)}</span>
              </div>
              <div className="aurora-label flex justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <CardTitle>Place Order</CardTitle>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Confirm to send this order to providers.
            </p>
            {notice && (
              <InlineNotice message={notice.message} tone={notice.tone} />
            )}
            <Button
              variant="aurora"
              className="w-full"
              disabled={items.length === 0 || paymentStatus === 'processing' || paymentStatus === 'success'}
              onClick={handlePlaceOrder}
            >
              {paymentStatus === 'processing' ? 'Processing...' : paymentStatus === 'success' ? 'Order Placed' : 'Place Order'}
            </Button>
            <Link href="/commerce/review">
              <Button variant="outline" className="w-full" disabled={items.length === 0}>
                Review Priorities
              </Button>
            </Link>
          </Card>
        </div>
      </SurfaceSection>

      {paymentStatus === 'success' && (
        <SurfaceSection title="Order Confirmed" description="Your mock payment has been approved.">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm" variant="info">Payment Approved</Badge>
              {orderId && (
                <Badge size="sm" variant="default">Order {orderId}</Badge>
              )}
              {mockOrder && (
                <Badge size="sm" variant="default">Invoice {mockOrder.invoiceNumber}</Badge>
              )}
            </div>
            {mockOrder && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">Order Details</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      {(() => {
                        const payment = payments.find(p => p.id === selectedPaymentId);
                        if (!payment) return `Payment: ${receiptMethod}`;
                        if (payment.type === 'card') {
                          return `Payment: ${payment.cardBrand} •••• ${payment.cardLast4}`;
                        } else if (payment.type === 'wallet') {
                          return `Payment: ${payment.walletProvider} (${payment.walletEmail})`;
                        } else {
                          return `Payment: ${payment.bankName} •••• ${payment.bankAccountLast4}`;
                        }
                      })()}
                    </p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      Invoice #: {mockOrder.invoiceNumber} | Shipment #: {mockOrder.shipmentNumber}
                    </p>
                  </div>
                  <Badge size="sm" variant="default">Total {formatMoney(mockOrder.totalCents)}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="aurora-label text-slate-900 dark:text-slate-50 mb-2">Billing Address</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mockOrder.billingAddress.name}<br/>
                      {mockOrder.billingAddress.street}<br/>
                      {mockOrder.billingAddress.city}, {mockOrder.billingAddress.province} {mockOrder.billingAddress.zip}
                    </p>
                  </div>
                  <div>
                    <p className="aurora-label text-slate-900 dark:text-slate-50 mb-2">Shipping Address</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mockOrder.shippingAddress.name}<br/>
                      {mockOrder.shippingAddress.street}<br/>
                      {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.province} {mockOrder.shippingAddress.zip}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">Items</p>
                  {mockOrder.cartItems.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="aurora-label text-slate-600 dark:text-slate-400">
                        {item.sellerName} • {item.quantity}x
                      </span>
                      <span className="aurora-label text-slate-900 dark:text-slate-50">
                        {formatMoney(item.unitPriceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 text-sm">
                  <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatMoney(mockOrder.subtotalCents)}</span>
                  </div>
                  {mockOrder.discountCents > 0 && (
                    <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Discount</span>
                      <span>-{formatMoney(mockOrder.discountCents)}</span>
                    </div>
                  )}
                  <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Federal Tax</span>
                    <span>{formatMoney(mockOrder.taxFederalCents)}</span>
                  </div>
                  <div className="aurora-label flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Provincial Tax</span>
                    <span>{formatMoney(mockOrder.taxProvincialCents)}</span>
                  </div>
                  <div className="aurora-label flex justify-between text-base font-semibold text-slate-900 dark:text-slate-50">
                    <span>Total Paid</span>
                    <span>{formatMoney(mockOrder.totalCents)}</span>
                  </div>
                </div>
              </div>
            )}
            {Object.keys(providerReceipts).length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">Provider Receipts</p>
                  <Badge size="sm" variant="default">{Object.keys(providerReceipts).length} providers</Badge>
                </div>
                <div className="mt-3 space-y-4">
                  {(Object.entries(providerReceipts) as [string, { items: CartLine[]; total: number }][]).map(([providerId, receipt]) => (
                    <div key={providerId} className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <p className="aurora-label text-slate-900 dark:text-slate-50">
                          {formatProvider(providerId)}
                        </p>
                        <Badge size="sm" variant="default">{formatMoney(receipt.total)}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {receipt.items.map((line: CartLine) => (
                          <div key={line.product.id} className="flex justify-between">
                            <span className="aurora-label text-slate-600 dark:text-slate-400">
                              {line.product.title} • {line.quantity}x
                            </span>
                            <span className="aurora-label text-slate-900 dark:text-slate-50">
                              {formatMoney(line.product.priceCents * line.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <p className="aurora-label text-slate-900 dark:text-slate-50">Delivery Tracking</p>
                <Badge size="sm" variant="info">In progress</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {trackingSteps.map((step: { title: string; detail: string }, index: number) => {
                  const status = index === 0 ? 'complete' : index === 1 ? 'active' : 'pending';
                  return (
                    <div key={step.title} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          status === 'complete'
                            ? 'bg-emerald-500'
                            : status === 'active'
                            ? 'bg-blue-500 animate-pulse transform-gpu'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                      <div>
                        <p className="aurora-label text-sm font-medium text-slate-900 dark:text-slate-50">
                          {step.title}
                        </p>
                        <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Providers are preparing shipment. You can continue shopping or view your order history.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/commerce/orders">
                <Button variant="primary">View Order History</Button>
              </Link>
              <Link href="/commerce">
                <Button variant="secondary">Continue Shopping</Button>
              </Link>
              <Link href="/commerce/review">
                <Button variant="outline">Review Priorities</Button>
              </Link>
              <Button variant="ghost" onClick={handleDownloadReceipt}>
                Download Receipt
              </Button>
              <Button variant="ghost" onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            </div>
          </Card>
        </SurfaceSection>
      )}
    </Surface>
  );
}
