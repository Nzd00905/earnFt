
'use client';

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    writeBatch,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, SiteConfig, Transaction, WithdrawalRequest, Ad } from './types';

// --- AUTH ACTIONS ---

export async function signUp(email: string, password: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        balance: 0,
        role: 'user',
    };

    await setDoc(doc(db, "users", user.uid), newUserProfile);
    
    // Check if this is the very first user. If so, make them an admin.
    const usersSnapshot = await getDocs(collection(db, "users"));
    if (usersSnapshot.size === 1) {
        await updateDoc(doc(db, "users", user.uid), { role: 'admin' });
        newUserProfile.role = 'admin';
    }

    return newUserProfile;
}

export async function logIn(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
        throw new Error("User profile not found.");
    }
    return userProfile;
}

export async function signOut() {
    await firebaseSignOut(auth);
     window.location.href = '/';
}

export function onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const profile = await getUserProfile(user.uid);
            callback(profile);
        } else {
            callback(null);
        }
    });
}

// --- USER ACTIONS ---

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  } else {
    return null;
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
    const configRef = doc(db, "settings", "siteConfig");
    const docSnap = await getDoc(configRef);

    if (docSnap.exists()) {
        return docSnap.data() as SiteConfig;
    } else {
        // Create a default config if it doesn't exist
        const defaultConfig: SiteConfig = {
            websiteName: 'AdWallet',
            withdrawalFee: 1,
            feeTokenName: 'USDT',
            adCreditAmount: 0.5,
            feeDepositAddress: 'YOUR_WALLET_ADDRESS_HERE',
            claimCooldownSeconds: 30,
        };
        await setDoc(configRef, defaultConfig);
        return defaultConfig;
    }
}

export async function watchAd(): Promise<number> {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in.');

    const config = await getSiteConfig();
    const creditAmount = config?.adCreditAmount ?? 0.5;
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if(!userSnap.exists()) throw new Error('User not found.');

    const currentBalance = userSnap.data().balance;
    const newBalance = currentBalance + creditAmount;

    const batch = writeBatch(db);
    batch.update(userRef, { balance: newBalance });

    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        userId: user.uid,
        type: 'earning',
        amount: creditAmount,
        status: 'completed',
        timestamp: new Date(),
        description: `Credit from claiming a token.`
    };
    const txRef = doc(collection(db, "users", user.uid, "transactions"), newTransaction.id);
    batch.set(txRef, newTransaction);
    
    await batch.commit();

    return newBalance;
}

export async function requestWithdrawal(feeTxId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in.');

    const userProfile = await getUserProfile(user.uid);
    const config = await getSiteConfig();

    if (!userProfile || !config) throw new Error('System error, please try again later.');
    if (userProfile.balance <= 0) throw new Error('Insufficient balance to withdraw.');

    const newRequest: WithdrawalRequest = {
        id: `wr-${Date.now()}`,
        userId: user.uid,
        userEmail: userProfile.email,
        amount: userProfile.balance,
        feePaid: config.withdrawalFee,
        feeTxId,
        status: 'pending',
        requestedAt: new Date(),
    };
    await setDoc(doc(db, "withdrawalRequests", newRequest.id), newRequest);
}

export async function getTransactions(): Promise<Transaction[]> {
    const user = auth.currentUser;
    if (!user) return [];
    
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate(),
        } as Transaction;
    });
}

export async function getAds(): Promise<Ad[]> {
    const adsRef = collection(db, "ads");
    const querySnapshot = await getDocs(adsRef);
    if (querySnapshot.empty) {
        // Create default ads if none exist
        const defaultAds: Ad[] = [
            { id: 'ad-1', imageUrl: 'https://placehold.co/600x400.png', altText: 'Advertisement 1', aiHint: 'product advertisement', createdAt: new Date() },
            { id: 'ad-2', imageUrl: 'https://placehold.co/600x400.png', altText: 'Advertisement 2', aiHint: 'travel vacation', createdAt: new Date() },
            { id: 'ad-3', imageUrl: 'https://placehold.co/600x400.png', altText: 'Advertisement 3', aiHint: 'food delivery', createdAt: new Date() },
        ];
        const batch = writeBatch(db);
        defaultAds.forEach(ad => {
            const docRef = doc(db, "ads", ad.id);
            batch.set(docRef, ad);
        });
        await batch.commit();
        return defaultAds;
    }
    return querySnapshot.docs.map(doc => {
         const data = doc.data();
        return {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Ad;
    });
}


// --- ADMIN ACTIONS ---
async function verifyAdmin() {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const profile = await getUserProfile(user.uid);
    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return profile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    await verifyAdmin();
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function getWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    await verifyAdmin();
    const requestsRef = collection(db, "withdrawalRequests");
    const q = query(requestsRef, orderBy("requestedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            requestedAt: (data.requestedAt as Timestamp).toDate(),
            completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
        } as WithdrawalRequest;
    });
}

export async function updateSiteConfig(newConfig: Partial<SiteConfig>) {
    await verifyAdmin();
    const configRef = doc(db, "settings", "siteConfig");
    await updateDoc(configRef, newConfig);
}

export async function completeWithdrawal(requestId: string) {
    await verifyAdmin();

    const requestRef = doc(db, "withdrawalRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) throw new Error("Request not found.");
    
    const request = requestSnap.data() as WithdrawalRequest;
    if (request.status === 'completed') throw new Error("Request already completed.");
    
    const userRef = doc(db, "users", request.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("User not found.");

    const withdrawalAmount = request.amount;
    
    const batch = writeBatch(db);

    batch.update(userRef, { balance: 0 });
    batch.update(requestRef, { status: 'completed', completedAt: new Date() });

    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        userId: request.userId,
        type: 'withdrawal-payout',
        amount: withdrawalAmount,
        status: 'completed',
        timestamp: new Date(),
        description: `Withdrawal of $${withdrawalAmount.toFixed(2)} completed.`
    };
    const txRef = doc(collection(db, "users", request.userId, "transactions"), newTransaction.id);
    batch.set(txRef, newTransaction);
    
    await batch.commit();
}
