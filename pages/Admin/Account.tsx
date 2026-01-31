import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { auth, storage } from '../../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ConfirmModal from '../../components/Admin/ConfirmModal';

const Account: React.FC = () => {
  const { currentUser, updateProfile, logout } = useUser();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const initialUsername = useMemo(() => currentUser?.username || '', [currentUser?.username]);
  const initialFullName = useMemo(() => currentUser?.fullName || '', [currentUser?.fullName]);

  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [changingEmail, setChangingEmail] = useState(false);

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
      let updates: any = {
        username: username.trim(),
        fullName: fullName.trim(),
      };

      if (avatarFile && currentUser) {
        const storageRef = ref(storage, `avatars/${currentUser.id}/${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        const downloadURL = await getDownloadURL(storageRef);
        updates.avatar = `${downloadURL}?t=${new Date().getTime()}`;
      }

      await updateProfile(updates);
      showNotification('Account details updated', 'success');
      setAvatarFile(null);
    } catch (e) {
      console.error(e);
      showNotification('Failed to update account details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const initiateEmailChange = async () => {
    if (!newEmail || newEmail === currentUser?.email) {
      showNotification('Please enter a different email address', 'info');
      return;
    }

    // Simple email regex for basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setChangingEmail(true);
    try {
      const fbUser = auth.currentUser;
      if (!fbUser?.email) throw new Error('Missing auth user');
      if (!currentPassword) throw new Error('Current password required for security verification');

      const cred = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, cred);
      await verifyBeforeUpdateEmail(fbUser, newEmail);

      showNotification('Verification link sent to ' + newEmail + '. Please confirm from your new inbox.', 'info');
      setCurrentPassword('');
    } catch (e: any) {
      console.error(e);
      let msg = e?.message || 'Failed to initiate email change';
      if (e?.code === 'auth/wrong-password') msg = 'Incorrect current password';
      showNotification(msg, 'error');
    } finally {
      setChangingEmail(false);
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
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="Confirm Logout"
          message="Are you sure you want to sign out of the Management Suite?"
          confirmLabel="Logout"
          cancelLabel="Stay logged in"
          variant="danger"
          onConfirm={() => {
            logout();
            navigate('/admin/login');
          }}
          onCancel={() => setIsLogoutModalOpen(false)}
        />

        <div className="bg-white border border-stone-100 rounded-xl p-6 mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" key={currentUser.avatar} />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-stone-300">account_circle</span>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white">edit</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>
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

        <div className="bg-white border border-stone-100 rounded-xl p-6 mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Security Verification</h3>
          <p className="text-stone-500 text-[10px] mb-4 uppercase tracking-wider">Required for changing sensitive account details like Email or Password.</p>
          <div className="max-w-sm">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Current password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Confirm password to make changes"
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <span className="material-symbols-outlined text-lg">
                  {showCurrentPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6 mb-8">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Change Email</h3>
          <div className="grid grid-cols-1 gap-4 max-w-sm">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              disabled={changingEmail || !currentPassword}
              onClick={initiateEmailChange}
              className="px-6 py-3 rounded bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {changingEmail ? 'Sending Link...' : 'Send Verification Link'}
            </button>
            {!currentPassword && <p className="text-[9px] text-red-500 mt-2 font-bold uppercase tracking-widest">Enter current password above to enable</p>}
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-xl p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Change password</h3>
          <div className="grid grid-cols-1 gap-4 max-w-sm">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">New password</label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-4 py-3 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showNewPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              disabled={changingPw || !currentPassword}
              onClick={changePassword}
              className="px-6 py-3 rounded bg-[#221C1D] text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
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

