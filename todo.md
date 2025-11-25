# Finance Cockpit TODO

## Configuration & Setup
- [x] Create src/config.ts with CraneLedger base URL and EzyCrane entity ID
- [x] Create CraneLedger API client (src/lib/craneLedgerClient.ts)
- [x] Define TypeScript interfaces for API responses
- [x] Add environment variable configuration
- [x] Update README.md with setup instructions

## Authentication
- [x] Create /login page with email field and login button
- [x] Implement simple localStorage-based authentication
- [x] Add login state management
- [x] Add route protection (redirect to /login if not authenticated)

## Dashboard Page (/dashboard)
- [x] Create dashboard layout
- [x] Add entity selector component
- [x] Implement Cash (Bank/Clearing) KPI card
- [x] Implement Customer Deposits Held KPI card
- [x] Implement Accounts Receivable KPI card
- [x] Implement Supplier Payouts Upcoming KPI card
- [x] Implement Margin last 30 days KPI card
- [x] Add chart for last 30 days margin/revenue
- [x] Integrate trial balance API
- [x] Integrate P&L API

## Bookings Page (/bookings)
- [x] Create bookings table with all required columns
- [x] Add status filter dropdown
- [x] Add date range filter
- [x] Implement row click navigation to booking details
- [x] Integrate bookings API

## Booking Details Page (/bookings/[id])
- [x] Create booking detail layout
- [x] Display basic booking information
- [x] Show timeline of financial events
- [x] Display mini P&L for booking
- [x] Show linked journal entries
- [x] Integrate booking details API

## Reports Page (/reports)
- [x] Create reports layout
- [x] Add time period dropdown (7 days/30 days/quarter/year)
- [x] Display P&L summary for selected range
- [x] Display balance sheet snapshot
- [x] Integrate P&L and balance sheet APIs

## UI/UX
- [x] Apply clean, minimal SaaS-style design
- [x] Implement responsive layout
- [x] Add loading states (spinners)
- [x] Add error states (error banners)
- [x] Ensure consistent styling with Tailwind

## Testing & Documentation
- [x] Add basic tests for dashboard
- [x] Add basic tests for bookings table
- [x] Update README.md with run instructions
- [x] Document environment variables
- [x] Add example .env.local file

## AI-CFO Integration

### Configuration & Client
- [x] Add AI_CFO_BASE_URL to config.ts
- [x] Create AI-CFO client module (src/lib/aiCfoClient.ts)
- [x] Define TypeScript interfaces for AI-CFO responses
- [x] Update README with AI-CFO configuration instructions

### Dashboard Enhancement
- [x] Integrate AI-CFO Daily Brief into dashboard
- [x] Display cash, runway days, deposits held, GST exposure
- [x] Show margin percentage comparison and trend
- [x] Add narrative summary from AI-CFO
- [x] Handle AI-CFO unavailability gracefully

### Alerts Page
- [x] Create /alerts page
- [x] Fetch and display alerts from AI-CFO
- [x] Show severity, category, title, date, description
- [x] Add acknowledge button for each alert
- [x] Add filter for unacknowledged vs all alerts

### Recommendations Page
- [x] Create /recommendations page
- [x] Fetch and display PENDING recommendations
- [x] Show type, title, description, impact summary
- [x] Add Approve button with success handling
- [x] Add Reject button with optional reason modal
- [x] Add tabs/filters for APPLIED and REJECTED recommendations

### Navigation & UX
- [x] Add Alerts link to navigation
- [x] Add Recommendations link to navigation
- [x] Update active state highlighting
- [x] Add loading states for all AI-CFO calls
- [x] Add error handling for AI-CFO failures

### Testing
- [x] Add tests for AI-CFO client
- [x] Add tests for Dashboard with Daily Brief
- [x] Add tests for Alerts page
- [x] Add tests for Recommendations page

## Vercel Deployment Restructuring

### Project Structure
- [x] Move client/index.html to root index.html
- [x] Move client/src to root src
- [x] Update all import paths to reflect new structure
- [x] Remove server/ directory (not needed for static frontend)
- [x] Remove shared/ directory (not needed for static frontend)

### Build Configuration
- [x] Simplify package.json scripts (dev, build, preview)
- [x] Remove @builder.io/vite-plugin-jsx-loc plugin
- [x] Remove custom esbuild step from build script
- [x] Simplify vite.config to standard Vite + React setup
- [x] Remove vite-plugin-manus-runtime if causing issues

### Environment Variables
- [x] Verify all env vars use VITE_ prefix
- [x] Update .env.example with all required variables
- [x] Document env vars in README

### Testing
- [x] Test npm install locally
- [x] Test npm run build locally
- [x] Verify all features still work after restructuring
- [x] Verify dist/ output is correct for static hosting
