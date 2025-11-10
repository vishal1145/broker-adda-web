import { Suspense } from 'react';
import VerifyCode from './VerifyCode';

export const metadata = {
  title: 'Verify Code - Broker Gully | ',
  description: 'Verify your phone number with the code sent to your phone. Broker Gully, ',
};

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCode />
    </Suspense>
  );
}
