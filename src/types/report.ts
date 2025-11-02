export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'resolved';
export type ReportPriority = ReportSeverity;

export interface Report {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  image_url?: string;
  location?: { lat: number; lng: number } | string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  type?: string | null;
  severity?: ReportSeverity | null;
  category?: string | null;
  priority?: ReportPriority | null;
  is_anonymous?: boolean;
  locationText?: string;
}