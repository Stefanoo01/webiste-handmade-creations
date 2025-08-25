-- Add new option types and make options mandatory
ALTER TABLE public.product_options 
ADD COLUMN IF NOT EXISTS option_type text NOT NULL DEFAULT 'option_list' 
CHECK (option_type IN ('option_list', 'option_list_multi', 'character', 'input_text', 'image_input', 'image_option_list', 'checkbox'));

-- Add mandatory field
ALTER TABLE public.product_options 
ADD COLUMN IF NOT EXISTS is_mandatory boolean NOT NULL DEFAULT false;

-- Add placeholder field for input_text options
ALTER TABLE public.product_options 
ADD COLUMN IF NOT EXISTS placeholder text;

-- Add validation rules for character options (min/max length)
ALTER TABLE public.product_options 
ADD COLUMN IF NOT EXISTS validation_rules jsonb;

-- Update existing options to use the new type system
UPDATE public.product_options 
SET option_type = CASE 
  WHEN type = 'single' THEN 'option_list'
  WHEN type = 'multi' THEN 'option_list_multi'
  ELSE 'option_list'
END;

-- Drop the old type column
ALTER TABLE public.product_options DROP COLUMN IF EXISTS type;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_options_option_type ON public.product_options(option_type);
CREATE INDEX IF NOT EXISTS idx_product_options_mandatory ON public.product_options(is_mandatory);
