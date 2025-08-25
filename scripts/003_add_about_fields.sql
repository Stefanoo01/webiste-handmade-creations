-- Add about fields to existing config table
-- Run this script if you already have a config table with data

ALTER TABLE public.config 
ADD COLUMN IF NOT EXISTS about_title text,
ADD COLUMN IF NOT EXISTS about_description text,
ADD COLUMN IF NOT EXISTS about_image_url text;

-- Update existing config record if it exists
UPDATE public.config 
SET 
    about_title = 'Chi sono',
    about_description = 'Benvenuti nel mio laboratorio creativo! Sono un artigiano appassionato che trasforma idee semplici in opere d''arte uniche. Ogni pezzo che creo racconta una storia e porta con sé l''amore per il lavoro manuale e la creatività.',
    about_image_url = '/placeholder-wc4qd.png'
WHERE id = 1;
