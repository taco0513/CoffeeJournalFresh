-- Admin seed data for coffee_catalog table
-- Run this in Supabase SQL Editor to populate initial coffee data

-- Popular Korean Coffee Roasters and their coffees
INSERT INTO coffee_catalog (
  roastery,
  coffee_name,
  origin,
  region,
  variety,
  process,
  altitude,
  harvest_year,
  verified_by_moderator,
  first_added_by
) VALUES 
-- Fritz Coffee Company
('Fritz Coffee Company', 'Ethiopia Yirgacheffe G1', 'Ethiopia', 'Yirgacheffe', 'Heirloom', 'Washed', '1,900-2,100m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Fritz Coffee Company', 'Colombia Geisha', 'Colombia', 'Huila', 'Geisha', 'Washed', '1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Fritz Coffee Company', 'Kenya AA Nyeri', 'Kenya', 'Nyeri', 'SL28, SL34', 'Washed', '1,700-1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Fritz Coffee Company', 'Guatemala Antigua', 'Guatemala', 'Antigua', 'Bourbon', 'Washed', '1,500-1,700m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Momos Coffee
('Momos Coffee', 'Ethiopia Sidamo G2', 'Ethiopia', 'Sidamo', 'Heirloom', 'Natural', '1,850-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Momos Coffee', 'Colombia Supremo', 'Colombia', 'Narino', 'Castillo', 'Washed', '1,800-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Momos Coffee', 'Brazil Santos', 'Brazil', 'Minas Gerais', 'Bourbon', 'Natural', '1,100-1,300m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Momos Coffee', 'Costa Rica Tarrazu', 'Costa Rica', 'Tarrazu', 'Caturra, Catuai', 'Honey', '1,500-1,900m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Center Coffee
('Center Coffee', 'Ethiopia Guji Natural', 'Ethiopia', 'Guji', 'Heirloom', 'Natural', '2,000-2,200m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Center Coffee', 'Colombia Pink Bourbon', 'Colombia', 'Huila', 'Pink Bourbon', 'Washed', '1,750m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Center Coffee', 'Panama Geisha', 'Panama', 'Boquete', 'Geisha', 'Washed', '1,600-1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Center Coffee', 'Rwanda Bourbon', 'Rwanda', 'Nyamasheke', 'Red Bourbon', 'Washed', '1,700-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Felt Coffee
('Felt Coffee', 'Ethiopia Kochere', 'Ethiopia', 'Kochere', 'Heirloom', 'Washed', '1,800-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Felt Coffee', 'Colombia Huila', 'Colombia', 'Huila', 'Caturra', 'Washed', '1,700-1,900m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Felt Coffee', 'Peru Cajamarca', 'Peru', 'Cajamarca', 'Typica, Caturra', 'Washed', '1,600-1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Felt Coffee', 'Honduras SHG', 'Honduras', 'Marcala', 'Bourbon, Catuai', 'Washed', '1,400-1,700m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Coffee Libre
('Coffee Libre', 'Ethiopia Aricha Natural', 'Ethiopia', 'Aricha', 'Heirloom', 'Natural', '1,900-2,100m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Libre', 'Colombia Decaf', 'Colombia', 'Various', 'Various', 'Swiss Water Process', '1,500-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Libre', 'Brazil Pulped Natural', 'Brazil', 'Sul de Minas', 'Yellow Bourbon', 'Pulped Natural', '1,000-1,200m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Libre', 'Guatemala Huehuetenango', 'Guatemala', 'Huehuetenango', 'Bourbon, Caturra', 'Washed', '1,500-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Namusairo Coffee
('Namusairo Coffee', 'Ethiopia Hambela', 'Ethiopia', 'Hambela', 'Heirloom', 'Natural', '2,000-2,200m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Namusairo Coffee', 'Colombia Tabi', 'Colombia', 'Tolima', 'Tabi', 'Washed', '1,700-1,900m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Namusairo Coffee', 'Kenya Kiambu AA', 'Kenya', 'Kiambu', 'SL28, SL34', 'Washed', '1,600-1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Namusairo Coffee', 'El Salvador Pacamara', 'El Salvador', 'Santa Ana', 'Pacamara', 'Honey', '1,400-1,600m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Blue Bottle Coffee
('Blue Bottle Coffee', 'Three Africas', 'Blend', 'Various', 'Various', 'Various', 'Various', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Blue Bottle Coffee', 'Giant Steps', 'Blend', 'Various', 'Various', 'Various', 'Various', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Blue Bottle Coffee', 'Bella Donovan', 'Blend', 'Various', 'Various', 'Natural', 'Various', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Blue Bottle Coffee', 'Hayes Valley Espresso', 'Blend', 'Various', 'Various', 'Various', 'Various', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Coffee Bean & Tea Leaf
('Coffee Bean & Tea Leaf', 'Costa Rica La Cascada', 'Costa Rica', 'Tarrazu', 'Caturra', 'Washed', '1,400-1,600m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Bean & Tea Leaf', 'Jamaica Blue Mountain', 'Jamaica', 'Blue Mountain', 'Typica', 'Washed', '900-1,500m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Bean & Tea Leaf', 'Hawaii Kona', 'Hawaii', 'Kona', 'Typica', 'Washed', '600-900m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Coffee Bean & Tea Leaf', 'Colombia Supremo Dark', 'Colombia', 'Various', 'Various', 'Washed', '1,200-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),

-- Terarosa Coffee
('Terarosa Coffee', 'Ethiopia Yirgacheffe Konga', 'Ethiopia', 'Yirgacheffe', 'Heirloom', 'Natural', '1,800-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Terarosa Coffee', 'Colombia La Esperanza', 'Colombia', 'Tolima', 'Geisha', 'Washed', '1,800m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Terarosa Coffee', 'Guatemala Finca El Injerto', 'Guatemala', 'Huehuetenango', 'Bourbon', 'Washed', '1,500-2,000m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com')),
('Terarosa Coffee', 'Kenya Gichathaini AA', 'Kenya', 'Nyeri', 'SL28, SL34', 'Washed', '1,700-1,900m', 2024, true, (SELECT id FROM auth.users WHERE email = 'hello@zimojin.com'));

-- Add more roasteries and coffees as needed...

-- Update statistics
UPDATE coffee_catalog 
SET 
  avg_rating = 4.0 + (RANDOM() * 1), -- Random rating between 4.0-5.0
  total_reviews = FLOOR(RANDOM() * 100 + 10) -- Random reviews between 10-110
WHERE verified_by_moderator = true;

-- Create sample common flavor notes
UPDATE coffee_catalog 
SET common_flavor_notes = 
  CASE 
    WHEN origin = 'Ethiopia' THEN ARRAY['Blueberry', 'Floral', 'Citrus', 'Wine-like']
    WHEN origin = 'Colombia' THEN ARRAY['Chocolate', 'Caramel', 'Red Apple', 'Brown Sugar']
    WHEN origin = 'Kenya' THEN ARRAY['Black Currant', 'Tomato', 'Wine', 'Bright Acidity']
    WHEN origin = 'Brazil' THEN ARRAY['Chocolate', 'Nutty', 'Low Acidity', 'Creamy']
    WHEN origin = 'Guatemala' THEN ARRAY['Chocolate', 'Spice', 'Orange', 'Brown Sugar']
    WHEN origin = 'Costa Rica' THEN ARRAY['Honey', 'Orange', 'Chocolate', 'Clean']
    WHEN origin = 'Panama' THEN ARRAY['Jasmine', 'Tropical Fruit', 'Honey', 'Complex']
    ELSE ARRAY['Balanced', 'Sweet', 'Clean', 'Smooth']
  END
WHERE verified_by_moderator = true;

-- View the imported data
SELECT roastery, COUNT(*) as coffee_count 
FROM coffee_catalog 
WHERE verified_by_moderator = true 
GROUP BY roastery 
ORDER BY coffee_count DESC;