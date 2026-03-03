

## Product Categories সেকশন — UI/UX অডিট ও ফিক্স

### বর্তমান সমস্যাসমূহ

| # | সমস্যা |
|---|---|
| 1 | **হেডার ব্ল্যান্ড** — শুধু h2 + p, কোন ডেকোরেটিভ এলিমেন্ট নেই (অন্য সেকশনগুলোতে badge + primary line আছে) |
| 2 | **৩টি কার্ড — ভিজ্যুয়াল ওয়েট কম** — আইকন ছোট (14x14), কার্ডে কোন ইমেজ/গ্র্যাডিয়েন্ট নেই, ফ্ল্যাট দেখায় |
| 3 | **Subcategory ব্লক — বিরক্তিকর** — `bg-muted/30` ফ্ল্যাট বক্স, ট্যাগ/চিপগুলো ছোট ও একঘেয়ে, গ্রুপ নাম ও ক্যাটাগরি একই স্টাইল |
| 4 | **"View All Categories" CTA নেই** — ইউজার পুরো ক্যাটাগরি পেজে যেতে পারে না সরাসরি |
| 5 | **কোন ব্যাকগ্রাউন্ড ট্রিটমেন্ট নেই** — সেকশন সাদা/ফ্ল্যাট, হোমপেজের অন্য সেকশনের সাথে ভিজ্যুয়াল কন্ট্রাস্ট নেই |

### ফিক্স প্ল্যান — `src/pages/Index.tsx`

**১. সেকশন ব্যাকগ্রাউন্ড**
- `bg-gradient-to-b from-muted/30 to-background` যোগ করা (Why Choose সেকশনের মতো)

**২. হেডার আপগ্রেড**
- ছোট badge/subtitle: "Browse Equipment" / "যন্ত্রপাতি ব্রাউজ করুন"
- টাইটেলের নিচে ডেকোরেটিভ primary line (অন্য সেকশনের সাথে consistent)

**৩. Category কার্ড রিডিজাইন**
- আইকন বড় করা (w-16 h-16) এবং gradient background দেওয়া (`bg-gradient-to-br from-primary/10 to-primary/5`)
- কার্ডে product count badge যোগ করা (DB groups থেকে)
- Arrow CTA বড় করা ও bottom-aligned করা

**৪. Subcategory গ্রিড রিডিজাইন**
- প্রতিটি গ্রুপকে proper bordered card বানানো (`bg-card border border-border rounded-lg`)
- গ্রুপ header এ আইকন যোগ (category icon)
- চিপগুলোতে hover ইফেক্ট উন্নত করা — `hover:bg-primary hover:text-primary-foreground`
- "+N more" লিংকে arrow icon যোগ

**৫. "View All Categories" CTA বাটন**
- সেকশনের নিচে centered ghost/outline বাটন: "সব ক্যাটাগরি দেখুন" → `/categories`

