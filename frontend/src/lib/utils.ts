import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LEAD_STATUS = {
  uncalled: { label: 'Uncalled', color: 'text-muted-foreground', bg: 'bg-muted' },
  no_answer: { label: 'No Answer', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  not_interested: { label: 'Not Interested', color: 'text-red-400', bg: 'bg-red-900/20' },
  interested: { label: 'Interested', color: 'text-sky-400', bg: 'bg-sky-900/20' },
  demo_scheduled: { label: 'Demo Scheduled', color: 'text-purple-400', bg: 'bg-purple-900/20' },
  demo_completed: { label: 'Demo Completed', color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  negotiation: { label: 'Negotiation', color: 'text-orange-400', bg: 'bg-orange-900/20' },
  onboarding: { label: 'Onboarding', color: 'text-teal-400', bg: 'bg-teal-900/20' },
  deposit_paid: { label: 'Deposit Paid', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  deal_closed: { label: 'Deal Closed', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  pitching: { label: 'Pitching', color: 'text-blue-400', bg: 'bg-blue-900/20' },
} as const

export type LeadStatus = keyof typeof LEAD_STATUS
