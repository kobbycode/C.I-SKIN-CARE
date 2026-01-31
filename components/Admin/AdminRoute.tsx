import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import type { UserProfile } from '../../types';

type Role = NonNullable<UserProfile['role']>;

export default function AdminRoute(props: { allow?: Role[]; children: React.ReactNode }) {
  const { allow = ['super-admin', 'admin', 'manager', 'editor'], children } = props;
  const { currentUser, loading, hasRole } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(allow)) {
    // If a logged-in user lacks staff permissions, keep them in the admin auth flow
    // (instead of sending them to the public homepage).
    return <Navigate to="/admin/login" replace state={{ from: location.pathname, reason: 'unauthorized' }} />;
  }

  return <>{children}</>;
}

