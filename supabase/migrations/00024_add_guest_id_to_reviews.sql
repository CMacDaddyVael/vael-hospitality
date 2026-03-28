ALTER TABLE reviews ADD COLUMN guest_id UUID REFERENCES guests(id);
CREATE INDEX idx_reviews_guest ON reviews(guest_id) WHERE guest_id IS NOT NULL AND deleted_at IS NULL;
