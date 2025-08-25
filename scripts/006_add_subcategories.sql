-- Add subcategory support to categories table
-- Add parent_id column to reference parent category
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create index for better performance on parent_id queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Add constraint to prevent circular references (a category cannot be its own parent)
ALTER TABLE public.categories ADD CONSTRAINT check_categories_no_self_parent CHECK (id != parent_id);

-- Update RLS policies to handle parent_id
-- The existing policies should work fine since we're just adding a reference column
