import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';

type Role = 'customer' | 'super-admin' | 'admin' | 'manager' | 'editor';

const Users: React.FC = () => {
  const { allUsers, getIdToken } = useUser();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('manager');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const staff = useMemo(
    () => allUsers.filter(u => (u.role || 'customer') !== 'customer'),
    [allUsers]
  );

  const createStaff = async () => {
    setSubmitting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch('/api/admin-create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, fullName, username, role }),
      });

      const contentType = resp.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        console.error('Non-JSON response:', text);
        throw new Error('A server error occurred. Please check logs.');
      }

      if (!resp.ok) throw new Error(data?.error || 'Failed');

      showNotification('Staff user created', 'success');
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
      setRole('manager');
    } catch (e: any) {
      console.error(e);
      showNotification(e?.message || 'Failed to create staff user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateRole = async (uid: string, newRole: Role) => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch('/api/admin-update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid, role: newRole }),
      });

      const contentType = resp.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        console.error('Non-JSON response:', text);
        throw new Error('A server error occurred. Please check logs.');
      }

      if (!resp.ok) throw new Error(data?.error || 'Failed');
      showNotification('Role updated', 'success');
    } catch (e: any) {
      console.error(e);
      showNotification(e?.message || 'Failed to update role', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D] mb-2">Staff & Roles</h2>
          <p className="text-stone-500 text-sm">Create staff logins and assign access roles.</p>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Add staff member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input className="bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm" placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="relative">
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <select className="bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="super-admin">Super Admin (full access + roles)</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="mt-6">
            <button
              disabled={submitting}
              onClick={createStaff}
              className="px-6 py-3 rounded bg-[#221C1D] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create staff login'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Staff list</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-stone-500">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id} className="border-t border-stone-100">
                    <td className="py-3">{u.fullName}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <select
                        className="bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm"
                        value={(u.role || 'customer') as Role}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      >
                        <option value="super-admin">super-admin</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="customer">customer</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td className="py-6 opacity-50" colSpan={3}>
                      No staff users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
