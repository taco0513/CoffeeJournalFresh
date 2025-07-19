-- Admin notifications table for coffee catalog management
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_coffee_review', 'coffee_edit_review', 'user_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data like coffee_id, user_id, etc.
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Index for admin queries
CREATE INDEX idx_admin_notifications_unread ON admin_notifications(is_read, created_at DESC);
CREATE INDEX idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- RLS for admin notifications (only admins can read/write)
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- You can implement your own admin check logic here
  -- For example, check if user email is in admin list
  RETURN auth.email() IN ('hello@zimojin.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin notifications
CREATE POLICY "Only admins can view notifications" ON admin_notifications
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Only admins can update notifications" ON admin_notifications
  FOR UPDATE
  USING (is_admin());

-- Allow any authenticated user to create notifications (for new coffee submissions)
CREATE POLICY "Authenticated users can create notifications" ON admin_notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function to notify admins when new coffee is added
CREATE OR REPLACE FUNCTION notify_admin_new_coffee()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if coffee is not verified
  IF NEW.verified_by_moderator = false THEN
    INSERT INTO admin_notifications (
      type,
      title,
      message,
      data,
      created_by
    ) VALUES (
      'new_coffee_review',
      'New Coffee Added',
      format('%s - %s needs review', NEW.roastery, NEW.coffee_name),
      jsonb_build_object('coffee_id', NEW.id),
      NEW.first_added_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when new coffee is added
CREATE TRIGGER coffee_catalog_admin_notification
  AFTER INSERT ON coffee_catalog
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_coffee();

-- View for admin dashboard (unresolved notifications count)
CREATE OR REPLACE VIEW admin_notification_stats AS
SELECT 
  COUNT(*) FILTER (WHERE NOT is_read) as unread_count,
  COUNT(*) FILTER (WHERE NOT is_resolved) as unresolved_count,
  COUNT(*) FILTER (WHERE type = 'new_coffee_review' AND NOT is_resolved) as pending_coffee_reviews
FROM admin_notifications;