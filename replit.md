# おしかけログ (Oshikake Log)

## Overview
「おしかけログ」は、横浜F・マリノスのサポーター向けに特化した観戦記録Webアプリケーションです。ユーザーは観戦した公式試合の記録、それに伴う交通費、チケット代、飲食費などの費用を詳細に追跡できます。本サービスは、観戦記録から得られる勝敗、費用合計、平均費用などの統計データをユーザーに提供し、観戦体験の振り返りと費用管理をサポートすることを目的としています。将来的には、ユーザーエンゲージメントを高める新機能の追加や、よりパーソナライズされた体験の提供を目指しています。

## User Preferences
特にありません。

## System Architecture
### UI/UX Decisions
- **Color Scheme**: Uses the Marinos tricolor (blue #0022AA, white, red #C8102E) sparingly, with blue as the main color and red for minimal accents.
- **Mobile-First Design**: The application is designed with a mobile-first approach, ensuring responsiveness across devices.
- **Component Library**: Based on `shadcn/ui` components for a consistent and modern look.
- **Design Refresh**: A comprehensive design refresh for the Landing Page, incorporating scroll animations (`FadeInSection`) and adhering to an 8pt spacing rule.
- **Image Assets**: Uses seven custom-created images for the landing page (`lp-hero.png`, `lp-pain.png`, `lp-step-1/2/3.png`, `lp-stats.png`, `lp-future.png`) with no internal text.
- **Icons**: Implemented favicons and PWA-related icons (`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-icon-512.png`, `og-image.png`, `manifest.webmanifest`).

### Technical Implementations
- **Frontend**: Developed with React 19, Vite 7, and TailwindCSS 4. It includes pages for Home, Matches, MatchDetail, and Landing, along with reusable UI components and a tRPC client.
- **Backend**: Built with Express and tRPC, managing core server infrastructure (authentication, Vite middleware), API endpoints via tRPC routers, and database operations.
- **Database**: Utilizes MySQL with Drizzle ORM for schema definition and migrations. Includes tables for `userMatches`, `matchExpenses`, `auditLogs`, and `eventLogs`.
- **Shared Utilities**: A `shared/` directory contains types and utilities used by both client and server, including DTOs (`MatchDTO`, `StatsSummaryDTO`) and formatters (`formatCurrency`, `formatDateTime`, `formatWDL`, `formatScore`, `calcAverage`).
- **Billing System**: Implemented a 3-tier (Free/Plus/Pro) subscription model with Stripe integration for checkout, portal sessions, and webhook handling. Features include entitlement management (`getEntitlements`), plan limits (`getPlanLimit`), and effective plan calculation (`getEffectivePlan`).
- **Match Data Management**: Features include:
    - Storing match attendance and expense data in the database.
    - Retrieving official match data from external sources (e.g., Marinos official website) via `unified-scraper.ts`.
    - Normalizing `matchUrl` and generating `matchKey` to prevent duplicates.
    - Tracking sync logs (`syncLog`) for scraper operations.
- **Statistics Module**: Provides APIs (`stats.getSummary`, `stats.getAvailableYears`) for calculating and displaying attendance counts, win/draw/loss records, total expenses, and average expenses per match, with support for year selection.
- **User Authentication**: Handled via session secrets and includes OAuth warning level adjustments to allow app functionality without authentication.
- **Error Handling**: Standardized error display using `TRPCError` with a `LIMIT_REACHED` code for plan restrictions, and unified error presentation using `QueryState` components.
- **Deployment**: Configured for Replit environment, including Vite configuration for proxy and server binding.

### Feature Specifications
- **Attendance Logging**: Users can record matches they attended, including detailed expense tracking (transportation, tickets, food, other).
- **Match Display**: Visual distinction between past and future matches, color-coded HOME/AWAY badges, tournament and section information, and Google Maps links for venues.
- **Statistics Dashboard**: Displays aggregated data (total matches, win/draw/loss record, total cost, average cost) with filtering by year.
- **Subscription Plans**: Free, Plus, and Pro plans with varying limits on recorded matches and access to advanced features (e.g., export, multi-season, advanced stats, priority support).
- **Landing Page**: Comprehensive landing page explaining the service, including FAQs, and a pricing comparison table.
- **UX Improvements**: Enhanced attendance form UX with placeholders and validation, improved error display, responsive mobile design, and asynchronous data synchronization with loading and toast notifications.

## External Dependencies
- **Database**: MySQL
- **Payment Gateway**: Stripe (for billing and subscription management)
- **Frontend Framework**: React
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **ORM**: Drizzle ORM
- **API Layer**: tRPC
- **Server Framework**: Express
- **Package Manager**: pnpm
- **Analytics**: Optional integration via `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID`