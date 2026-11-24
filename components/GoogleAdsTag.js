'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import {
  googleAdsLinkerDomains,
  googleAdsTagId,
  registrationAppOrigin,
  registrationCompleteMessageType,
  registrationConversionSendTo,
} from '@/lib/google-ads';

const gtagConfig = JSON.stringify({ linker: { domains: googleAdsLinkerDomains } });

// One conversion per page session, even if the registration app posts twice
// or the listener is re-attached during client-side navigation.
let registrationConversionSent = false;

function isRegistrationCompleteMessage(data) {
  if (data === registrationCompleteMessageType) return true;
  return typeof data === 'object' && data !== null && data.type === registrationCompleteMessageType;
}

export default function GoogleAdsTag() {
  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== registrationAppOrigin) return;
      if (!isRegistrationCompleteMessage(event.data)) return;
      if (registrationConversionSent || typeof window.gtag !== 'function') return;
      registrationConversionSent = true;
      window.gtag('event', 'conversion', { send_to: registrationConversionSendTo });
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsTagId}`} strategy="afterInteractive" />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAdsTagId}', ${gtagConfig});`}
      </Script>
    </>
  );
}
