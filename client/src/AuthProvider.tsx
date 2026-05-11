import { useAuth } from '@clerk/react';
import { useEffect } from 'react';
import { setTokenGetter } from './lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
