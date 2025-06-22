/*
Warnings:

- A unique constraint covering the columns `[organization_id,code]` on the table `buildings` will be added. If there are existing duplicate values, this will fail.
- Added the required column `code` to the `buildings` table without a default value. This is not possible if the table is not empty.

 */

-- Create a function to generate unique 8-character uppercase building codes
CREATE OR REPLACE FUNCTION generate_building_code(org_id TEXT) RETURNS TEXT AS $$
DECLARE
    code_candidate TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8 random uppercase letters
        code_candidate := array_to_string(
            ARRAY(
                SELECT chr(65 + floor(random() * 26)::int) 
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

-- Add the code column with a temporary default
ALTER TABLE "buildings" ADD COLUMN "code" TEXT DEFAULT 'TEMP';

-- Update existing buildings with generated codes
UPDATE "buildings" 
SET "code" = generate_building_code("organization_id");

-- Remove the default and make the column NOT NULL
ALTER TABLE "buildings" ALTER COLUMN "code" DROP DEFAULT;
ALTER TABLE "buildings" ALTER COLUMN "code" SET NOT NULL;

-- Create indexes
CREATE INDEX "buildings_code_idx" ON "buildings"("code");
CREATE UNIQUE INDEX "buildings_organization_id_code_key" ON "buildings"("organization_id", "code");

-- Drop the helper function as it's no longer needed
DROP FUNCTION generate_building_code(TEXT);