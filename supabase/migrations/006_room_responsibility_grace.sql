ALTER TABLE IF EXISTS room_responsibilities
ADD COLUMN IF NOT EXISTS grace_hours NUMERIC(6, 2) NOT NULL DEFAULT 2;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'room_responsibilities_grace_hours_check'
  ) THEN
    ALTER TABLE room_responsibilities
    ADD CONSTRAINT room_responsibilities_grace_hours_check
    CHECK (grace_hours >= 0 AND grace_hours <= 168);
  END IF;
END $$;
