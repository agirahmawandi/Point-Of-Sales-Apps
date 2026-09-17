-- Script Perbaikan Izin Akses Tabel (Supabase 403 Forbidden)
GRANT ALL ON TABLE public.cash_mutations TO anon;
GRANT ALL ON TABLE public.cash_mutations TO authenticated;
GRANT ALL ON TABLE public.cash_mutations TO service_role;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cash_mutations;
CREATE POLICY "Enable all access for authenticated users" ON cash_mutations FOR ALL USING (true) WITH CHECK (true);
