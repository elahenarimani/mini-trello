# Mini Trello – داشبورد مدیریت تسک‌ها

<div dir="rtl">

Mini Trello یک Kanban Board تمام‌صفحه برای مدیریت تسک‌هاست. این پروژه با هدف نمایش یک معماری ساده و شامل Frontend مبتنی بر Vue 3 و یک REST API مبتنی بر Node.js و Express است.

## معرفی پروژه

تسک‌ها در سه ستون «برای انجام»، «در حال انجام» و «انجام‌شده» نمایش داده می‌شوند. رابط کاربری عملیات کامل CRUD، تغییر سریع وضعیت، فیلتر و مرتب‌سازی را فراهم می‌کند و Backend داده‌ها را در Neon PostgreSQL نگهداری می‌کند.

## قابلیت‌ها

- نمایش تسک‌ها در سه ستون Kanban
- ایجاد تسک با validation سمت کاربر
- ویرایش کامل تسک با `PUT`
- حذف تسک همراه با modal تأیید
- تغییر سریع وضعیت با `PATCH` و select قابل‌استفاده با کیبورد
- جابه‌جایی کارت‌ها میان ستون‌ها با HTML5 Drag and Drop
- Optimistic Update هنگام Drag and Drop و rollback همان کارت در صورت شکست درخواست
- فیلتر سمت Frontend براساس status و priority
- مرتب‌سازی براساس `createdAt`، بدون تغییر آرایه اصلی Pinia
- حالت‌های loading، error، retry و empty state
- مدیریت خطاهای API و جلوگیری از درخواست‌های هم‌زمان روی یک تسک
- رابط فارسی و RTL، Dark Mode و طراحی responsive
- استفاده از عناصر معنایی، focus state و `aria-label`/`aria-live` در کنترل‌های اصلی
- تست واحد منطق‌های pure، Pinia store و componentهای مهم

## تکنولوژی‌ها

### Frontend

- Vue 3 و Composition API با `<script setup lang="ts">`
- TypeScript
- Vite
- Pinia
- Fetch API
- Vitest
- Vue Test Utils و jsdom
- CSS سراسری و responsive، بدون UI library سنگین

### Backend

- Node.js
- Express 5
- TypeScript
- Neon PostgreSQL با `@neondatabase/serverless`، SQL پارامتری و بدون ORM
- CORS
- REST API و error handler مرکزی

## ساختار داده Task

```ts
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO 8601
}
```

## ساختار پروژه

```text
mini trello/
├── README.md
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/
│       │   ├── board/       # ستون‌ها، کارت‌ها و Toolbar
│       │   ├── layout/      # Header برنامه
│       │   ├── shared/      # Loading، Error و Empty State
│       │   └── tasks/       # Modalهای ایجاد، ویرایش و حذف
│       ├── constants/       # برچسب‌های typed رابط کاربری
│       ├── services/        # ارتباط با REST API
│       ├── stores/          # Pinia Task store
│       ├── tests/           # setup و fixtureهای مشترک
│       ├── types/           # typeهای Task
│       ├── utils/           # filter، sort و validation قابل‌تست
│       ├── App.vue
│       └── main.ts
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── database/schema.sql
    ├── tests/backend.test.cjs
    ├── tests/postgres-smoke.cjs
    └── src/
        ├── data/tasks.example.json
        ├── data/tasks.json  # داده قبلی برای seed، خارج از Git
        ├── config/database.ts
        ├── scripts/         # check-database، migrate و seed صریح
        ├── controllers/
        ├── middleware/
        ├── routes/
        ├── services/
        ├── types/
        ├── app.ts
        └── server.ts
```

دستورهای npm از پوشه `backend/` اجرا می‌شوند. ورودی Express فایل `src/app.ts` و ورودی اجرای محلی `src/server.ts` است.

## پیش‌نیازها

- Node.js نسخه `22.9.0` یا جدیدتر و npm؛ نسخه 24 برای محیط محلی و Vercel مناسب است.

حداقل نسخه در `backend/package.json` ثبت شده است تا بارگذاری بومی فایل `.env` با `--env-file-if-exists` در دسترس باشد.

## نصب پروژه

از ریشه پروژه، dependencyهای هر بخش را جداگانه نصب کنید:

```powershell
cd backend
npm install
```

```powershell
cd frontend
npm install
```

## متغیرهای محیطی

فایل نمونه Frontend در `frontend/.env.example` قرار دارد:

```env
VITE_API_BASE_URL=http://localhost:4000
```

برای اجرای محلی، فایل نمونه را در همان پوشه با نام `.env` کپی کنید. این مقدار هنگام build توسط Vite خوانده می‌شود.

