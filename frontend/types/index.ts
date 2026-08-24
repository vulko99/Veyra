export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "SELF_EMPLOYED"
  | "CONTRACT"
  | "UNEMPLOYED"
  | "RETIRED"
  | "STUDENT"
  | "OTHER";

export type LoanPurpose =
  | "HOME_IMPROVEMENT"
  | "DEBT_CONSOLIDATION"
  | "VEHICLE"
  | "MEDICAL"
  | "EDUCATION"
  | "TRAVEL"
  | "MAJOR_PURCHASE"
  | "EMERGENCY"
  | "OTHER";

export interface ApplicationDraft {
  requested_amount?: string;
  requested_term_months?: number;
  monthly_income?: string;
  employment_type?: EmploymentType;
  employment_months?: number;
  has_existing_loans?: boolean;
  existing_loan_balance?: string;
  existing_monthly_payments?: string;
  purpose?: LoanPurpose;
  city?: string;
  age_range?: string;
  email?: string;
  phone?: string;
  // tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  source?: string;
  campaign?: string;
}

export interface ConsentInput {
  consent_type: "PLATFORM_PROCESSING" | "PARTNER_DATA_TRANSFER" | "MARKETING";
  accepted: boolean;
  consent_text_version?: string;
}

export interface ApplicationResponse {
  id: string;
  public_reference: string;
  status: string;
  requested_amount: string;
  requested_term_months: number;
}

export interface Match {
  lender_id: string;
  product_id: string;
  lender_name: string;
  product_name: string;
  product_type: string;
  min_amount: string;
  max_amount: string;
  min_term_months: number;
  max_term_months: number;
  currency: string;
  eligible: boolean;
  score: number;
  rank: number;
  reasons: string[];
}

export interface MatchResponse {
  application_id: string;
  matches: Match[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}
