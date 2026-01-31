import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { auth } from '../../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const Account: React.FC = () => {
  const { currentUser, updateProfile, logout } = useUser();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const initialUsername = useMemo(() => currentUser?.username || '', [currentUser?.username]);
  const initialFullName = useMemo(() => currentUser?.fullName || '', [currentUser?.fullName]);

  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="p-10 opacity-60">You must be logged in.</div>
      </AdminLayout>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        username: username.trim(),
        fullName: fullName.trim(),
      });
      showNotification('Account details updated', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Failed to update account details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setChangingPw(true);
    try {
      const fbUser = auth.currentUser;
      if (!fbUser?.email) throw new Error('Missing auth user');
      if (!currentPassword || !newPassword) throw new Error('Missing password fields');

      const cred = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, cred);
      await updatePassword(fbUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      showNotification('Password updated', 'success');
    } catch (e: any) {
      console.error(e);
      showNotification(e?.message || 'Failed to update password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D] mb-2">Account</h2>
            <p className="text-stone-500 text-sm">Update your admin username and password.</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6 mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={saving}
              onClick={saveProfile}
              className="px-6 py-3 rounded bg-[#221C1D] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Change password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              disabled={changingPw}
              onClick={changePassword}
              className="px-6 py-3 rounded bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {changingPw ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Account;

