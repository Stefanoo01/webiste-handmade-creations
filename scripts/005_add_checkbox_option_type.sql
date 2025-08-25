-- Add checkbox option type to existing product_options table
-- This script assumes you've already run the main migration (004_add_new_option_types.sql)

-- Update the check constraint to include 'checkbox'
ALTER TABLE public.product_options 
DROP CONSTRAINT IF EXISTS product_options_option_type_check;

ALTER TABLE public.product_options 
ADD CONSTRAINT product_options_option_type_check 
CHECK (option_type IN ('option_list', 'option_list_multi', 'character', 'input_text', 'image_input', 'image_option_list', 'checkbox'));

-- Verify the change
SELECT option_type, COUNT(*) 
FROM public.product_options 
GROUP BY option_type;
