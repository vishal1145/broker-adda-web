import { Suspense } from 'react';
import VerifyCode from './VerifyCode';

export const metadata = {
  title: 'Verify Code | Phone Verification | Broker Gully',
  description: 'Verify your phone number with the verification code sent to your mobile. Complete your account verification on Broker Gully to access all features.',
};

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCode />
    </Suspense>
  );
}
