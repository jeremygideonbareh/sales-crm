export interface UserResponse {
  id: number
  email: string
  full_name: string
  role: 'manager' | 'rep'
  is_active: boolean
}

export interface LeadResponse {
  id: number
  business_name: string
  contact_name: string
  phone: string
  email: string | null
  website: string | null
  notes: string | null
  status: string
  assigned_to: number | null
  deal_value: number | null
  commission: number | null
  created_at: string | null
  updated_at: string | null
}

export interface NextLeadResponse {
  lead: LeadResponse | null
  queue_remaining: number
}

export interface KPI {
  total_calls: number
  total_deals: number
  success_rate: number
  total_commission_owed: number
  total_leads: number
  active_reps: number
}

export interface RepMetric {
  rep_id: number
  rep_name: string
  total_calls: number
  deals_closed: number
  success_rate: number
  commission_owed: number
  leads_assigned: number
}

export interface StatusDistribution {
  status: string
  count: number
}

export interface DashboardData {
  kpi: KPI
  by_rep: RepMetric[]
  status_distribution: StatusDistribution[]
}

// Pipeline stages
export type PipelineStatus =
  | 'uncalled' | 'no_answer' | 'not_interested' | 'interested'
  | 'demo_scheduled' | 'demo_completed' | 'negotiation'
  | 'onboarding' | 'deposit_paid' | 'in_progress' | 'deal_closed'

// Demo Request
export interface DemoRequestResponse {
  id: number
  lead_id: number
  rep_id: number
  title: string
  description: string | null
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
  scheduled_date: string | null
  completed_date: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  business_name: string | null
  contact_name: string | null
}

// Handover
export interface HandoverResponse {
  id: number
  lead_id: number
  handed_over_by: number
  assigned_to: number | null
  notes: string | null
  handover_details: string | null
  status: 'pending' | 'completed'
  client_brief: string | null
  requirements: string | null
  design_preferences: string | null
  budget: number | null
  timeline_notes: string | null
  created_at: string | null
  completed_at: string | null
  business_name: string | null
  contact_name: string | null
}

// Leaderboard
export interface LeaderboardEntry {
  rep_id: number
  rep_name: string
  deals_closed: number
  total_commission: number
  success_rate: number
  total_calls: number
  total_leads_assigned: number
  active_pipeline_count: number
  rank: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}

// Rep Dashboard
export interface RepDashboardResponse {
  rep_id: number
  rep_name: string
  total_calls: number
  total_deals: number
  success_rate: number
  commission_owed: number
  leads_assigned: number
  pipeline_stages: StatusDistribution[]
  recent_activity: Array<{
    id: number
    type: string
    business_name: string
    status: string
    timestamp: string
  }>
}

// Pipeline overview for manager
export interface PipelineStageItem {
  status: string
  label: string
  count: number
  leads: LeadResponse[]
}

export interface PipelineOverviewResponse {
  stages: PipelineStageItem[]
}

// Notifications
export interface NotificationResponse {
  id: number
  user_id: number
  type: string
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string | null
}

export interface UnreadCountResponse {
  count: number
}

// Email Sequences
export interface SequenceStepItem {
  id?: number
  sequence_id?: number
  step_order: number
  step_type: 'delay' | 'send_email' | 'condition' | 'update_stage' | 'notify'
  delay_days?: number | null
  email_subject?: string | null
  email_body?: string | null
  condition_field?: string | null
  condition_value?: string | null
  target_stage?: string | null
  notify_role?: string | null
}

export interface EmailSequence {
  id: number
  name: string
  description: string | null
  trigger: string
  trigger_stage: string | null
  is_active: boolean
  created_by: number
  created_at: string | null
  updated_at: string | null
  steps: SequenceStepItem[]
}

export interface EmailLogItem {
  id: number
  sequence_id: number | null
  step_id: number | null
  lead_id: number
  sent_by: number | null
  recipient_email: string
  subject: string
  status: string
  opened_at: string | null
  clicked_at: string | null
  replied_at: string | null
  error_message: string | null
  created_at: string | null
}
