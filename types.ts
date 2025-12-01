
export interface PreflightCheck {
  id: 'bleed';
  name: string;
  details: string;
  status: 'pass' | 'warn' | 'fail';
}

export interface PreflightResult {
  fileName: string;
  pageCount: number;
  previewUrl: string;
  dimensions: {
    inches: string;
    metric: string;
  };
  checks: PreflightCheck[];
}

export type WorkflowStep = 'upload' | 'preflight' | 'payment' | 'processing' | 'complete' | 'error';

// Admin Panel Types
export interface AdminUser {
  id: string;
  email: string;
  plan: 'Free' | 'Pro';
  joinDate: string;
  subscriptionStatus: 'active' | 'canceled';
  processedFiles: Array<{
    id: string;
    fileName: string;
    processedDate: string;
    status: 'Completed' | 'Failed';
  }>;
}

export interface Transaction {
  id: string;
  date: string;
  customerEmail: string;
  amount: number;
  status: 'Succeeded' | 'Refunded' | 'Failed';
}

export interface RecentActivity {
    id: string;
    userEmail: string;
    action: string;
    timestamp: string;
}