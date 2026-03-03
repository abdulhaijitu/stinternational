

## Footer Enhancement Plan

### সমস্যাসমূহ
1. **হার্ডকোডেড ইংরেজি টেক্সট** — Trust bar, headings, company info, payment label, copyright সব হার্ডকোডেড
2. **Payment SVG সেকশন অনেক বড়** — ~50 লাইন inline SVG, ভিজুয়ালি cluttered
3. **ডিজাইন পুরনো** — Separator ব্যবহার নেই, spacing অসামঞ্জস্য
4. **Translation keys আছে কিন্তু ব্যবহৃত হয়নি** — `t.footer.*` keys exist but Footer হার্ডকোডেড

### প্রস্তাবিত পরিবর্তন

**ফাইল:** `src/components/layout/Footer.tsx`

| সেকশন | পরিবর্তন |
|---|---|
| **Trust Bar** | হার্ডকোডেড টেক্সট → `language` চেক দিয়ে দ্বিভাষিক; আইকন `h-4 w-4` করে কমপ্যাক্ট; `py-4` করে ছোট |
| **Company Info** | `t.footer.aboutCompany`, `t.footer.companyDescription` ব্যবহার; লোগো `h-12` করে কমপ্যাক্ট; social icons `w-8 h-8` |
| **Categories** | heading দ্বিভাষিক; `space-y-2` করে কমপ্যাক্ট; `text-xs` ফন্ট |
| **Quick Links** | `t.footer.quickLinks` heading; link টেক্সট দ্বিভাষিক (`t.footer.privacyPolicy` etc.) |
| **Contact** | `t.footer.contactInfo` heading; address/hours দ্বিভাষিক |
| **Payment Section** | inline SVG সরিয়ে সিম্পল টেক্সট-বেসড ব্যাজ (`Visa`, `Mastercard` etc.) — ক্লিনার ও লাইটওয়েট; bottom bar-এ merge করা |
| **Bottom Bar** | copyright দ্বিভাষিক; payment badges ও copyright একই row-তে |
| **Separator** | Shadcn `Separator` ব্যবহার `border-t` এর বদলে |
| **fontClass** | `useLanguage()` থেকে `fontClass` নিয়ে প্রয়োগ |

### Translation keys যোগ করতে হবে

**`en.ts`** ও **`bn.ts`** footer সেকশনে:

| Key | EN | BN |
|---|---|---|
| `productCategories` | Product Categories | পণ্যের বিভাগসমূহ |
| `contactUs` | Contact Us | যোগাযোগ করুন |
| `authenticProducts` | 100% Authentic Products | ১০০% আসল পণ্য |
| `nationwideDelivery` | Nationwide Delivery | সারাদেশে ডেলিভারি |
| `securePayment` | Secure Payment Options | নিরাপদ পেমেন্ট |
| `acceptedPayments` | Accepted Payment Methods | গৃহীত পেমেন্ট পদ্ধতি |
| `aboutUs` | About Us | আমাদের সম্পর্কে |
| `contact` | Contact | যোগাযোগ |
| `allProducts` | All Products | সব পণ্য |
| `designBy` | Design & Developed by | ডিজাইন ও ডেভেলপমেন্ট |
| `businessHours` | Sat - Thu: 9:00 AM - 6:00 PM | শনি - বৃহঃ: সকাল ৯:০০ - সন্ধ্যা ৬:০০ |

### বাস্তবায়ন

| ফাইল | কাজ |
|---|---|
| `src/lib/translations/en.ts` | footer সেকশনে নতুন keys যোগ |
| `src/lib/translations/bn.ts` | footer সেকশনে নতুন keys যোগ |
| `src/components/layout/Footer.tsx` | সম্পূর্ণ রিডিজাইন — দ্বিভাষিক, কমপ্যাক্ট, SVG সরানো, shadcn Separator ব্যবহার |

