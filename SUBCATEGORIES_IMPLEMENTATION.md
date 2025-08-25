# Subcategories Implementation

This document describes the implementation of subcategories in the handmade catalog project.

## Database Changes

### New Migration Script
A new SQL migration script has been created: `scripts/006_add_subcategories.sql`

This script:
1. Adds a `parent_id` column to the `categories` table
2. Creates an index on `parent_id` for better performance
3. Adds a constraint to prevent circular references
4. The `parent_id` column references the same `categories` table (self-referencing foreign key)

### Database Schema Changes
- **Table**: `categories`
- **New Column**: `parent_id` (UUID, nullable)
- **Foreign Key**: References `categories.id` with CASCADE delete
- **Index**: Created on `parent_id` for query performance
- **Constraint**: Prevents a category from being its own parent

## Application Changes

### Type Updates
- Updated `Category` type in `lib/types.ts` to include `parent_id?: string | null`
- Updated local type definitions in admin components

### Admin Panel Updates

#### Categories Form (`components/admin/categories-form.tsx`)
- Added parent category selector dropdown
- Shows existing categories as options for parent selection
- Displays subcategories with visual indicators (→ parent name)
- Prevents circular references in the UI
- Maintains the same interface for both categories and subcategories

#### Products Form (`components/admin/products-form.tsx`)
- Updated category selector to show hierarchical structure
- Parent categories shown normally
- Subcategories shown with indentation and parent name reference

### Navigation Updates

#### Navbar (`components/navbar.tsx`)
- Updated category dropdown to show hierarchical structure
- Parent categories shown in bold
- Subcategories shown with indentation
- All categories remain clickable and navigate to catalog

#### Catalog Filters (`components/catalog-filters.tsx`)
- Category selector now shows parent categories and subcategories
- Subcategories are visually distinguished with indentation
- Maintains filtering functionality for both categories and subcategories

### Page Updates

#### Home Page (`app/page.tsx`)
- Updated to only show parent categories (categories without `parent_id`)
- Subcategories are not displayed on the home page to avoid clutter

#### Catalog Page (`app/catalog/page.tsx`)
- No changes needed - already handles categories by slug
- Works with both parent categories and subcategories

## How It Works

### Creating Categories
1. **Parent Category**: Leave the parent selector empty or select "Nessuna (categoria principale)"
2. **Subcategory**: Select a parent category from the dropdown

### Database Structure
```
categories table:
- id (UUID, primary key)
- name (text)
- slug (text, unique)
- description (text, nullable)
- parent_id (UUID, nullable, references categories.id)
- created_at (timestamp)
```

### Example Hierarchy
```
Electronics (parent_id: null)
├── Phones (parent_id: electronics-uuid)
├── Laptops (parent_id: electronics-uuid)
└── Accessories (parent_id: electronics-uuid)

Clothing (parent_id: null)
├── Men (parent_id: clothing-uuid)
├── Women (parent_id: clothing-uuid)
└── Kids (parent_id: clothing-uuid)
```

## Benefits

1. **Organized Structure**: Better organization of products by category hierarchy
2. **Flexible Navigation**: Users can browse by main categories or specific subcategories
3. **Scalable**: Easy to add new subcategories without changing the database structure
4. **Backward Compatible**: Existing categories continue to work as before
5. **Admin Friendly**: Single interface manages both categories and subcategories

## Migration Steps

1. Run the SQL migration script: `scripts/006_add_subcategories.sql`
2. Restart the application
3. The admin panel will automatically show the new parent category selector
4. Existing categories will have `parent_id` as `null` (they become parent categories)

## Future Enhancements

- Breadcrumb navigation showing category hierarchy
- Category-specific pages for parent categories
- Product count display per category/subcategory
- Bulk operations for moving categories between parents