Backend این متغیرها را از محیط process می‌خواند:

| متغیر | مقدار پیش‌فرض | کاربرد |
| --- | --- | --- |
| `PORT` | `4000` | پورت HTTP Backend |
| `FRONTEND_URL` | بدون مقدار | origin مجاز Frontend در کنار `http://localhost:5173` |
| `DATABASE_URL` | ندارد؛ الزامی | connection string پروژه Neon |

فایل نمونه Backend در `backend/.env.example` قرار دارد. برای سازگاری قبلی، در نبود `FRONTEND_URL` مقدار `CORS_ORIGIN` نیز پشتیبانی می‌شود.

دستورهای `dev`، `start` و `db:*` با قابلیت بومی Node فایل `backend/.env` را بارگذاری می‌کنند؛ مقادیر موجود در محیط process اولویت دارند. `.env.local` خودکار بارگذاری نمی‌شود. فایل‌های `.env` و `.env.local` از Git مستثنا هستند. connection string را در source، log، screenshot یا commit قرار ندهید.

## آماده‌سازی Neon و انتقال داده

1. در [Neon Console](https://console.neon.tech) یک پروژه PostgreSQL بسازید و branch، database و role موردنظر را انتخاب کنید. از پنجره **Connect**، connection string را بگیرید.
2. فایل `backend/.env.example` را فقط در صورت نبود فایل تنظیمات محلی به `backend/.env` کپی کنید و مقدار نمونه `DATABASE_URL` را با مقدار واقعی جایگزین کنید. پارامترهای SSL دریافتی از Neon را حفظ کنید.
3. از پوشه `backend` این دستورها را به‌ترتیب اجرا کنید؛ تنها پس از موفقیت هر دستور به بعدی بروید:

```powershell
npm run db:check
npm run db:migrate
npm run db:seed
npm run dev
```

`db:check` فقط `SELECT 1` را اجرا می‌کند. migration و seed نیز پیش از هر تغییر، اتصال را با همین query تأیید می‌کنند. هیچ‌کدام هنگام import، build یا deploy خودکار اجرا نمی‌شوند. migration با `CREATE TABLE IF NOT EXISTS` جدول را می‌سازد؛ جدول قدیمی با schema متفاوت را خودکار اصلاح نمی‌کند.

schema دارای `BIGINT IDENTITY`، `created_at TIMESTAMPTZ DEFAULT NOW()` و محدودیت enum برای status/priority است. برای حفظ validation قبلی API، title و description از نوع `TEXT` هستند، عنوان باید غیرخالی باشد و توضیح خالی مجاز است. محدودیت جدید طول ۱۰۰/۵۰۰ یا حداقل سه کاراکتر اضافه نشده است.

seed از فایل حفظ‌شده `backend/src/data/tasks.json` می‌خواند و id و createdAt را عیناً منتقل می‌کند. این فایل حاوی ۱۴ Task محلی است و داخل Git نیست؛ در checkout تازه باید فایل داده قبلی را به همین مسیر برگردانید. `tasks.example.json` فقط نمونه خالی است و جایگزین خودکار داده واقعی نمی‌شود.

seed در یک transaction، نوشتن روی جدول را قفل می‌کند، با `ON CONFLICT (id) DO NOTHING` فقط شناسه‌های جدید را درج می‌کند و sequence را حداقل به بزرگ‌ترین id و مقدار قبلی sequence می‌رساند. اجرای مجدد رکورد تکراری نمی‌سازد و رکورد موجود را بازنویسی نمی‌کند. تعداد درج‌شده و شناسه‌های ردشده در پایان گزارش می‌شود. آن را پیش از بازکردن API برای کاربران اجرا کنید؛ شناسه مشترک با رکورد نامرتبط نیز رد می‌شود و باید بررسی شود.

اتصال HTTP از الگوی رسمی [Neon serverless driver](https://github.com/neondatabase/serverless) استفاده می‌کند؛ queryها parameterized هستند و pool جدیدی در هر عملیات ایجاد نمی‌شود.

## اجرای پروژه

Backend و Frontend را در دو Terminal جدا اجرا کنید. Backend باید قبل یا هم‌زمان با Frontend فعال باشد.

Terminal اول:

```powershell
cd backend
npm run dev
```

Terminal دوم:

```powershell
cd frontend
npm run dev
```

آدرس‌های توسعه:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000
```

برای اجرای build تولیدشده Backend:

```powershell
cd backend
npm run build
npm start
```

API دیگر فایل JSON را نمی‌خواند یا نمی‌نویسد و build نیز داده JSON کپی نمی‌کند. فایل‌های محلی قبلی، از جمله نسخه احتمالی داخل `dist/data`، برای حفظ داده حذف نشده‌اند ولی در runtime استفاده نمی‌شوند. `npm run dev` و `npm start` به همان Database مشخص‌شده در `DATABASE_URL` متصل می‌شوند؛ برای آزمایش از branch جداگانه Neon استفاده کنید.

بررسی‌های بدون Database:

```powershell
npm run typecheck
npm run build
npm test
```

تست‌ها با `node:test` داخلی Node و database شبیه‌سازی‌شده اجرا می‌شوند؛ framework جدیدی اضافه نشده است. mapper، پارامتری‌بودن queryها، قرارداد HTTP، validation، عدم تغییر createdAt در PUT و جلوگیری از افشای جزئیات خطا بررسی می‌شوند. این تست‌ها تأیید اتصال، اجرای SQL یا CRUD واقعی PostgreSQL نیستند. پس از تنظیم Database، migration، seed مجدد و هر شش endpoint را با یک Task آزمایشی بررسی و آن Task را حذف کنید؛ ۱۴ رکورد اصلی باید دست‌نخورده بمانند.

تست smoke واقعی، جدا از `npm test` و فقط با اجرای صریح فعال می‌شود:

```powershell
cd backend
npm run build
node --env-file=.env tests/postgres-smoke.cjs
```

این تست به همان ۱۴ تسک اولیه و فایل محلی `src/data/tasks.json` نیاز دارد. تنها یک تسک موقت می‌سازد، CRUD و پاسخ‌های خطا را بررسی می‌کند، آن را حذف می‌کند و سپس seed را دوباره اجرا می‌کند. در پایان برابری تمام فیلدهای ۱۴ تسک اصلی و جلو ماندن sequence بررسی می‌شود. این دستور را هم‌زمان با تغییر داده توسط کاربران اجرا نکنید.

## Backend روی Vercel

| تنظیم | مقدار |
| --- | --- |
| Root Directory | `backend` |
| Framework Preset | `Express` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | پیش‌فرض؛ override خاموش، نه `public` و نه `dist` |
| Environment Variable | `FRONTEND_URL=https://your-frontend.vercel.app` |
| Environment Variable | `DATABASE_URL` واقعی branch موردنظر Neon |
| Node.js Version | `24.x` |

طبق [مستندات Express در Vercel](https://vercel.com/docs/frameworks/backend/express)، `src/app.ts` با default export ورودی قابل‌شناسایی است؛ تنظیم legacy `builds` لازم نیست. `src/server.ts` فقط اجرای محلی را انجام می‌دهد.

در Settings → Environment Variables پروژه Backend، `DATABASE_URL` و `FRONTEND_URL` را برای محیط‌های موردنظر تنظیم کنید. برای Preview از branch آزمایشی جدا استفاده کنید تا تست‌ها داده Production را تغییر ندهند. ابتدا اتصال، migration، seed و CRUD را تأیید کنید و سپس deploy را به‌صورت صریح انجام دهید. `tasks.json` دیگر storage اصلی production نیست و روی Vercel به نوشتن فایل متکی نیستیم. secret نباید در Git یا متغیرهای `VITE_*` قرار بگیرد.

## API Endpointها

Base URL پیش‌فرض: `http://localhost:4000`

| Method | Endpoint | توضیح | پاسخ موفق |
| --- | --- | --- | --- |
| `GET` | `/api/tasks` | دریافت همه Taskها | `200 OK` |
| `GET` | `/api/tasks/:id` | دریافت یک Task | `200 OK` |
| `POST` | `/api/tasks` | ایجاد Task | `201 Created` |
| `PUT` | `/api/tasks/:id` | جایگزینی کامل Task | `200 OK` |
| `PATCH` | `/api/tasks/:id` | ویرایش بخشی از Task | `200 OK` |
| `DELETE` | `/api/tasks/:id` | حذف Task | `204 No Content` |

کدهای خطای اصلی:

- `400 Bad Request`: شناسه، JSON یا ورودی نامعتبر و فیلد ناشناخته
- `404 Not Found`: Task یا route پیدا نشده است
- `500 Internal Server Error`: خطای پیش‌بینی‌نشده سمت سرور

### نمونه body برای POST

Frontend هر چهار فیلد قابل‌ویرایش را ارسال می‌کند و Backend، `id` و `createdAt` را تولید می‌کند:

```json
{
  "title": "تکمیل صفحه ورود",
  "description": "فرم ورود و validation آن پیاده‌سازی شود",
  "status": "todo",
  "priority": "high"
}
```

### نمونه body برای PUT

در `PUT` ارسال هر پنج فیلد زیر الزامی است. `createdAt` باید ISO 8601 معتبر باشد؛ `id` فقط در URL قرار می‌گیرد. Backend شناسه و تاریخ اصلی Database را حفظ می‌کند؛ مقدار createdAt ارسالی پس از validation ذخیره نمی‌شود.

```json
{
  "title": "تکمیل صفحه ورود",
  "description": "پیاده‌سازی قبلی به‌طور کامل جایگزین شود",
  "status": "done",
  "priority": "high",
  "createdAt": "2026-09-22T12:00:00.000Z"
}
```

### نمونه body برای PATCH

`PATCH` یک یا چند فیلد از `title`، `description`، `status` و `priority` را می‌پذیرد. تغییر سریع وضعیت و Drag and Drop فقط status را ارسال می‌کنند:

```json
{
  "status": "in_progress"
}
```

فیلد ناشناخته، body خالی در `PATCH` و مقدار نامعتبر status/priority با `400` رد می‌شوند.

## مدیریت State و معماری

- `Pinia` منبع اصلی state تسک‌ها و stateهای مستقل عملیات fetch/create/update/delete/status است.
- `taskApi.ts` تمام جزئیات HTTP، URL، headerها و تبدیل خطای پاسخ را متمرکز می‌کند؛ componentها مستقیماً درخواست شبکه ارسال نمی‌کنند.
- componentها به بخش‌های layout، board، task modal و stateهای مشترک تقسیم شده‌اند.
- filter و sort در یک pipeline مشتق‌شده با `computed` اجرا می‌شوند. تابع pure ابتدا فیلتر status، سپس priority و در پایان sort تاریخ را اعمال می‌کند.
- پیش از `sort()` یک کپی سطحی از نتیجه ساخته می‌شود؛ بنابراین آرایه اصلی Pinia تغییر نمی‌کند. تاریخ‌های نامعتبر حذف نمی‌شوند و در انتهای لیست قرار می‌گیرند.
- select وضعیت از همان action مربوط به `PATCH` استفاده می‌کند و پس از پاسخ موفق state را تغییر می‌دهد.
- Drag and Drop همان action را در حالت optimistic فراخوانی می‌کند. قبل از درخواست، snapshot همان Task نگهداری می‌شود؛ در شکست API فقط همان Task rollback می‌شود، نه کل آرایه.
- state فیلترها محلی است و در Pinia یا `localStorage` ذخیره نمی‌شود.



## فرضیات

- پروژه تک‌کاربره است و authentication ندارد.
- Backend به‌صورت محلی در دسترس Frontend قرار می‌گیرد.
- داده‌ها در Neon PostgreSQL ذخیره می‌شوند؛ JSON قبلی فقط منبع انتقال صریح داده است.
- filter و sort کاملاً در Frontend انجام می‌شوند و query parameter به Backend ارسال نمی‌شود.
- Drag and Drop فقط status را تغییر می‌دهد.
- مدل Task فیلد `position` یا `order` ندارد؛ بنابراین ترتیب دستی کارت‌ها ذخیره نمی‌شود.
- `createdAt` در POST توسط Database ساخته می‌شود و در PUT تغییر نمی‌کند؛ mapper، `created_at` را به `createdAt` با ISO UTC تبدیل می‌کند.

## محدودیت‌ها

- اتصال Neon و schema آماده، پیش‌نیاز اجرای عملیات Task هستند.
- authentication و authorization وجود ندارد.
- ترتیب دستی کارت‌ها قابل ذخیره نیست.
- HTML5 Drag and Drop روی بعضی دستگاه‌های لمسی محدود است؛ select وضعیت به‌عنوان جایگزین قابل‌دسترسی باقی مانده است.
- pagination، search، virtual list و realtime update پیاده‌سازی نشده‌اند.
- تست E2E و تأیید CRUD واقعی PostgreSQL نیازمند محیط Database هستند؛ تست‌های فعلی Backend با query شبیه‌سازی‌شده اجرا می‌شوند.

## پیشنهادهای بهبود

- اضافه‌کردن authentication و authorization
- افزودن فیلد position و ذخیره ترتیب کارت‌ها
- اضافه‌کردن pagination یا virtual list برای داده‌های حجیم
- تست E2E برای جریان‌های اصلی و Drag and Drop
- اضافه‌کردن تست یکپارچه Backend
- deploy مستقل Frontend و Backend و تنظیم CI
- internationalization برای پشتیبانی از چند زبان
- realtime updates با WebSocket یا Server-Sent Events

## وضعیت پروژه

**وضعیت: آماده ارائه و ارزیابی فنی**

</div>
