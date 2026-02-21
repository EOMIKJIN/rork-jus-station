import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { db, auth } from '@/config/firebase';
import { AppState, AppStateStatus } from 'react-native';
import { getRandomDummyUser } from '@/mocks/users';

export interface JewelSpinUserData {
  userId: string;
  nickname: string;
  jewels: number;
  email?: string;
  level?: number;
  experience?: number;
  lastLogin?: string;
}

interface FirebaseState {
  user: User | null;
  userData: JewelSpinUserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isDummyMode: boolean;
  refreshUserData: () => Promise<void>;
  updateUserData: (data: Partial<JewelSpinUserData>) => Promise<void>;
}

export const [FirebaseProvider, useFirebase] = createContextHook<FirebaseState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<JewelSpinUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDummyMode, setIsDummyMode] = useState<boolean>(false);
  const unsubscribeSnapshot = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log('[FirebaseContext] Setting up auth listener...');
    
    const isFirebaseConfigured = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    
    if (!isFirebaseConfigured) {
      console.log('[FirebaseContext] 🎭 Firebase not configured, using dummy mode');
      setIsDummyMode(true);
      const dummyUser = getRandomDummyUser();
      setUserData(dummyUser);
      setIsLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      const unsubscribeAuth = onAuthStateChanged(auth as Auth, async (firebaseUser) => {
        console.log('[FirebaseContext] Auth state changed, uid:', firebaseUser?.uid || 'none');
        setUser(firebaseUser);
        
        if (firebaseUser) {
          console.log('[FirebaseContext] User authenticated, uid:', firebaseUser.uid);
          await fetchUserData(firebaseUser.uid);
        } else {
          console.log('[FirebaseContext] No user, attempting anonymous sign in...');
          try {
            if (!auth) {
              throw new Error('Firebase Auth not initialized');
            }
            const result = await signInAnonymously(auth as Auth);
            console.log('[FirebaseContext] Anonymous sign in successful, uid:', result.user.uid);
          } catch (err: any) {
            console.error('[FirebaseContext] ❌ Anonymous sign in failed');
            console.error('[FirebaseContext] Error code:', err?.code);
            console.error('[FirebaseContext] Error message:', err?.message);
            console.log('[FirebaseContext] 🎭 Falling back to dummy mode');
            setIsDummyMode(true);
            const dummyUser = getRandomDummyUser();
            setUserData(dummyUser);
            setError(null);
            setIsLoading(false);
          }
        }
      });

      return () => {
        console.log('[FirebaseContext] Cleaning up auth listener');
        unsubscribeAuth();
        if (unsubscribeSnapshot.current) {
          console.log('[FirebaseContext] Cleaning up Firestore listener');
          unsubscribeSnapshot.current();
          unsubscribeSnapshot.current = null;
        }
      };
    } catch (err: any) {
      console.error('[FirebaseContext] ❌ Firebase initialization failed:', err?.message);
      console.log('[FirebaseContext] 🎭 Using dummy mode');
      setIsDummyMode(true);
      const dummyUser = getRandomDummyUser();
      setUserData(dummyUser);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDummyMode) {
      console.log('[FirebaseContext] 🎭 Dummy mode: skipping AppState listener');
      return;
    }

    console.log('[FirebaseContext] Setting up AppState listener for background/foreground detection...');
    
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('[FirebaseContext] 📱 AppState changed to:', nextAppState);
      
      if (nextAppState === 'active' && user) {
        console.log('[FirebaseContext] 🔄 App returned to foreground, syncing data for uid:', user.uid);
        refreshUserData();
      }
    });

    return () => {
      subscription.remove();
      console.log('[FirebaseContext] AppState listener cleaned up');
    };
  }, [user, isDummyMode]);

  const fetchUserData = async (userId: string) => {
    try {
      console.log('[FirebaseContext] 🔍 Fetching user data, uid:', userId);
      setIsLoading(true);
      setError(null);

      if (!db) {
        throw new Error('Firebase Firestore not initialized');
      }
      const userDocRef = doc(db as Firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (unsubscribeSnapshot.current) {
        console.log('[FirebaseContext] Cleaning up previous snapshot listener');
        unsubscribeSnapshot.current();
        unsubscribeSnapshot.current = null;
      }

      if (userDoc.exists()) {
        const rawData = userDoc.data();
        const data = ensureValidUserData(rawData, userId);
        console.log('[FirebaseContext] ✅ User data fetched, jewels:', data.jewels, 'level:', data.level);
        setUserData(data);
        
        console.log('[FirebaseContext] 📡 Setting up real-time listener for uid:', userId);
        const unsubscribe = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              const rawUpdatedData = doc.data();
              const updatedData = ensureValidUserData(rawUpdatedData, userId);
              console.log('[FirebaseContext] 🔄 Real-time update received, jewels:', updatedData.jewels, 'level:', updatedData.level);
              setUserData(updatedData);
            } else {
              console.log('[FirebaseContext] ⚠️ Document deleted in real-time update');
            }
          },
          (error: any) => {
            console.error('[FirebaseContext] ❌ Snapshot listener error');
            console.error('[FirebaseContext] Error code:', error?.code);
            console.error('[FirebaseContext] Error message:', error?.message);
            
            if (error?.code === 'permission-denied') {
              console.error('[FirebaseContext] 🚫 Permission denied - check Firestore rules');
              setError('권한이 없습니다. Firestore 규칙을 확인하세요.');
            } else if (error?.code === 'unavailable') {
              console.error('[FirebaseContext] 📡 Network unavailable - offline mode');
              setError('네트워크 연결을 확인하세요.');
            } else {
              console.error('[FirebaseContext] Unknown snapshot error');
              setError('실시간 동기화 실패');
            }
          }
        );

        unsubscribeSnapshot.current = unsubscribe;
      } else {
        console.log('[FirebaseContext] ⚠️ User document does not exist, creating default data...');
        const defaultUserData: JewelSpinUserData = {
          userId,
          nickname: 'JewelSpin 유저',
          jewels: 0,
          level: 1,
          experience: 0,
          lastLogin: new Date().toISOString(),
        };
        
        await setDoc(userDocRef, defaultUserData);
        console.log('[FirebaseContext] ✅ Default user data created, jewels:', defaultUserData.jewels);
        setUserData(defaultUserData);
        
        console.log('[FirebaseContext] 📡 Setting up real-time listener for new user');
        const unsubscribe = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              const rawUpdatedData = doc.data();
              const updatedData = ensureValidUserData(rawUpdatedData, userId);
              console.log('[FirebaseContext] 🔄 Real-time update received, jewels:', updatedData.jewels);
              setUserData(updatedData);
            }
          },
          (error: any) => {
            console.error('[FirebaseContext] ❌ Snapshot listener error:', error?.code, error?.message);
            if (error?.code === 'permission-denied') {
              setError('권한이 없습니다.');
            } else if (error?.code === 'unavailable') {
              setError('네트워크 연결을 확인하세요.');
            }
          }
        );
        
        unsubscribeSnapshot.current = unsubscribe;
      }
    } catch (err: any) {
      console.error('[FirebaseContext] ❌ Error fetching user data');
      console.error('[FirebaseContext] Error code:', err?.code);
      console.error('[FirebaseContext] Error message:', err?.message);
      
      if (err?.code === 'permission-denied') {
        console.error('[FirebaseContext] 🚫 Permission denied - check Firestore rules');
        setError('권한이 없습니다. Firestore 규칙을 확인하세요.');
      } else if (err?.code === 'unavailable') {
        console.error('[FirebaseContext] 📡 Network unavailable');
        setError('네트워크 연결을 확인하세요.');
      } else {
        setError('데이터 로드 실패');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ensureValidUserData = (data: any, userId: string): JewelSpinUserData => {
    console.log('[FirebaseContext] 🔍 Validating user data fields...');
    
    const validData: JewelSpinUserData = {
      userId: data?.userId || userId,
      nickname: data?.nickname || 'JewelSpin 유저',
      jewels: typeof data?.jewels === 'number' ? data.jewels : 0,
      email: data?.email,
      level: typeof data?.level === 'number' ? data.level : 1,
      experience: typeof data?.experience === 'number' ? data.experience : 0,
      lastLogin: data?.lastLogin || new Date().toISOString(),
    };
    
    const missingFields = [];
    if (data?.jewels === undefined) missingFields.push('jewels');
    if (data?.level === undefined) missingFields.push('level');
    if (data?.experience === undefined) missingFields.push('experience');
    
    if (missingFields.length > 0) {
      console.log('[FirebaseContext] ⚠️ Missing fields detected, applied defaults:', missingFields.join(', '));
    } else {
      console.log('[FirebaseContext] ✅ All fields valid');
    }
    
    return validData;
  };

  const refreshUserData = async () => {
    if (isDummyMode) {
      console.log('[FirebaseContext] 🎭 Dummy mode: refresh skipped');
      return;
    }

    if (user) {
      console.log('[FirebaseContext] 🔄 Manual refresh requested, uid:', user.uid);
      await fetchUserData(user.uid);
    } else {
      console.log('[FirebaseContext] ⚠️ Cannot refresh: no authenticated user');
    }
  };

  const updateUserData = async (data: Partial<JewelSpinUserData>) => {
    if (isDummyMode) {
      console.log('[FirebaseContext] 🎭 Dummy mode: updating local data only');
      if (userData) {
        const updatedData = { ...userData, ...data };
        setUserData(updatedData);
        console.log('[FirebaseContext] ✅ Local update successful:', Object.keys(data).join(', '));
      }
      return;
    }

    if (!user) {
      console.error('[FirebaseContext] ❌ Cannot update: no user authenticated');
      return;
    }

    try {
      const updateKeys = Object.keys(data).join(', ');
      console.log('[FirebaseContext] 💾 Updating fields:', updateKeys);
      
      if (!db) {
        throw new Error('Firebase Firestore not initialized');
      }
      const userDocRef = doc(db as Firestore, 'users', user.uid);
      await updateDoc(userDocRef, data);
      
      console.log('[FirebaseContext] ✅ Update successful');
    } catch (err: any) {
      console.error('[FirebaseContext] ❌ Error updating user data');
      console.error('[FirebaseContext] Error code:', err?.code);
      console.error('[FirebaseContext] Error message:', err?.message);
      
      if (err?.code === 'permission-denied') {
        console.error('[FirebaseContext] 🚫 Permission denied - check Firestore rules');
        setError('권한이 없습니다.');
      } else if (err?.code === 'not-found') {
        console.error('[FirebaseContext] 📄 Document not found');
        setError('사용자 데이터를 찾을 수 없습니다.');
      } else {
        setError('데이터 업데이트 실패');
      }
    }
  };

  return {
    user,
    userData,
    isLoading,
    isAuthenticated: isDummyMode ? true : !!user,
    error,
    isDummyMode,
    refreshUserData,
    updateUserData,
  };
});
