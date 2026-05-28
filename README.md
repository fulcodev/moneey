# Moneey — Finanzas Personales

App de finanzas personales con moneda base USD, conversión VES, dashboards interactivos, y control completo de ingresos, egresos, deudas, metas y presupuestos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 + design tokens |
| UI Icons | Lucide React |
| Charts | Recharts |
| Auth | Firebase Auth (email/password) |
| DB | Firestore |
| Exchange Rates | DolarApi.com (ve.dolarapi.com) |
| Notificaciones | Resend |
| Deploy | Vercel (free tier) |

## Requisitos

- Node.js >= 20
- Cuenta Firebase (proyecto `moneey-df341`)
- Claves reCAPTCHA v3

## Variables de entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKDuiMLgr0Lc8dMyq7Ro6VoAQT-08LX5Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moneey-df341.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=moneey-df341
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moneey-df341.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=416445588284
NEXT_PUBLIC_FIREBASE_APP_ID=1:416445588284:web:0759585aeffe40ca66f439
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WSHQNE2HM1
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcbHQEtAAAAAHmXk-ikERlBbVAffaI7POz1Ifvy
RECAPTCHA_SECRET_KEY=6LcbHQEtAAAAADX4FJhJ-0eB8vWPtKA2UraWG7kh
```

## Instalación

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Deploy a Vercel

```bash
vercel deploy --prod
```

Las reglas de Firestore se despliegan con:

```bash
npx firebase deploy --only firestore:rules
```

## Arquitectura

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login
│   ├── (dashboard)/        # Dashboard protegido
│   └── api/                # API routes (recaptcha, resend, etc.)
├── components/
│   ├── auth/               # AuthGuard, LoginForm
│   ├── budgets/            # BudgetProgress
│   ├── categories/         # CategoryForm, CategoryList
│   ├── csv-import/         # CSV Import
│   ├── dashboard/          # MetricCards, Charts, BalanceCards
│   ├── debts/              # DebtCard, DebtForm
│   ├── goals/              # GoalCard, GoalForm
│   ├── rates/              # ExchangeRateContext, RateHistoryCard
│   ├── recurring/          # RecurringForm
│   ├── tables/             # TransactionsTable, CategoriesTable, etc.
│   ├── toast/              # ToastProvider
│   └── ui/                 # Button, Input, Card, Modal, DataTable, Sidebar, Skeleton
├── hooks/                  # useTransactions, useCategories, useDebts, etc.
├── lib/                    # utils, rates, validation, accounting, financial
├── types/                  # TypeScript interfaces
├── data/                   # Default categories
└── proxy.ts                # Rate limiting (Next.js Edge)
```

## Funcionalidades

- **Multi-moneda**: USD base. Las transacciones se almacenan en USD. Soporta carga en VES (oficial y paralelo) con conversión automática usando la tasa del día.
- **Dashboard**: Métricas clave (balance, ingresos, gastos, tasa de ahorro, promedio diario), charts interactivos, evolución del balance.
- **Transacciones**: CRUD completo con validación de precisión decimal, detección de duplicados, paginación por cursor (virtual scrolling para 5M+ registros).
- **Categorías**: 12 categorías precargadas, personalizables, con presupuesto mensual por categoría y alertas al 80%/100%.
- **Deudas**: Seguimiento con pagos parciales, proyección de pago con APR, amortización. Los pagos crean transacciones automáticamente.
- **Pagos recurrentes**: Suscripciones semanal/quincenal/mensual/anual, recordatorios por email (Resend), auto-creación de transacciones.
- **Metas de ahorro**: Progreso visual, deadline, auto-ahorro desde ingresos, distribución de excedente mensual.
- **Reportes**: Charts por período, filtros avanzados, export CSV.
- **Tasas de cambio**: Consume DolarApi.com, histórico persistido en Firestore, refresco automático cada 30 min.

## Seguridad

- reCAPTCHA v3 en login (verificación server-side)
- Rate limiting en Edge (proxy)
- Firestore rules: acceso solo al propio usuario
- Offline-first: Firestore persistence multi-tab

## Licencia

MIT
