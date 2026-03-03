

## /contact পেইজ অডিট রিপোর্ট

### চিহ্নিত সমস্যা

#### সমস্যা ১: WhatsApp আইকনে জেনেরিক `MessageCircle` ব্যবহৃত (Moderate)
**ফাইল:** `src/pages/Contact.tsx`

| লাইন | স্থান | সমস্যা |
|---|---|---|
| 267 | WhatsApp CTA সেকশন — বৃত্তাকার আইকন | `MessageCircle` ব্যবহৃত |
| 284 | WhatsApp CTA বাটন | `MessageCircle` ব্যবহৃত |
| 558 | FAQ সেকশন — "আমাদের জিজ্ঞাসা করুন" বাটন | `MessageCircle` ব্যবহৃত |

**ফিক্স:** তিনটি জায়গায় `MessageCircle` এর বদলে আসল WhatsApp SVG আইকন ব্যবহার করা (FloatingWhatsApp-এ যেটি যোগ করা হয়েছে সেই একই SVG)

### যা ঠিক আছে
- ✅ সব ফর্ম লেবেল, ভ্যালিডেশন, প্লেসহোল্ডার — `t.contact.*` বা `language` চেক দিয়ে দ্বিভাষিক
- ✅ FAQ সেকশন — সব প্রশ্ন ও উত্তর দ্বিভাষিক
- ✅ Hero, WhatsApp CTA, FAQ — সব টেক্সট দ্বিভাষিক
- ✅ কন্ট্রাস্ট ও কালার — সঠিক (hero-gradient, bg-primary, text-primary-foreground)
- ✅ PageSEO — সঠিকভাবে ব্যবহৃত
- ✅ fontClass — সব সেকশনে প্রয়োগ করা আছে
- ✅ ঠিকানা — ভৌত ঠিকানা, ইংরেজিতে রাখা যুক্তিসঙ্গত

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/Contact.tsx` | একটি `WhatsAppIcon` কম্পোনেন্ট তৈরি করে L267, L284, L558-এ `MessageCircle` প্রতিস্থাপন। `MessageCircle` ইমপোর্ট থেকে সরানো। |

