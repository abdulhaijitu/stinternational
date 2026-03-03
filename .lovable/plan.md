

## Testimonials সেকশন ডিজাইন উন্নতি

### বর্তমান সমস্যা
- কার্ড ডিজাইন ফ্ল্যাট, গ্র্যাডিয়েন্ট বা ডেপথ নেই
- Quote আইকন ছোট ও সাধারণ
- সেকশন ব্যাকগ্রাউন্ড `bg-muted/30` — খুব হালকা, আলাদা হয় না
- কার্ডে হোভার ইফেক্ট শুধু shadow — কোন লিফট বা বর্ডার ইফেক্ট নেই
- `fontClass` ব্যবহার হয়নি

### প্রস্তাবিত পরিবর্তন

**ফাইল:** `src/components/homepage/Testimonials.tsx`

| সেকশন | পরিবর্তন |
|---|---|
| **সেকশন ব্যাকগ্রাউন্ড** | `bg-muted/30` → `bg-gradient-to-b from-background to-muted/50` — সূক্ষ্ম গ্র্যাডিয়েন্ট |
| **হেডার** | সাবটাইটলে একটি ডেকোরেটিভ লাইন যোগ (`w-12 h-1 bg-primary mx-auto`); `fontClass` প্রয়োগ |
| **কার্ড ডিজাইন** | `shadow-sm` ডিফল্ট যোগ; হোভারে `hover:shadow-xl hover:-translate-y-1 hover:border-primary/20` লিফট ইফেক্ট; ব্যাকগ্রাউন্ড সূক্ষ্ম গ্র্যাডিয়েন্ট `bg-gradient-to-br from-card to-muted/20` |
| **Quote আইকন** | বৃত্তটি `w-10 h-10` → `w-8 h-8` করে আরও রিফাইন্ড; `shadow-md` যোগ |
| **Quote টেক্সট** | `text-base md:text-lg` করে আরও পাঠযোগ্য; ইটালিক স্টাইল |
| **Author সেকশন** | বর্ডার `border-dashed` করে সূক্ষ্ম; নাম `text-primary` হাইলাইট |
| **নেভিগেশন বাটন** | `shadow-sm` যোগ করে ডেপথ |

### বাস্তবায়ন

| ফাইল | কাজ |
|---|---|
| `src/components/homepage/Testimonials.tsx` | কার্ড, হেডার, ব্যাকগ্রাউন্ড ডিজাইন উন্নতি ও `fontClass` যোগ |

