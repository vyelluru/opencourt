// AuthComponent.jsx
import './index.css';
import React, { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import CourtLocations from './App';
import MagicLinkLogin from './MagicLinkLogin';

export default function AuthComponent() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  return (
    <div className="auth-wrapper">
      {!session ? <MagicLinkLogin /> : <CourtLocations session={session} />}
    </div>
  );
}
