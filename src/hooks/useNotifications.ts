import { useContext } from 'react';
import NotificationContext from '../contexts/NotificationContext';
import type { NotificationContextType } from '../contexts/NotificationContext';

const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext) as NotificationContextType;
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};

export { useNotifications };
export default useNotifications;
