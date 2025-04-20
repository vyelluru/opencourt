// MagicLinkLogin.jsx
import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function MagicLinkLogin() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');


  const signInWithEmail = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://opencourt.vercel.app/', // or any path like /dashboard
        shouldCreateUser: true,
      },
    });

  };

  return (
    <form onSubmit={signInWithEmail} className="magic-login-container">
      <h2 className="magic-title">Sign in with Magic Link</h2>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="magic-input"
      />
      <button type="submit" className="magic-button">Send Magic Link</button>
      {message && <p className="magic-message">{message}</p>}
    </form>

  );
}
