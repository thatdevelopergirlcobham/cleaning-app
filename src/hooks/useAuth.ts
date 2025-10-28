import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';

/**
 * Hook to access the authentication context
 * @returns The authentication context
 * @throws {Error} If used outside of an AuthProvider
 */
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { useAuth };
export default useAuth;
