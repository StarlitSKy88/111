import React, { useState } from 'react';
export function CookieBanner() {
  const [shown, setShown] = useState(!localStorage.getItem('cookies-ok'));
  if (shown) {
    return (
      <div className="cookie-consent">
        We use cookies. <button onClick={() => { localStorage.setItem('cookies-ok','1'); setShown(false); }}>OK</button>
      </div>
    );
  }
  return null;
}
