export interface UserProfile {
  uid: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earning' | 'withdrawal-fee' | 'withdrawal-payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  description: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  feePaid: number;
  feeTxId: string;
  status: 'pending' | 'completed';
  requestedAt: Date;
  completedAt?: Date;
}

export interface SiteConfig {
  websiteName: string;
  withdrawalFee: number;
  feeTokenName: string;
  adCreditAmount: number;
  feeDepositAddress: string;
  claimCooldownSeconds: number;
}

export interface Ad {
  id: string;
  imageUrl: string;
  altText: string;
  aiHint: string;
  createdAt: Date;
}
