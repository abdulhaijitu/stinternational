# Bilingual Testing Checklist

## Purpose
This checklist ensures complete bilingual consistency across the entire application when switching between English and Bangla languages.

---

## How to Test

1. **Login** to the application (admin or customer account)
2. **Use the Language Switcher** (globe icon in header for frontend, dropdown in admin sidebar)
3. **Verify each item** displays correctly in both languages
4. **Check font rendering**: Bangla text should use "Hind Siliguri" font family

---

## Admin Panel Pages

### ✅ Dashboard (`/admin`)
- [ ] Page title and subtitle
- [ ] Stat cards (Total Products, Orders, Quotes, Revenue)
- [ ] B2C/B2B section labels
- [ ] Recent Orders table headers
- [ ] Recent Quotes table headers
- [ ] Status badges (Pending, Paid, Processing, etc.)
- [ ] CTA Analytics Widget labels

### ✅ Products (`/admin/products`)
- [ ] Page title and subtitle
- [ ] "Add Product" button
- [ ] Search placeholder
- [ ] Bulk Import dialog (all steps, buttons)
- [ ] Export button
- [ ] Table headers (Name, SKU, Price, Stock, Status, Actions)
- [ ] Status labels (Active, In Stock, Out of Stock, Inactive)
- [ ] Edit/Delete tooltips
- [ ] Delete confirmation dialog

### ✅ Product Editor (`/admin/products/new`, `/admin/products/:id`)
- [ ] Page title (New Product / Edit Product)
- [ ] All form labels
- [ ] Placeholder text
- [ ] Category dropdown
- [ ] Image upload messages (upload, uploading, error, success)
- [ ] Multi-image upload labels ("Add More", "Primary", drag instructions)
- [ ] Specifications/Features hints
- [ ] Save/Cancel buttons

### ✅ Categories (`/admin/categories`)
- [ ] Page title and subtitle
- [ ] "Add Category" button
- [ ] Category dialog (all labels)
- [ ] Icon picker (label, search, "No icons found")
- [ ] Image upload messages
- [ ] Visibility toggle labels
- [ ] Reorder buttons tooltips
- [ ] Tip box content

### ✅ Orders (`/admin/orders`)
- [ ] Page title and subtitle
- [ ] Status filter dropdown options
- [ ] Table headers
- [ ] Status badges
- [ ] Payment method labels
- [ ] "View Details" button

### ✅ Order Detail (`/admin/orders/:id`)
- [ ] Page title
- [ ] Order items table
- [ ] Customer information section
- [ ] Shipping information section
- [ ] Status dropdown
- [ ] Action buttons (Invoice, Print, Export)

### ✅ Quote Requests (`/admin/quotes`)
- [ ] Page title and subtitle
- [ ] Status filter options
- [ ] Stats cards
- [ ] Table headers
- [ ] Company type labels
- [ ] Urgency labels
- [ ] Status badges
- [ ] View Details dialog content
- [ ] Response dialog content

### ✅ Institution Logos (`/admin/logos`)
- [ ] Page title and subtitle
- [ ] "Add Logo" button
- [ ] Dialog form labels
- [ ] Info box content
- [ ] Logo list labels (Order, Status)
- [ ] Action buttons tooltips

### ✅ Testimonials (`/admin/testimonials`)
- [ ] Page title and subtitle
- [ ] "Add Testimonial" button
- [ ] Dialog form labels
- [ ] Table headers
- [ ] Rating display
- [ ] Action buttons

### ✅ UX Insights (`/admin/ux-insights`)
- [ ] Page title and subtitle
- [ ] Time range dropdown
- [ ] Summary cards (Total Events, Sessions, etc.)
- [ ] AI Recommendations section
- [ ] Tab labels (Navigation, Products, Conversion, Utility)
- [ ] All chart/table labels

### ✅ Roles & Permissions (`/admin/roles`)
- [ ] Page title and subtitle
- [ ] Tab labels
- [ ] Role names (Super Admin, Admin, Accounts, Sales, Moderator, User)
- [ ] Module names
- [ ] Permission descriptions

