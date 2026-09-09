-- supabase-seed.sql
-- Seed script for MOTOLOGA Database

-- 1. Create the Garage (Replace <YOUR_OWNER_ID> after signing up!)
INSERT INTO public.garages (id, owner_id, name)
VALUES (
    gen_random_uuid(),
    '<YOUR_OWNER_ID>', 
    'Motologa Test Garage'
);

-- 2. Create the Mechanic
INSERT INTO public.mechanics (id, garage_id, name, pin_code, color_badge)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM public.garages WHERE name = 'Motologa Test Garage' LIMIT 1),
    'Jean',
    '1234',
    'blue'
);
