# Finance Cockpit

A read-only operational dashboard for EzyCrane Pty Ltd that connects to CraneLedger and AI-CFO APIs to display real-time financial data, alerts, and recommendations.

## Overview

Finance Cockpit is a web application built for the CraneLogic group to provide CFO/directors with a comprehensive view of the financial picture of EzyCrane Pty Ltd. The app connects to both CraneLedger (core ledger microservice) and AI-CFO (analytics and recommendations service) to present financial data, alerts, and AI-powered recommendations in an intuitive, easy-to-use interface.

## Features

### Authentication
- Simple email-based login (localStorage authentication)
- Protected routes requiring authentication
- Logout functionality

### Dashboard
- Entity selector for viewing different entities
- **AI-CFO Daily Brief** (when available):
  - Cash position and runway days
  - GST exposure
  - Current vs previous margin percentage with trend indicators
  - AI-generated narrative summary
- Key Performance Indicators (KPIs):
  - Cash (Bank/Clearing) - Account 110
  - Customer Deposits Held - Account 800
  - Accounts Receivable - Account 112
  - Margin (Last 30 Days)
  - Net Result (Last 30 Days)
- Performance summary with revenue, COGS, and margin breakdown

### Bookings
- Comprehensive table view of all bookings
- Filterable by status (Pending, Confirmed, Completed, Cancelled)
- Date range filtering
- Detailed view showing:
  - Basic booking information
  - Financial events timeline
  - Mini P&L for each booking
  - Linked journal entries

### Alerts (AI-CFO)
- View all alerts from AI-CFO analytics service
- Filter by unacknowledged vs all alerts
- Alert details including:
  - Severity (INFO, WARNING, CRITICAL)
  - Category (CASHFLOW, GST, MARGIN, DEPOSITS)
  - Title and description
  - Creation date
- Acknowledge alerts with one-click action

### Recommendations (AI-CFO)
- View AI-generated financial recommendations
- Three status tabs: Pending, Applied, Rejected
- Recommendation details:
  - Type (Adjustment Journal, Cash Reserve Move, GST Reserve, etc.)
  - Description and impact summary
  - Financial impact breakdown (cash, equity, GST, margin)
- Approve recommendations (triggers journal entry in CraneLedger)
- Reject recommendations with optional reason

### Reports
- Flexible time period selection (7 days, 30 days, quarter, year)
- Profit & Loss summary with:
  - Revenue breakdown by account
  - Cost of Goods Sold (COGS)
  - Expenses
  - Gross margin and net result
- Balance Sheet snapshot showing:
  - Assets
  - Liabilities
  - Equity

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: Wouter
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **HTTP Client**: Axios
- **API Clients**: 
  - Custom fetch-based client for CraneLedger
  - Custom fetch-based client for AI-CFO

## Project Structure

```
finance_cockpit/
├── index.html              # Entry point
├── src/                    # Source code
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Routes and top-level layout
│   ├── config.ts          # API configuration
│   ├── const.ts           # App constants
│   ├── index.css          # Global styles
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── DashboardLayout.tsx
│   │   └── ErrorBoundary.tsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/               # Utilities and API clients
│   │   ├── craneLedgerClient.ts
│   │   ├── aiCfoClient.ts
│   │   ├── types.ts
│   │   ├── aiCfoTypes.ts
│   │   └── utils.ts
│   └── pages/             # Page components
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── Bookings.tsx
│       ├── BookingDetail.tsx
│       ├── Alerts.tsx
│       ├── Recommendations.tsx
│       └── Reports.tsx
├── public/                 # Static assets
├── dist/                   # Build output
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:

```bash
npm run build
```

The build output will be in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Deploying to Vercel

This project is configured as a standard Vite + React app for easy deployment to Vercel.

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Configure Environment Variables**
   
   In Vercel project settings → Environment Variables, add:
   
   - `VITE_CRANE_LEDGER_BASE_URL` - Your CraneLedger API URL
   - `VITE_EZYCRANE_ENTITY_ID` - Your EzyCrane entity ID
   - `VITE_AI_CFO_BASE_URL` - Your AI-CFO API URL
   
   Then click "Deploy"!

### Build Configuration

Vercel will automatically use:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

No additional configuration needed!

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code:

### Required for CraneLedger Integration
- `VITE_CRANE_LEDGER_BASE_URL` - Base URL for CraneLedger API (e.g., `https://api.craneledger.com`)
- `VITE_EZYCRANE_ENTITY_ID` - Your EzyCrane entity ID in CraneLedger

### Required for AI-CFO Integration
- `VITE_AI_CFO_BASE_URL` - Base URL for AI-CFO API (e.g., `https://api.ai-cfo.com`)

### Optional Configuration
- `VITE_APP_TITLE` - Application title (default: "Finance Cockpit")
- `VITE_APP_LOGO` - Application logo URL

Example configuration:
```env
VITE_CRANE_LEDGER_BASE_URL=https://craneledger.production.com
VITE_AI_CFO_BASE_URL=https://ai-cfo.production.com
VITE_EZYCRANE_ENTITY_ID=94ea44d8-c8ca-43b2-8a78-8eabb5639618
```

## API Integration

### CraneLedger API

The app connects to CraneLedger (core ledger microservice) using the following endpoints:

- `GET /entities` - List all entities
- `GET /entities/:id/trial-balance?asOf=YYYY-MM-DD` - Get trial balance
- `GET /entities/:id/pnl?from=&to=` - Get profit & loss statement
- `GET /entities/:id/balance-sheet?asOf=` - Get balance sheet
- `GET /bookings?entityId=...` - List bookings with filters
- `GET /bookings/:id` - Get booking details

The API client is located in `src/lib/craneLedgerClient.ts` and provides typed methods for all endpoints.

### AI-CFO API

The app connects to AI-CFO (analytics and recommendations service) using the following endpoints:

- `GET /entities` - List all entities
- `GET /entities/:ledgerEntityId/brief` - Get daily CFO brief with analytics
- `GET /entities/:ledgerEntityId/alerts?unacknowledged=true` - Get alerts
- `POST /alerts/:id/ack` - Acknowledge an alert
- `GET /entities/:ledgerEntityId/recommendations?status=PENDING` - Get recommendations
- `POST /recommendations/:id/approve` - Approve a recommendation
- `POST /recommendations/:id/reject` - Reject a recommendation

The API client is located in `src/lib/aiCfoClient.ts` and provides typed methods for all endpoints.

**Graceful Degradation**: If AI-CFO is unavailable, the app will display a warning but continue to function with CraneLedger data.

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with TypeScript
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Structure

- Keep components small and focused
- Use TypeScript for type safety
- Follow React best practices
- Use shadcn/ui components for consistency
- Implement proper error handling
- Add loading states for all API calls

## Authentication

The current implementation uses a simple localStorage-based authentication system for demonstration purposes. In production, you should implement proper authentication with:

- Backend authentication service
- JWT tokens or session management
- Secure credential storage
- Password hashing
- Multi-factor authentication (optional)

## Read-Only Mode

This application is currently read-only and does not perform any write operations to CraneLedger (except for AI-CFO recommendation approvals which trigger journal entries). All data is fetched and displayed without modification.

## Future Enhancements

Potential features for future versions:

- Real-time data updates with WebSocket
- Advanced charting and visualizations
- Export functionality (PDF, Excel)
- Custom date range selection
- User management and role-based access
- Notifications and alerts
- Comparison views (period over period)
- More write operations (with proper authentication and authorization)

## License

Proprietary - CraneLogic Group

## Support

For issues or questions, please contact the development team.
