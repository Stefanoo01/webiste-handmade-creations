# Product Option Types

This document describes the new product option types available in the handmade catalog system.

## Overview

The system now supports 6 different types of product options, each designed for different customization needs:

## Option Types

### 1. Option List (Single Selection)
- **Type**: `option_list`
- **Description**: User selects one item from a predefined list
- **Use Case**: Colors, sizes, etc.
- **Features**: 
  - Can have associated images
  - Can have price deltas
  - Supports mandatory/optional selection

### 2. Option List Multi (Multiple Selection)
- **Type**: `option_list_multi`
- **Description**: User can select one or more items from a predefined list
- **Use Case**: Multiple toppings, features, add-ons, etc.
- **Features**:
  - Can have associated images
  - Can have price deltas
  - Supports mandatory/optional selection

### 3. Character (Alphabetic Selection)
- **Type**: `character`
- **Description**: Automatically generates a list of all alphabetic letters (A-Z) for user selection
- **Use Case**: Monogramming, letter selection, etc.
- **Features**:
  - No need to manually add values
  - Supports mandatory/optional selection
  - No price deltas (base price only)

### 4. Input Text
- **Type**: `input_text`
- **Description**: User can type custom text
- **Use Case**: Custom names, messages, descriptions, etc.
- **Features**:
  - Customizable placeholder text
  - Validation rules (min/max character length)
  - Supports mandatory/optional selection
  - No price deltas

### 5. Image Input
- **Type**: `image_input`
- **Description**: User can upload a single image
- **Use Case**: Custom image uploads, personal photos, etc.
- **Features**:
  - File upload interface
  - Supports mandatory/optional selection
  - No price deltas
  - No predefined values needed

### 6. Image Option List
- **Type**: `image_option_list`
- **Description**: User selects one image from a predefined list of images
- **Use Case**: Pattern selection, design choices, etc.
- **Features**:
  - Grid display of images
  - Can have associated text values
  - Can have price deltas
  - Supports mandatory/optional selection

### 7. Checkbox
- **Type**: `checkbox`
- **Description**: Simple yes/no selection
- **Use Case**: Additional services, warranty options, gift wrapping, etc.
- **Features**:
  - Simple boolean selection
  - Supports mandatory/optional selection
  - No price deltas
  - No predefined values needed

## Common Features

### Mandatory Options
- All option types can be marked as mandatory
- Users must complete mandatory options before adding to cart
- Visual indicators show which options are required

### Price Deltas
- Available for: `option_list`, `option_list_multi`, `image_option_list`
- Not available for: `character`, `input_text`, `image_input`
- Price deltas are added to the base product price

### Image Support
- Available for: `option_list`, `option_list_multi`, `image_option_list`
- Images are displayed alongside option values
- Supports product customization preview

## Admin Panel Usage

### Adding Options
1. Go to Admin Panel > Products
2. Create or edit a product
3. In the "Opzioni & Valori" section, click "Aggiungi opzione"
4. Configure the option:
   - **Name**: Display name for the option
   - **Type**: Select from the 6 option types
   - **Mandatory**: Check if the option is required
   - **Placeholder**: For text inputs (optional)
   - **Validation Rules**: Min/max character length for text inputs

### Adding Values (for applicable types)
- Only needed for: `option_list`, `option_list_multi`, `image_option_list`
- Each value can have:
  - Text value
  - Associated image
  - Price delta

### Configuration Examples

#### Character Option
```
Name: Initial
Type: character
Mandatory: true
```

#### Text Input Option
```
Name: Custom Message
Type: input_text
Mandatory: false
Placeholder: Enter your message here
Validation Rules: Min 5, Max 100 characters
```

#### Image Option List
```
Name: Pattern
Type: image_option_list
Mandatory: true
Values: 
  - Value: Floral, Image: floral.jpg, Price: +5.00
  - Value: Geometric, Image: geometric.jpg, Price: +3.00
```

## Frontend Display

### User Experience
- Options are displayed in a clean, organized layout
- Mandatory options are clearly marked with asterisks (*)
- Validation errors are shown for incomplete mandatory fields
- Price updates are calculated in real-time
- Image previews are available for relevant options

### Responsive Design
- All option types work on mobile and desktop
- Image grids adapt to screen size
- Touch-friendly interface for mobile users

## Technical Implementation

### Database Schema
- New `option_type` field replaces old `type` field
- Added `is_mandatory` boolean field
- Added `placeholder` text field
- Added `validation_rules` JSON field

### Component Architecture
- `ProductOptionsSelector`: Main component for rendering options
- `VariantSelector`: Wrapper component for options
- `ProductSnipcartButton`: Handles cart integration

### State Management
- Options state is managed locally in each component
- URL parameters are updated for shareable links
- Price calculations are performed in real-time

## Migration Notes

### Existing Products
- Old options with `type: 'single'` are automatically converted to `option_type: 'option_list'`
- Old options with `type: 'multi'` are automatically converted to `option_type: 'option_list_multi'`
- All existing options are set to `is_mandatory: false` by default

### Database Updates
- Run the migration script: `scripts/004_add_new_option_types.sql`
- This script is safe to run multiple times
- No data loss occurs during migration

## Best Practices

### Option Naming
- Use clear, descriptive names
- Keep names short but informative
- Use consistent naming conventions

### Mandatory Options
- Only mark options as mandatory when absolutely necessary
- Consider user experience - too many mandatory fields can be frustrating
- Provide clear instructions for mandatory options

### Image Management
- Use appropriate image sizes (recommended: 200x200px for thumbnails)
- Optimize images for web use
- Provide meaningful alt text for accessibility

### Price Deltas
- Keep price deltas reasonable
- Consider the impact on final product price
- Test pricing logic thoroughly

## Troubleshooting

### Common Issues
1. **Options not displaying**: Check if option type is correctly set
2. **Images not showing**: Verify image URLs and storage permissions
3. **Price not updating**: Ensure price deltas are numeric values
4. **Validation errors**: Check min/max character limits

### Debug Tips
- Check browser console for JavaScript errors
- Verify database schema matches expected structure
- Test with different option combinations
- Validate URL parameters are correctly formatted
