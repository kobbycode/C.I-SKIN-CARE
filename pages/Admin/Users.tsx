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

  // Edit State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [updating, setUpdating] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

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

  const saveEdit = async () => {
    if (!editingUser) return;
    setUpdating(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not authenticated');

      const payload: any = {
        uid: editingUser.id,
        fullName: editForm.fullName,
        email: editForm.email,
        username: editForm.username,
      };
      if (editForm.password) payload.password = editForm.password;

      const resp = await fetch('/api/admin-update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Failed to update user');
      }

      showNotification('User updated successfully', 'success');
      setEditingUser(null);
      // Ideally trigger reload, but real-time listener might update it? 
      // Context uses onSnapshot? Yes context useUser listens to allUsers? 
      // check context/UserContext.tsx. Yes, "users" collection snapshot.
      // So UI will update automatically.
    } catch (e: any) {
      console.error(e);
      showNotification(e.message || 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      username: user.username || '',
      password: ''
    });
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
                  <th className="text-left py-2 pl-4">Avatar</th>
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
                    <td className="py-3 pl-4">
                      <div className="w-8 h-8 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center border border-stone-200">
                        {u.avatar ? (
                          <img src={u.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="material-symbols-outlined text-stone-300 text-lg">account_circle</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={u.id === currentUser?.id ? "font-bold text-primary" : ""}>
                        {u.fullName} {u.id === currentUser?.id && "(You)"}
                      </span>
                    </td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <select
                        className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs appearance-none pr-6 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.2rem_center] bg-[size:1.2em_1.2em] bg-no-repeat disabled:opacity-50"
                        value={(u.role || 'customer') as Role}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                        disabled={currentUser?.role !== 'super-admin' || u.id === currentUser?.id}
                      >
                        <option value="super-admin">super-admin</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="customer">customer</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${u.registrationMethod === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {u.registrationMethod === 'admin' ? 'Admin' : 'Web'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {currentUser?.role === 'super-admin' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 text-stone-300 hover:text-primary transition-colors disabled:opacity-20"
                            title="Edit User"
                            disabled={false} // Allow editing self? Sure.
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 text-stone-300 hover:text-red-600 transition-colors disabled:opacity-20"
                            title="Delete User"
                            disabled={u.id === currentUser?.id}
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
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
    </div>

      {/* Edit Modal */ }
  {
    editingUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
            <h3 className="font-display text-xl text-[#221C1D]">Edit User Details</h3>
            <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-stone-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-8 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Full Name</label>
              <input
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Username</label>
                <input
                  className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Email</label>
                <input
                  className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm focus:border-black focus:ring-0 outline-none transition-colors"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-stone-200">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">Reset Password</label>
              <p className="text-xs text-stone-400 mb-3">Leave blank to keep existing password. Entering a value here will immediately change the user's password.</p>
              <div className="relative">
                <input
                  type={showEditPassword ? "text" : "password"}
                  className="w-full bg-red-50 border border-red-100 rounded px-4 py-3 text-sm focus:border-red-500 focus:ring-0 outline-none transition-colors pr-10"
                  placeholder="New Password (optional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showEditPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
            <button
              onClick={() => setEditingUser(null)}
              className="px-6 py-2.5 rounded-lg text-stone-500 font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={updating}
              className="px-6 py-2.5 rounded-lg bg-[#221C1D] text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>
        </div>
      </div>
    )
  }
    </AdminLayout >
  );
};

export default Users;
