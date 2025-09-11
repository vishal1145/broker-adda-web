import { Suspense } from 'react';
import VerifyCode from './VerifyCode';

export const metadata = {
  title: 'Verify Code -Byron Bay Real Estate',
  description: 'Verify your phone number with the code sent to your phone',
};

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyCode />
    </Suspense>
  );
}
