import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';

const AdminLogin: React.FC = () => {
  const { loginWithEmail, currentUser, loading, hasRole } = useUser();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && hasRole(['super-admin', 'admin', 'manager', 'editor'])) {
      navigate(from, { replace: true });
    }
  }, [loading, currentUser, hasRole, navigate, from]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      showNotification('Admin login successful', 'success');
      // AdminRoute will redirect appropriately once role loads
      navigate(from, { replace: true });
    } catch {
      showNotification('Admin login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-40 pb-24 px-6 min-h-screen">
      <div className="max-w-md mx-auto bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
        <h1 className="font-display text-2xl mb-2">Admin Login</h1>
        <p className="text-[11px] opacity-60 mb-6">
          Staff-only access. If you don’t have access, contact an administrator.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[12px] tracking-widest focus:ring-accent"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[12px] tracking-widest focus:ring-accent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <button
            disabled={submitting}
            className="w-full bg-primary text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-[10px] uppercase tracking-widest mt-6">
          Back to site{' '}
          <Link to="/" className="text-primary font-bold">
            Home
          </Link>
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;

