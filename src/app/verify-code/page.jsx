import { Suspense } from 'react';
import VerifyCode from './VerifyCode';

export const metadata = {
  title: 'Verify Code - Broker Adda | A-17, Tajganj, Agra',
  description: 'Verify your phone number with the code sent to your phone. Broker Adda, A-17, Tajganj, Agra.',
};

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCode />
    </Suspense>
  );
}
