'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/aurora/Form';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { Badge } from '@/components/aurora/Badge';
import { useAddressStore } from '@/lib/commerce/use-address-store';
import { useProfileStore } from '@/lib/commerce/profile-store';
import { usePaymentStore, type PaymentMethodType } from '@/lib/commerce/payment-store';
import type { Address } from '@/data/types';

const paymentTypeOptions = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'wallet', label: 'Digital Wallet' },
  { value: 'bank', label: 'Bank Transfer' },
];

export function DeliveryProfilePage() {
  const router = useRouter();
  const { addresses, addAddress, setDefaultAddress } = useAddressStore();
  const { profile, setProfile } = useProfileStore();
  const { payments, addPayment, removePayment, setDefaultPayment } = usePaymentStore();

  const defaultAddress = useMemo(() => addresses.find((addr) => addr.isDefault) || addresses[0] || null, [addresses]);

  // Contact info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address fields
  const [addressLabel, setAddressLabel] = useState('Primary');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('ca');
  
  // Payment fields
  const [paymentType, setPaymentType] = useState<PaymentMethodType>('card');
  const [paymentLabel, setPaymentLabel] = useState('Primary Card');
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Wallet fields
  const [walletProvider, setWalletProvider] = useState('aurora');
  const [walletEmail, setWalletEmail] = useState('');
  
  // Bank fields
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (!fullName) setFullName(profile.fullName);
    if (!email) setEmail(profile.email);
    if (!phone) setPhone(profile.phone);
    if (!walletEmail) setWalletEmail(profile.email);
  }, [profile, fullName, email, phone, walletEmail]);

  useEffect(() => {
    if (!defaultAddress) return;
    if (!street) setStreet(defaultAddress.street);
    if (!city) setCity(defaultAddress.city);
    if (!province) setProvince(defaultAddress.province);
    if (!postalCode) setPostalCode(defaultAddress.zip);
    if (!country) setCountry(defaultAddress.country);
  }, [defaultAddress, street, city, province, postalCode, country]);

  useEffect(() => {
    return () => {
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

  const validatePaymentDetails = (): boolean => {
    if (paymentType === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
        pushNotice('Please enter a valid card number.', 'error');
        return false;
      }
      if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        pushNotice('Please enter expiry in MM/YY format.', 'error');
        return false;
      }
      if (!cardCvc || cardCvc.length < 3) {
        pushNotice('Please enter a valid CVC.', 'error');
        return false;
      }
    } else if (paymentType === 'wallet') {
      if (!walletProvider) {
        pushNotice('Please select a wallet provider.', 'error');
        return false;
      }
      if (!walletEmail) {
        pushNotice('Please enter your wallet email.', 'error');
        return false;
      }
    } else if (paymentType === 'bank') {
      if (!bankName) {
        pushNotice('Please enter your bank name.', 'error');
        return false;
      }
      if (!bankAccount || bankAccount.length < 4) {
        pushNotice('Please enter your account number.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      pushNotice('Please complete your contact information.', 'error');
      return;
    }
    if (!street.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
      pushNotice('Please complete your delivery address.', 'error');
      return;
    }
    
    if (!validatePaymentDetails()) {
      return;
    }

    if (!window.confirm('Save this delivery profile and payment method on this device?')) {
      pushNotice('Save canceled.', 'info');
      return;
    }

    // Save or get address
    const address: Address = {
      name: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      zip: postalCode.trim(),
      country: country,
    };

    const existing = defaultAddress &&
      defaultAddress.name === address.name &&
      defaultAddress.street === address.street &&
      defaultAddress.city === address.city &&
      defaultAddress.province === address.province &&
      defaultAddress.zip === address.zip &&
      defaultAddress.country === address.country;

    let addressId: string | null = null;
    if (!existing) {
      const saved = addAddress(address, addressLabel.trim() || 'Primary', addresses.length === 0);
      addressId = saved.id;
    } else if (defaultAddress) {
      addressId = defaultAddress.id;
    }

    if (addressId) {
      setDefaultAddress(addressId);
    }

    // Save payment method
    const paymentData: any = {
      type: paymentType,
      label: paymentLabel.trim() || 'Primary',
      billingAddressId: addressId || undefined,
    };

    if (paymentType === 'card') {
      const cleanNumber = cardNumber.replace(/\s/g, '');
      paymentData.cardLast4 = cleanNumber.slice(-4);
      paymentData.cardBrand = detectCardBrand(cleanNumber);
      paymentData.cardExpiry = cardExpiry;
    } else if (paymentType === 'wallet') {
      paymentData.walletProvider = walletProvider;
      paymentData.walletEmail = walletEmail.trim();
    } else if (paymentType === 'bank') {
      paymentData.bankName = bankName.trim();
      paymentData.bankAccountLast4 = bankAccount.slice(-4);
    }

    addPayment(paymentData, payments.length === 0);

    // Save profile
    setProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      defaultPaymentMethod: paymentType,
      updatedAt: new Date().toISOString(),
    });
    
    pushNotice('Profile and payment method saved successfully.', 'success');
    window.setTimeout(() => {
      router.push('/commerce/cart');
    }, 600);
  };

  const detectCardBrand = (number: string): string => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const handleRemovePayment = (id: string) => {
    if (window.confirm('Remove this payment method?')) {
      removePayment(id);
      pushNotice('Payment method removed.', 'success');
    }
  };

  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Delivery Profile"
        description="Complete delivery details and payment methods before you shop."
      />

      <SurfaceSection title="Contact Information">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Full name"
              placeholder="Fred Harper"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="fred@aurora.world"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+1 555 010 2345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Delivery Address">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Address label"
              placeholder="Home, Office, etc."
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
            />
            <Input
              label="Street address"
              placeholder="11 Maple Lane"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            <Input
              label="City"
              placeholder="Northvale"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="Province/State"
              placeholder="Ontario"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
            <Input
              label="Postal code"
              placeholder="N0N 0N0"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
            <Select
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={[
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
              ]}
            />
          </div>
        </Card>
      </SurfaceSection>

      {payments.length > 0 && (
        <SurfaceSection title="Saved Payment Methods">
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                <div className="flex gap-2">
                  {!payment.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDefaultPayment(payment.id);
                        pushNotice('Default payment updated.', 'success');
                      }}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePayment(payment.id)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </SurfaceSection>
      )}

      <SurfaceSection title={payments.length > 0 ? "Add New Payment Method" : "Payment Method"}>
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Payment label"
              placeholder="Personal Visa, Business Card, etc."
              value={paymentLabel}
              onChange={(e) => setPaymentLabel(e.target.value)}
            />
            <Select
              label="Payment type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentMethodType)}
              options={paymentTypeOptions}
            />
          </div>

          {paymentType === 'card' && (
            <div className="space-y-4">
              <Input
                label="Card number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => {
                  // Auto-format card number with spaces
                  const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                  setCardNumber(value);
                }}
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry (MM/YY)"
                  placeholder="12/28"
                  value={cardExpiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardExpiry(value);
                  }}
                  maxLength={5}
                />
                <Input
                  label="CVC"
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                />
              </div>
            </div>
          )}

          {paymentType === 'wallet' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Wallet provider"
                value={walletProvider}
                onChange={(e) => setWalletProvider(e.target.value)}
                options={[
                  { value: 'aurora', label: 'Aurora Wallet' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'applepay', label: 'Apple Pay' },
                  { value: 'googlepay', label: 'Google Pay' },
                ]}
              />
              <Input
                label="Wallet email"
                type="email"
                placeholder="fred@aurora.world"
                value={walletEmail}
                onChange={(e) => setWalletEmail(e.target.value)}
              />
            </div>
          )}

          {paymentType === 'bank' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Bank name"
                placeholder="Royal Bank of Canada"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <Input
                label="Account number"
                placeholder="Last 4-8 digits"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}

          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
            This is a demo. Payment details are stored locally and encrypted in production.
          </p>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Save Profile">
        <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Ready to shop</CardTitle>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Save your profile, address, and payment method to get started.
            </p>
            {notice && (
              <div className="mt-3">
                <InlineNotice message={notice.message} tone={notice.tone} />
              </div>
            )}
          </div>
          <Button variant="primary" onClick={handleSave}>
            Save Profile &amp; Payment
          </Button>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
