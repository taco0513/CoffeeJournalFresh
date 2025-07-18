import React, { createContext, useContext, useEffect, useState } from 'react';
import RealmService from '../services/RealmService';

interface RealmContextType {
  isReady: boolean;
  realmService: typeof RealmService;
}

const RealmContext = createContext<RealmContextType | undefined>(undefined);

export const RealmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeRealm = async () => {
      try {
        console.log('Initializing Realm...');
        await RealmService.initialize();
        console.log('Realm initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Realm:', error);
        // Still set ready to true to allow app to function
        // Realm might work later or we can show an error
        setIsReady(true);
      }
    };

    initializeRealm();

    return () => {
      RealmService.close();
    };
  }, []);

  return (
    <RealmContext.Provider value={{ isReady, realmService: RealmService }}>
      {children}
    </RealmContext.Provider>
  );
};

export const useRealm = () => {
  const context = useContext(RealmContext);
  if (!context) {
    throw new Error('useRealm must be used within a RealmProvider');
  }
  return context;
};