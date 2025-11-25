# Finance Cockpit

A read-only operational dashboard for EzyCrane Pty Ltd that connects to the CraneLedger API to display real-time financial data, KPIs, bookings, and reports.

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

- **Frontend Framework**: React 19 + TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Build Tool**: Vite
- **API Clients**: 
  - Custom fetch-based client for CraneLedger
  - Custom fetch-based client for AI-CFO

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm (or npm/yarn)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

Copy the example environment file and update the values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# CraneLedger API Base URL
VITE_CRANE_LEDGER_BASE_URL=https://your-craneledger-instance.com

# EzyCrane Entity ID in CraneLedger
VITE_EZYCRANE_ENTITY_ID=your-entity-id-here

# AI-CFO API Base URL
VITE_AI_CFO_BASE_URL=http://localhost:4000
```

### Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Project Structure

```
client/
  src/
    components/
      DashboardLayout.tsx    # Main layout with navigation
      ui/                    # shadcn/ui components
    contexts/
      AuthContext.tsx        # Authentication state management
      ThemeContext.tsx       # Theme management
    lib/
      craneLedgerClient.ts   # CraneLedger API client
      aiCfoClient.ts         # AI-CFO API client
      types.ts               # CraneLedger type definitions
      aiCfoTypes.ts          # AI-CFO type definitions
    pages/
      Login.tsx              # Login page
      Dashboard.tsx          # Dashboard with KPIs and AI-CFO brief
      Bookings.tsx           # Bookings table
      BookingDetail.tsx      # Individual booking details
      Alerts.tsx             # AI-CFO alerts
      Recommendations.tsx    # AI-CFO recommendations
      Reports.tsx            # Financial reports
    config.ts                # Application configuration
    App.tsx                  # Main app with routing
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

The API client is located in `client/src/lib/craneLedgerClient.ts` and provides typed methods for all endpoints.

### AI-CFO API

The app connects to AI-CFO (analytics and recommendations service) using the following endpoints:

- `GET /entities` - List all entities
- `GET /entities/:ledgerEntityId/brief` - Get daily CFO brief with analytics
- `GET /entities/:ledgerEntityId/alerts?unacknowledged=true` - Get alerts
- `POST /alerts/:id/ack` - Acknowledge an alert
- `GET /entities/:ledgerEntityId/recommendations?status=PENDING` - Get recommendations
- `POST /recommendations/:id/approve` - Approve a recommendation
- `POST /recommendations/:id/reject` - Reject a recommendation

The API client is located in `client/src/lib/aiCfoClient.ts` and provides typed methods for all endpoints.

**Graceful Degradation**: If AI-CFO is unavailable, the app will display a warning but continue to function with CraneLedger data.

## Configuration

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code:

- `VITE_CRANE_LEDGER_BASE_URL` - Base URL for the CraneLedger API (default: development instance)
- `VITE_EZYCRANE_ENTITY_ID` - Entity ID for EzyCrane in CraneLedger
- `VITE_AI_CFO_BASE_URL` - Base URL for the AI-CFO API (default: http://localhost:4000)

### Changing API Endpoints

To point to different API instances:

1. Update `VITE_CRANE_LEDGER_BASE_URL` and/or `VITE_AI_CFO_BASE_URL` in `.env.local`
2. Restart the development server

Example `.env.local`:
```env
VITE_CRANE_LEDGER_BASE_URL=https://craneledger.production.com
VITE_AI_CFO_BASE_URL=https://ai-cfo.production.com
VITE_EZYCRANE_ENTITY_ID=94ea44d8-c8ca-43b2-8a78-8eabb5639618
```

## Authentication

The current implementation uses a simple localStorage-based authentication system for demonstration purposes. In production, you should implement proper authentication with:

- Backend authentication service
- JWT tokens or session management
- Secure credential storage
- Password hashing
- Multi-factor authentication (optional)

## Read-Only Mode

This application is currently read-only and does not perform any write operations to CraneLedger. All data is fetched and displayed without modification.

## Future Enhancements

Potential features for future versions:

- Real-time data updates with WebSocket
- Advanced charting and visualizations
- Export functionality (PDF, Excel)
- Custom date range selection
- User management and role-based access
- Notifications and alerts
- Comparison views (period over period)
- Write operations (with proper authentication and authorization)

## License

Proprietary - CraneLogic Group

## Support

For issues or questions, please contact the development team.
