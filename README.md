# Mini Trello – داشبورد مدیریت تسک‌ها

<div dir="rtl">

Mini Trello یک Kanban Board تمام‌صفحه برای مدیریت تسک‌هاست. این پروژه با هدف نمایش یک معماری ساده و شامل Frontend مبتنی بر Vue 3 و یک REST API مبتنی بر Node.js و Express است.

## معرفی پروژه

تسک‌ها در سه ستون «برای انجام»، «در حال انجام» و «انجام‌شده» نمایش داده می‌شوند. رابط کاربری عملیات کامل CRUD، تغییر سریع وضعیت، فیلتر و مرتب‌سازی را فراهم می‌کند و Backend داده‌ها را به‌صورت async در یک فایل JSON نگهداری می‌کند.

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
- JSON file storage با APIهای async فایل‌سیستم
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
    └── backend/
        ├── data/tasks.json  # storage محلی
        └── src/
            ├── controllers/
            ├── middleware/
            ├── routes/
            ├── services/
            ├── types/
            ├── app.ts
            └── server.ts
```

در Backend، مسیر تودرتوی `backend/backend/` بخشی از ساختار فعلی پروژه است؛ دستورهای npm همچنان از پوشه سطح اول `backend/` اجرا می‌شوند.

## پیش‌نیازها

- Node.js و npm

نسخه دقیقی با فیلد `engines` در پروژه قفل نشده است. از نسخه‌ای جدید و سازگار با dependencyهای ثبت‌شده در `package-lock.json` استفاده کنید.

## نصب پروژه

از ریشه پروژه، dependencyهای هر بخش را جداگانه نصب کنید:

```powershell
cd backend
npm install
Copy-Item backend/data/tasks.example.json backend/data/tasks.json
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

Backend این متغیرهای اختیاری را مستقیماً از محیط process می‌خواند:

| متغیر | مقدار پیش‌فرض | کاربرد |
| --- | --- | --- |
| `PORT` | `4000` | پورت HTTP Backend |
| `CORS_ORIGIN` | `http://localhost:5173` | origin مجاز Frontend |

Backend در حال حاضر `dotenv` ندارد؛ بنابراین فایل `.env` را خودکار بارگذاری نمی‌کند. برای تغییر مقادیر، آن‌ها را در محیط اجرای process تنظیم کنید.

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

در `PUT` ارسال هر پنج فیلد زیر الزامی است. `createdAt` باید ISO 8601 معتبر باشد؛ `id` فقط در URL قرار می‌گیرد و Backend شناسه قبلی را حفظ می‌کند.

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
- داده‌ها در یک فایل JSON ذخیره می‌شوند.
- filter و sort کاملاً در Frontend انجام می‌شوند و query parameter به Backend ارسال نمی‌شود.
- Drag and Drop فقط status را تغییر می‌دهد.
- مدل Task فیلد `position` یا `order` ندارد؛ بنابراین ترتیب دستی کارت‌ها ذخیره نمی‌شود.
- `createdAt` در POST توسط Backend ساخته و در PUT از Task موجود حفظ و ارسال می‌شود.

## محدودیت‌ها

- JSON storage برای محیط production، چند instance یا حجم بالای داده مناسب نیست.
- authentication و authorization وجود ندارد.
- ترتیب دستی کارت‌ها قابل ذخیره نیست.
- HTML5 Drag and Drop روی بعضی دستگاه‌های لمسی محدود است؛ select وضعیت به‌عنوان جایگزین قابل‌دسترسی باقی مانده است.
- pagination، search، virtual list و realtime update پیاده‌سازی نشده‌اند.
- تست E2E و تست خودکار Backend در حال حاضر وجود ندارند.

## پیشنهادهای بهبود

- جایگزینی JSON با PostgreSQL یا یک database مناسب
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
