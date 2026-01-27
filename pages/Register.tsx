import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Register: React.FC = () => {
  const { registerWithEmail, loginWithGoogle } = useUser();
  const { showNotification } = useNotification();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/profile';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerWithEmail({ fullName, email, password });
      showNotification('Account created • Logged in', 'success');
      navigate(from);
    } catch (err) {
      showNotification('Failed to register. Try again.', 'error');
    }
  };

  return (
    <main className="pt-40 pb-24 px-10 min-h-screen">
      <div className="max-w-md mx-auto bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
        <h1 className="font-display text-2xl mb-6">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[12px] tracking-widest focus:ring-accent"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[12px] tracking-widest focus:ring-accent"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[12px] tracking-widest focus:ring-accent"
            required
          />
          <button className="bg-primary text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px]">
            Create Account
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={async () => {
              try {
                await loginWithGoogle();
                showNotification('Account created via Google • Logged in', 'success');
                navigate(from);
              } catch {
                showNotification('Google signup failed. Try again.', 'error');
              }
            }}
            className="w-full border border-primary/20 py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
          >
            <img src="/assets/google-logo.webp" alt="Google" className="h-5 w-5 object-contain shrink-0" />
            Continue with Google
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-widest mt-4">
          Have an account? <Link to="/login" className="text-primary font-bold">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
