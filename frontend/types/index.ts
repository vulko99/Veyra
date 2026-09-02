export type EmploymentType =
  | "employed"
  | "self_employed"
  | "business_owner"
  | "pensioner"
  | "other";

export interface ApplicationDraft {
  requested_amount?: string;
  requested_term_months?: number;
  monthly_income?: string;
  employment_type?: EmploymentType;
  employment_months?: number;
  has_existing_loans?: boolean;
  existing_loan_balance?: string;
  existing_monthly_payments?: string;
  purpose?: string;
  city?: string;
  age_range?: string;
  full_name?: string;
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

export interface ConsentFlags {
  privacy_processing_consent: boolean;
  partner_data_sharing_consent: boolean;
  marketing_consent: boolean;
}

export interface Phase2Applicant {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  monthly_income_eur: string | null;
  employment_status: string;
  existing_monthly_obligations_eur: string | null;
}

export interface Phase2Application {
  id: string; // VY- public id
  status: string;
  current_step: string;
  desired_amount_eur: string | null;
  desired_term_months: number | null;
  requested_currency: string;
  applicant: Phase2Applicant | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ReasonPayload {
  code: string;
  params: Record<string, string | number>;
  text: string;
}

export interface Phase2Match {
  partner: string;
  partner_slug: string;
  product: string;
  product_id: string;
  product_type: string;
  min_amount_eur: string;
  max_amount_eur: string;
  min_term_months: number;
  max_term_months: number;
  match: boolean;
  ranking: number;
  priority: number;
  /** Whether this partner requires the applicant's EGN to proceed. */
  egn_required?: boolean;
  is_demo?: boolean;
  /** Compatibility score (0–100) against published criteria. NOT an approval probability. */
  compatibility_score?: number;
  reasons: ReasonPayload[];
}

export interface Phase2MatchResponse {
  application_id: string;
  matches: Phase2Match[];
}

export interface ReferralResponse {
  referral_id: string;
  partner: string;
  product: string;
  referral_status: string;
  outbound_url: string;
}

export interface SelectionPartner {
  lender_id: string;
  partner: string;
  product: string;
  egn_required: boolean;
  is_demo: boolean;
}

export interface SelectionResponse {
  application_id: string;
  selected_partners: SelectionPartner[];
  egn_required: boolean;
  egn_provided: boolean;
  egn_masked: string;
  privacy_notice_version: string;
}

export interface IdentityResponse {
  application_id: string;
  egn_provided: boolean;
  egn_masked: string;
}

export interface SubmissionResult {
  partner: string;
  status: string;
  external_application_id: string;
  demo: boolean;
}

export interface SubmitResponse {
  application_id: string;
  submissions: SubmissionResult[];
}
