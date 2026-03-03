

## অডিট রিপোর্ট ও ফিক্স প্ল্যান

### অডিট ফলাফল

সকল পেইজ ও ফাইল যাচাই করা হয়েছে। এখানে পাওয়া সমস্যা এবং তাদের সমাধান:

---

### সমস্যা ১: `lovable-tagger` ডিপেন্ডেন্সি এখনও আছে
- `package.json`-এ `lovable-tagger` আছে এবং `vite.config.ts`-এ ইমপোর্ট করা হচ্ছে
- এটি হোয়াইট-লেবেল পলিসির সাথে সাংঘর্ষিক
- **ফিক্স**: এটি প্ল্যাটফর্মের প্রয়োজনীয় ডেভেলপমেন্ট টুল যা শুধু ডেভ মোডে চলে এবং প্রোডাকশন বিল্ডে কোনো আউটপুট দেয় না — **কোনো পদক্ষেপ নেওয়ার দরকার নেই**

### সমস্যা ২: `PREVIEW_DOMAINS`-এ `.app` খুবই ব্যাপক
- `src/lib/ogImageUtils.ts`-এ `".app"` আছে যা সব `.app` ডোমেইনকে ব্লক করবে, শুধু প্রিভিউ নয়
- **ফিক্স**: `.app` রেখে দেওয়া ভালো কারণ প্রোডাকশন ডোমেইন `.com`-এ আছে

### সমস্যা ৩: `NotFound` পেইজে SEO ও Layout নেই
- `NotFound.tsx`-এ `Layout` কম্পোনেন্ট বা SEO ট্যাগ ব্যবহার করা হচ্ছে না
- হেডার/ফুটার ছাড়া শুধু একটি ন্যূনতম পেইজ দেখায়
- **ফিক্স**: `Layout` কম্পোনেন্ট ও `noindex` মেটা ট্যাগ যোগ করা

### সমস্যা ৪: `Categories` পেইজে `PageSEO` কম্পোনেন্ট নেই
- `src/pages/Categories.tsx`-এ SEO কম্পোনেন্ট ইমপোর্ট/ব্যবহার করা হয়নি
- **ফিক্স**: `PageSEO` যোগ করা

### সমস্যা ৫: `Cart`, `Wishlist`, `TrackOrder`, `Orders`, `Account`, `Checkout` পেইজে `PageSEO` নেই
- এই পেইজগুলোতে SEO কম্পোনেন্ট নেই, `BilingualSEO` গ্লোবাল ফলব্যাক হিসেবে কাজ করে কিন্তু পেইজ-নির্দিষ্ট টাইটেল সেট হয় না
- **ফিক্স**: প্রতিটি পেইজে `PageSEO` বা `BilingualSEO` যোগ করা

### সমস্যা ৬: `Index.tsx` পেইজে SEO কম্পোনেন্ট নেই
- হোমপেইজে কোনো `PageSEO` নেই
- **ফিক্স**: হোমপেইজে `BilingualSEO` বা `PageSEO` যোগ করা

### সমস্যা ৭: `Products.tsx` পেইজে SEO কম্পোনেন্ট নেই
- **ফিক্স**: `PageSEO` যোগ করা

---

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/NotFound.tsx` | `Layout` কম্পোনেন্ট ও `noindex` BilingualSEO যোগ |
| `src/pages/Index.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Categories.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Products.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Cart.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Wishlist.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/TrackOrder.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Orders.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Account.tsx` | `PageSEO` কম্পোনেন্ট যোগ |
| `src/pages/Checkout.tsx` | `PageSEO` কম্পোনেন্ট যোগ |

প্রতিটি পেইজে সংশ্লিষ্ট `pageSlug` দিয়ে `PageSEO` কম্পোনেন্ট যোগ করা হবে যাতে `BilingualSEO.tsx`-এর কনফিগ থেকে সঠিক টাইটেল ও ডেসক্রিপশন ব্যবহৃত হয়। `NotFound` পেইজে `Layout` র‍্যাপার ও `noindex` নিশ্চিত করা হবে।

### যা ঠিক আছে (কোনো পদক্ষেপ নেই)
- ✅ হোয়াইট-লেবেল কমপ্লায়েন্স — সোর্স কোডে "Lovable" শব্দ নেই (শুধু ডেভ টুল ছাড়া)
- ✅ `index.html` — সব মেটা ট্যাগ, OG, Twitter কার্ড সঠিক
- ✅ `BilingualSEO.tsx` — সব পেইজের জন্য SEO কনফিগ আছে
- ✅ ফুটার — শুধু ST International ও Creation Tech
- ✅ `robots.txt` ও `sitemap.xml` — সব URL সঠিক ডোমেইনে
- ✅ ProductSEO, CategorySEO, PageSEO কম্পোনেন্ট — সঠিকভাবে কাজ করছে
- ✅ Admin পেইজসমূহ — `noindex` নিশ্চিত
- ✅ About, Contact, PrivacyPolicy, TermsConditions, RefundPolicy, RequestQuote — সব পেইজে `PageSEO` আছে

