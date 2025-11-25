// AI-CFO Entity types
export interface CfoEntity {
  id: string;
  ledgerEntityId: string;
  name: string;
  createdAt?: string;
}

// AI-CFO Daily Brief types
export interface CfoBrief {
  ledgerEntityId: string;
  asOf: string;
  cash: number;
  runwayDays: number;
  depositsHeld: number;
  gstExposure: number;
  marginPctCurrent: number;
  marginPctPrevious: number;
  marginTrendDelta: number;
  narrative: string;
}

// AI-CFO Alert types
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertCategory = "CASHFLOW" | "GST" | "MARGIN" | "DEPOSITS" | "GENERAL";

export interface CfoAlert {
  id: string;
  ledgerEntityId: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  body: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// AI-CFO Recommendation types
export type RecommendationType = 
  | "ADJUSTMENT_JOURNAL" 
  | "CASH_RESERVE_MOVE" 
  | "GST_RESERVE" 
  | "MARGIN_OPTIMIZATION"
  | "OTHER";

export type RecommendationStatus = "PENDING" | "APPLIED" | "REJECTED";

export interface RecommendationImpact {
  cash?: number;
  equity?: number;
  gst?: number;
  margin?: number;
  description: string;
}

export interface CfoRecommendation {
  id: string;
  ledgerEntityId: string;
  type: RecommendationType;
  status: RecommendationStatus;
  title: string;
  description: string;
  impact: RecommendationImpact;
  createdAt: string;
  appliedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
