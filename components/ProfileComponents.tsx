import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { auth, storage } from '../firebaseConfig';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const AccountSecurityEditor: React.FC = () => {
    const { currentUser, updateProfile } = useUser();
    const { showNotification } = useNotification();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newEmail, setNewEmail] = useState(currentUser?.email || '');
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [username, setUsername] = useState(currentUser?.username || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [changingPw, setChangingPw] = useState(false);
    const [changingEmail, setChangingEmail] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const changePassword = async () => {
        if (!currentPassword || !newPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        setChangingPw(true);
        try {
            const fbUser = auth.currentUser;
            if (!fbUser?.email) throw new Error('Missing auth user');
            const cred = EmailAuthProvider.credential(fbUser.email, currentPassword);
            await reauthenticateWithCredential(fbUser, cred);
            await updatePassword(fbUser, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            showNotification('Password updated successfully', 'success');
        } catch (e: any) {
            console.error(e);
            let msg = e?.message || 'Failed to update password';
            if (e?.code === 'auth/wrong-password') msg = 'Incorrect current password';
            showNotification(msg, 'error');
        } finally {
            setChangingPw(false);
        }
    };

    const initiateEmailChange = async () => {
        if (!newEmail || newEmail === currentUser?.email) {
            showNotification('Please enter a different email address', 'info');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        if (!currentPassword) {
            showNotification('Current password required for security verification', 'error');
            return;
        }
        setChangingEmail(true);
        try {
            const fbUser = auth.currentUser;
            if (!fbUser?.email) throw new Error('Missing auth user');
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

    const saveProfileInfo = async () => {
        setSavingProfile(true);
        try {
            await updateProfile({ fullName: fullName.trim(), username: username.trim() });
            showNotification('Profile updated successfully', 'success');
        } catch (e) {
            console.error(e);
            showNotification('Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarFile || !currentUser) return;
        setUploadingAvatar(true);
        try {
            const storageRef = ref(storage, `avatars/${currentUser.id}/${avatarFile.name}`);
            await uploadBytes(storageRef, avatarFile);
            const downloadURL = await getDownloadURL(storageRef);
            await updateProfile({ avatar: downloadURL });
            showNotification('Avatar updated successfully', 'success');
            setAvatarFile(null);
        } catch (e) {
            console.error(e);
            showNotification('Failed to upload avatar', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Profile Information */}
            <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
                <h2 className="font-display text-2xl text-secondary dark:text-white mb-6">Profile Information</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-accent overflow-hidden flex items-center justify-center">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-accent">account_circle</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                className="text-xs"
                            />
                            {avatarFile && (
                                <button
                                    disabled={uploadingAvatar}
                                    onClick={uploadAvatar}
                                    className={`mt-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest ${uploadingAvatar ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
                                >
                                    {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Full Name</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Username</label>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-sm"
                            />
                        </div>
                    </div>
                    <button
                        disabled={savingProfile}
                        onClick={saveProfileInfo}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-[0.2em] text-[10px] ${savingProfile ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
                    >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Security Verification */}
            <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
                <h2 className="font-display text-2xl text-secondary dark:text-white mb-2">Security Verification</h2>
                <p className="text-xs opacity-60 mb-6">Required for changing sensitive account details like Email or Password.</p>
                <div className="max-w-sm">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPw ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-sm pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/60"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {showCurrentPw ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Email */}
            <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
                <h2 className="font-display text-2xl text-secondary dark:text-white mb-6">Change Email</h2>
                <div className="max-w-sm space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">New Email Address</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="new@example.com"
                            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-sm"
                        />
                    </div>
                    <button
                        disabled={changingEmail || !currentPassword}
                        onClick={initiateEmailChange}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-[0.2em] text-[10px] ${changingEmail || !currentPassword ? 'bg-stone-300 text-white' : 'bg-primary text-white hover:bg-accent'}`}
                    >
                        {changingEmail ? 'Sending Link...' : 'Send Verification Link'}
                    </button>
                    {!currentPassword && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Enter current password above to enable</p>}
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
                <h2 className="font-display text-2xl text-secondary dark:text-white mb-6">Change Password</h2>
                <div className="max-w-sm space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPw ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPw(!showNewPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/60"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {showNewPw ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <button
                        disabled={changingPw || !currentPassword}
                        onClick={changePassword}
                        className={`px-6 py-3 rounded font-bold uppercase tracking-[0.2em] text-[10px] ${changingPw || !currentPassword ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
                    >
                        {changingPw ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const NotificationPreferences: React.FC = () => {
    const { currentUser, updateProfile } = useUser();
    const { showNotification } = useNotification();
    const [prefs, setPrefs] = useState({
        notifyMarketing: currentUser?.notifyMarketing ?? true,
        notifyOrders: currentUser?.notifyOrders ?? true,
        notifyNewsletter: currentUser?.notifyNewsletter ?? true
    });
    const [saving, setSaving] = useState(false);

    const savePreferences = async () => {
        setSaving(true);
        try {
            await updateProfile(prefs);
            showNotification('Notification preferences updated', 'success');
        } catch (e) {
            console.error(e);
            showNotification('Failed to update preferences', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm font-bold">Notifications</p>
            <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] opacity-60">Marketing & Promotions</span>
                    <input
                        type="checkbox"
                        checked={prefs.notifyMarketing}
                        onChange={(e) => setPrefs({ ...prefs, notifyMarketing: e.target.checked })}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] opacity-60">Order Updates</span>
                    <input
                        type="checkbox"
                        checked={prefs.notifyOrders}
                        onChange={(e) => setPrefs({ ...prefs, notifyOrders: e.target.checked })}
                        className="w-4 h-4"
                    />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] opacity-60">Newsletter</span>
                    <input
                        type="checkbox"
                        checked={prefs.notifyNewsletter}
                        onChange={(e) => setPrefs({ ...prefs, notifyNewsletter: e.target.checked })}
                        className="w-4 h-4"
                    />
                </label>
            </div>
            <button
                disabled={saving}
                onClick={savePreferences}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${saving ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
            >
                {saving ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    );
};
