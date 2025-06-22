-- This is an empty migration.

-- Update building codes to use alphanumeric characters (A-Z, 0-9)

-- Create a function to generate unique 8-character alphanumeric building codes
CREATE OR REPLACE FUNCTION generate_alphanumeric_building_code(org_id TEXT) RETURNS TEXT AS $$
DECLARE
    code_candidate TEXT;
    code_exists BOOLEAN;
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    chars_length INTEGER := 36;
BEGIN
    LOOP
        -- Generate 8 random alphanumeric characters (A-Z, 0-9)
        code_candidate := array_to_string(
            ARRAY(
                SELECT substr(chars, floor(random() * chars_length)::int + 1, 1)
                FROM generate_series(1, 8)
            ), 
            ''
        );
        
        -- Check if code already exists for this organization
        SELECT EXISTS(
            SELECT 1 FROM buildings 
            WHERE organization_id = org_id AND code = code_candidate
        ) INTO code_exists;
        
        -- If code doesn't exist, return it
        IF NOT code_exists THEN
            RETURN code_candidate;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Regenerate codes for all existing buildings with alphanumeric characters
UPDATE "buildings" 
SET "code" = generate_alphanumeric_building_code("organization_id");

-- Drop the helper function as it's no longer needed
DROP FUNCTION generate_alphanumeric_building_code(TEXT);