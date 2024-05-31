'use client'
import React, { useEffect } from 'react';

const LoginPage = () => {
  useEffect(() => {
    // Dynamically load the Auth0 script and initialize the custom elements
    const script = document.createElement('script');
    script.src = 'http://lrda-users.rerum.io/script/lrda_public_auth.js';
    script.type = 'module';
    script.onload = () => {
      console.log('Auth0 script loaded');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <button is="auth-button">Login/Logout</button>
      <input is="auth-creator" style={{ display: 'none' }} />
    </div>
  );
};

export default LoginPage;
