-- =============================================================================
-- Migration 003: QR Codes & Scan Tracking
-- =============================================================================

-- ---------------------------------------------------------------------------
-- QR Codes table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  label       text NOT NULL,
  target_url  text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- slug format: lowercase alphanumeric + hyphens, 2-50 chars
  CONSTRAINT qr_codes_slug_format CHECK (slug ~ '^[a-z0-9\-]{2,50}$')
);

-- Reuse the existing update_updated_at() trigger from migration 002
CREATE TRIGGER set_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- QR Scans table (tracks each scan of a QR code)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_scans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id  uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at  timestamptz NOT NULL DEFAULT now(),
  user_agent  text,
  referrer    text,
  ip_address  inet
);

CREATE INDEX idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- qr_codes: anon can SELECT active codes only (for redirect route)
CREATE POLICY "anon_select_active_qr_codes"
  ON qr_codes FOR SELECT
  TO anon
  USING (is_active = true);

-- qr_codes: authenticated users get full CRUD
CREATE POLICY "authenticated_select_qr_codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_qr_codes"
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_qr_codes"
  ON qr_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_qr_codes"
  ON qr_codes FOR DELETE
  TO authenticated
  USING (true);

-- qr_scans: anon can INSERT (redirect route logs scans)
CREATE POLICY "anon_insert_qr_scans"
  ON qr_scans FOR INSERT
  TO anon
  WITH CHECK (true);

-- qr_scans: authenticated users can SELECT (view analytics)
CREATE POLICY "authenticated_select_qr_scans"
  ON qr_scans FOR SELECT
  TO authenticated
  USING (true);
