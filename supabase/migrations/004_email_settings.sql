-- =============================================================================
-- Migration 004: Email Flow Settings
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Confirmation email (sent immediately after booking)
  confirmation_enabled    boolean NOT NULL DEFAULT true,
  -- Reminder email (sent X hours before appointment)
  reminder_enabled        boolean NOT NULL DEFAULT true,
  reminder_hours_before   integer NOT NULL DEFAULT 24,
  -- Follow-up email (sent X days after appointment)
  follow_up_enabled       boolean NOT NULL DEFAULT false,
  follow_up_days_after    integer NOT NULL DEFAULT 3,
  follow_up_default_message text NOT NULL DEFAULT 'Thank you for your recent walkthrough! We wanted to follow up and see if you have any questions about your estimate.',
  -- Singleton: only one row
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Reuse existing trigger
CREATE TRIGGER set_email_settings_updated_at
  BEFORE UPDATE ON email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default row
INSERT INTO email_settings (id) VALUES (gen_random_uuid());

-- RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_email_settings"
  ON email_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_update_email_settings"
  ON email_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
