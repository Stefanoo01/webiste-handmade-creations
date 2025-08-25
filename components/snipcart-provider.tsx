"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function SnipcartProvider() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Don't render anything on the server
  }
  
  return (
    <>
      {/* Snipcart CSS */}
      <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.3.1/default/snipcart.css" />
      
      {/* Snipcart div */}
      <div
        hidden
        id="snipcart"
        data-api-key={process.env.NEXT_PUBLIC_SNIPCART_API_KEY}
        data-config-modal-style="side"
        data-config-add-product-behavior="add"
        data-config-show-continue-shopping="true"
        data-config-currency="eur"
        data-config-locale="it"
        data-config-currency-format="€{amount}"
        data-config-currency-position="left"
        data-config-tax-included="true"
        data-config-shipping-address-required="false"
        data-config-allow-comments="true"
        data-config-allow-order-notes="true"
      >
        </div>
        
      {/* Snipcart JS */}
      <Script
        src="https://cdn.snipcart.com/themes/v3.3.1/default/snipcart.js"
        strategy="lazyOnload"
      />
    </>
  );
}