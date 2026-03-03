

## WhatsApp আইকন ফিক্স

### সমস্যা
বর্তমানে `FloatingWhatsApp.tsx`-এ `MessageCircle` (জেনেরিক মেসেজ আইকন) ব্যবহৃত। ব্যবহারকারী আসল WhatsApp লোগো চান।

### সমাধান
**ফাইল:** `src/components/layout/FloatingWhatsApp.tsx`
- Lucide-এ WhatsApp আইকন নেই, তাই একটি inline SVG WhatsApp লোগো ব্যবহার করা হবে
- `MessageCircle` ইমপোর্ট সরিয়ে কাস্টম WhatsApp SVG path বসানো হবে

