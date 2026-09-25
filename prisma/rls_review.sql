-- REVIEW ONLY. Do not apply before inspecting the existing Supabase grants/RLS.
-- Public reads are limited to published/searchable business discovery data.
-- Admin writes must go through an authenticated server API using a server-only secret.

ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Taxonomy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessTaxonomy" ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON "Business", "Location", "Taxonomy", "BusinessLocation", "BusinessTaxonomy" FROM anon, authenticated;

CREATE POLICY "public_read_published_businesses" ON "Business"
  FOR SELECT TO anon, authenticated
  USING ("publicationStatus" = 'PUBLISHED' AND "isSearchable" = true);

CREATE POLICY "public_read_active_locations" ON "Location"
  FOR SELECT TO anon, authenticated
  USING ("isActive" = true);

CREATE POLICY "public_read_active_taxonomy" ON "Taxonomy"
  FOR SELECT TO anon, authenticated
  USING ("isActive" = true);

CREATE POLICY "public_read_business_locations" ON "BusinessLocation"
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM "Business" b WHERE b.id = "businessId" AND b."publicationStatus" = 'PUBLISHED' AND b."isSearchable" = true));

CREATE POLICY "public_read_business_taxonomies" ON "BusinessTaxonomy"
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM "Business" b WHERE b.id = "businessId" AND b."publicationStatus" = 'PUBLISHED' AND b."isSearchable" = true));
