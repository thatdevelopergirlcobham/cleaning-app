export type Report = {
  id: string;
  title: string;
  description: string;
  category?: string;
  image_url?: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  user_id: string;
  created_at: string;
};
