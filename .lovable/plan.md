

## হোম পেইজ অডিট রিপোর্ট ও ফিক্স প্ল্যান

### চিহ্নিত সমস্যা

#### সমস্যা ১: Testimonials স্টার রেটিং অদৃশ্য (Critical)
**ফাইল:** `src/components/homepage/Testimonials.tsx` (line 50-55)
- `text-accent fill-accent` ব্যবহৃত — Light mode-এ `--accent: 47 100% 96%` (প্রায় সাদা)
- ফলাফল: সাদা ব্যাকগ্রাউন্ডে সাদা তারা — সম্পূর্ণ অদৃশ্য
- **ফিক্স:** `text-amber-500 fill-amber-500` ব্যবহার করা (গোল্ড তারা)

#### সমস্যা ২: InstitutionLogos — দ্বিভাষিক নয় (Moderate)
**ফাইল:** `src/components/homepage/InstitutionLogos.tsx` (line 52-57)
- "Trusted by Institutions & Professional Buyers" এবং subtitle হার্ডকোডেড ইংরেজি
- **ফিক্স:** `useLanguage` হুক যোগ করে বাংলা/ইংরেজি টেক্সট দেখানো

#### সমস্যা ৩: Testimonials সেকশন হেডার — দ্বিভাষিক নয় (Moderate)
**ফাইল:** `src/components/homepage/Testimonials.tsx` (line 209-217)
- "Client Testimonials", "Trusted by Leading Institutions", subtitle — সব হার্ডকোডেড ইংরেজি
- **ফিক্স:** `useLanguage` হুক যোগ করে বাংলা/ইংরেজি টেক্সট দেখানো

#### সমস্যা ৪: QuickRfqForm — সাকসেস স্টেট ও হেডার আংশিক ইংরেজি (Minor)
**ফাইল:** `src/components/homepage/QuickRfqForm.tsx` (line 138, 163-168)
- সাকসেস মেসেজ: "Request Received", "Thank you for your inquiry..." — হার্ডকোডেড ইংরেজি
- ফর্ম হেডার: "Need Bulk Quantity or Institutional Pricing?" — হার্ডকোডেড ইংরেজি
- "Submit Another Request" বাটন — হার্ডকোডেড ইংরেজি
- **ফিক্স:** সব টেক্সট `language` চেক দিয়ে দ্বিভাষিক করা

#### সমস্যা ৫: HeroSlider CTA বাটন — কন্ট্রাস্ট নিয়ম অমান্য (Minor)
**ফাইল:** `src/components/homepage/HeroSlider.tsx` (line 553)
- বাটনে `text-accent-foreground` ব্যবহৃত, কিন্তু স্টাইল গাইড অনুযায়ী gradient primary বাটনে `text-primary-contrast` হওয়া উচিত
- **ফিক্স:** `text-accent-foreground` → `text-primary-contrast` পরিবর্তন

---

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/components/homepage/Testimonials.tsx` | স্টার রেটিং `text-accent` → `text-amber-500`; সেকশন হেডার দ্বিভাষিক করা |
| `src/components/homepage/InstitutionLogos.tsx` | হেডার ও subtitle দ্বিভাষিক করা |
| `src/components/homepage/QuickRfqForm.tsx` | সাকসেস স্টেট ও ফর্ম হেডার দ্বিভাষিক করা |
| `src/components/homepage/HeroSlider.tsx` | Primary CTA `text-accent-foreground` → `text-primary-contrast` |

### যা ঠিক আছে
- ✅ Index.tsx — আগের অডিটে ফিক্স করা হয়েছে (hover colors, stats text)
- ✅ Trust Signals — সব দ্বিভাষিক, কন্ট্রাস্ট ঠিক
- ✅ Category Cards — দ্বিভাষিক, কন্ট্রাস্ট ঠিক
- ✅ Why Choose Us — দ্বিভাষিক, কন্ট্রাস্ট ঠিক
- ✅ Featured Products — দ্বিভাষিক, কন্ট্রাস্ট ঠিক
- ✅ Stats Section — `text-white` ফিক্স আগেই করা হয়েছে
- ✅ HeroSlider navigation — সব aria-label ও কন্ট্রাস্ট ঠিক
- ✅ QuickRfqForm ফর্ম ফিল্ড — ইতিমধ্যে দ্বিভাষিক

