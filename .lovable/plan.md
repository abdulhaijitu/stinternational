

## Google সার্চে Lovable লোগো ফিক্স

### সমস্যা
Google সার্চ রেজাল্টে Lovable এর ফেভিকন দেখাচ্ছে। কারণ:
1. `public/favicon.ico` ফাইলটি Lovable এর ডিফল্ট আইকন — এটি কখনো ST International এর আইকন দিয়ে রিপ্লেস করা হয়নি
2. Google প্রাথমিকভাবে `/favicon.ico` খোঁজে (HTML এ যা-ই থাকুক)
3. `apple-touch-icon` মিসিং — Google এটাও ব্যবহার করে

### ফিক্স প্ল্যান

**ফাইল: `index.html`**
- ফেভিকন সেকশনে সম্পূর্ণ ফেভিকন সেট যোগ করা:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
```

**ফাইল: `public/favicon.ico`**
- Lovable এর ডিফল্ট `.ico` ফাইল ডিলিট করে ST International এর লোগো দিয়ে নতুন `.ico` আপলোড করতে হবে
- অথবা `favicon.png` থেকে `.ico` জেনারেট করা হবে (যদি `favicon.png` ইতিমধ্যে সঠিক লোগো হয়)

### গুরুত্বপূর্ণ
আপনাকে নিশ্চিত করতে হবে যে `public/favicon.png` ফাইলটি ST International এর সঠিক লোগো। যদি সেটিও Lovable এর ডিফল্ট হয়, তাহলে আপনার কোম্পানির লোগো PNG ফাইল আপলোড করতে হবে।

> Google ক্যাশ আপডেট হতে কয়েক দিন-সপ্তাহ সময় লাগতে পারে।