### ✅ User Management (`/admin/users`)
- [ ] Page title and subtitle
- [ ] Stats cards
- [ ] Table headers
- [ ] Role badges
- [ ] Status badges
- [ ] Action dialogs

### ✅ Sidebar & Navigation
- [ ] All menu item labels
- [ ] "View Website" link
- [ ] Theme toggle label
- [ ] Language switcher options

---

## Customer-Facing Pages

### ✅ Homepage (`/`)
- [ ] Hero slider headlines and descriptions
- [ ] CTA buttons
- [ ] Trust badges
- [ ] Category section
- [ ] Featured products
- [ ] Testimonials section
- [ ] Institution logos section title

### ✅ Products (`/products`)
- [ ] Page title
- [ ] Search input placeholder
- [ ] Filter labels
- [ ] Sort dropdown options
- [ ] Product cards (labels, buttons)
- [ ] "No products" message
- [ ] Pagination labels

### ✅ Product Page (`/product/:slug`)
- [ ] Product details labels
- [ ] Specifications section
- [ ] Features section
- [ ] Add to Cart / Buy Now buttons
- [ ] Stock status
- [ ] Related products section

### ✅ Categories (`/categories`)
- [ ] Page title
- [ ] Category cards
- [ ] Product count labels

### ✅ Cart (`/cart`)
- [ ] Page title
- [ ] "Cart is empty" message
- [ ] Product item labels
- [ ] Cart summary labels
- [ ] Continue shopping / Checkout buttons
- [ ] Free shipping message

### ✅ Checkout (`/checkout`)
- [ ] Page title
- [ ] Form section labels
- [ ] Input labels and placeholders
- [ ] Payment method options
- [ ] Order summary
- [ ] Place order button
- [ ] Success message

### ✅ Account (`/account`)
- [ ] Page title
- [ ] Login/Register forms
- [ ] Profile form labels
- [ ] Quick access links
- [ ] Edit/Save buttons
- [ ] Logout button
- [ ] Terms agreement text

### ✅ Wishlist (`/wishlist`)
- [ ] Page title
- [ ] "Login to view" message
- [ ] "Empty wishlist" message
- [ ] Product item labels
- [ ] Move to Cart / Remove buttons
- [ ] Stock status

### ✅ Orders (`/account/orders`)
- [ ] Page title
- [ ] Order cards
- [ ] Status badges
- [ ] Order details

### ✅ Request Quote (`/request-quote`)
- [ ] Page title and subtitle
- [ ] Form section labels
- [ ] All input labels
- [ ] Company type dropdown
- [ ] Urgency dropdown
- [ ] Submit button

### ✅ Header
- [ ] Logo alt text
- [ ] Navigation links
- [ ] Search placeholder
- [ ] Cart count
- [ ] Language switcher

### ✅ Footer
- [ ] Company description
- [ ] Quick links labels
- [ ] Contact information
- [ ] Newsletter section
- [ ] Legal links

---

## Additional Checks

### Font Rendering
- [ ] Bangla text uses Hind Siliguri font
- [ ] Font weights display correctly
- [ ] Numbers display correctly in Bangla mode

### Toast Messages
- [ ] Success messages display in active language
- [ ] Error messages display in active language
- [ ] Validation messages display in active language

### Dynamic Content
- [ ] Product names (may be language-specific: name vs name_bn)
- [ ] Category names (may be language-specific)
- [ ] User-generated content displays appropriately

### RTL/LTR
- [ ] Text direction is consistent (both EN and BN are LTR)
- [ ] Spacing and alignment look correct

---

## Notes

- **Date Format**: Check if dates display appropriately
- **Currency**: Should always be ৳ (Taka) regardless of language
- **Numbers**: Large numbers may need Bangla numerals in strict Bangla mode
- **Fallbacks**: If translation is missing, English fallback should display gracefully

---

## Last Updated
January 2026

## Tested By
_Add tester name and date after completing tests_
