import React from 'react';
import { useAuth } from './AuthProvider';

interface PermissionGateProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default PermissionGate;