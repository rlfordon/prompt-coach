import React, { useState, useEffect } from 'react';
import { isPasskeyRequired, verifyPasskey, getStoredPasskey } from '../services/aiService';

type Status = 'checking' | 'needed' | 'ready' | 'offline';

// Asks for the class passkey when the proxy requires one, then renders the app.
const PasskeyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('checking');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!(await isPasskeyRequired())) return setStatus('ready');
        const stored = getStoredPasskey();
        setStatus(stored && (await verifyPasskey(stored)) ? 'ready' : 'needed');
      } catch {
        setStatus('offline');
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (await verifyPasskey(passkey.trim())) setStatus('ready');
      else setError('That passkey is not correct.');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'ready') return <>{children}</>;

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Prompt Coach</h1>
        {status === 'checking' && <p className="text-gray-600">Connecting…</p>}
        {status === 'offline' && (
          <p className="text-gray-700">The Prompt Coach server can't be reached right now. Please try again in a moment.</p>
        )}
        {status === 'needed' && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="passkey" className="block text-sm text-gray-700 mb-2">
              Enter the class passkey from your instructor.
            </label>
            <input
              id="passkey"
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              autoFocus
            />
            {error && <p className="text-sm text-red-700 mb-3" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !passkey.trim()}
              className="w-full bg-scarlet text-white rounded px-3 py-2 disabled:opacity-50"
            >
              {submitting ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasskeyGate;
