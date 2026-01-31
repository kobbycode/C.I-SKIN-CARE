import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle } = useUser();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/profile';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      showNotification('Logged in successfully', 'success');
      navigate(from);
    } catch (err) {
      showNotification('Login failed. Check your credentials or register.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-40 pb-24 px-10 min-h-screen">
      <div className="max-w-md mx-auto bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
        <h1 className="font-display text-2xl mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
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
          <button
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:brightness-110 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isLoading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
            {isLoading ? 'Logging into your ritual...' : 'Login'}
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={async () => {
              try {
                await loginWithGoogle();
                showNotification('Logged in with Google', 'success');
                navigate(from);
              } catch {
                showNotification('Google login failed. Try again.', 'error');
              }
            }}
            className="w-full border border-primary/20 py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
          >
            <img src="/assets/google-logo.webp" alt="Google" className="h-5 w-5 object-contain shrink-0" />
            Login with Google
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-widest mt-4">
          No account? <Link to="/register" className="text-primary font-bold">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
