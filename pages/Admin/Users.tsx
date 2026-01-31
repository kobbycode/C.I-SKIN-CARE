import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';

type Role = 'customer' | 'super-admin' | 'admin' | 'manager' | 'editor';

const Users: React.FC = () => {
  const { allUsers, getIdToken, currentUser } = useUser();
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

  const deleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch('/api/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data?.error || 'Failed');
      }
      showNotification('User deleted', 'success');
    } catch (e: any) {
      console.error(e);
      showNotification(e?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D] mb-2">Staff & Roles</h2>
          <p className="text-stone-500 text-sm">Create staff logins and assign access roles.</p>
        </div>

        {currentUser?.role === 'super-admin' ? (
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
        ) : (
          <div className="bg-stone-50 border border-stone-100 rounded-xl p-6 text-center">
            <p className="text-stone-400 text-sm italic">Only Super Admins can create new staff logins.</p>
          </div>
        )}

        <div className="bg-white border border-stone-100 rounded-xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Staff list</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-stone-500">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Source</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id} className="border-t border-stone-100">
                    <td className="py-3">{u.fullName}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <select
                        className="bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat"
                        value={(u.role || 'customer') as Role}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                        disabled={currentUser?.role !== 'super-admin'}
                      >
                        <option value="super-admin">super-admin</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="customer">customer</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${u.registrationMethod === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {u.registrationMethod === 'admin' ? 'Admin' : 'Web'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {currentUser?.role === 'super-admin' && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-2 text-stone-300 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td className="py-6 opacity-50" colSpan={5}>
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
