# News Location - Source Directory

This directory contains all the source code for the News Location (pinews) application.

## Project Structure

- `app/`: Next.js application routes and pages
  - `auth/`: Authentication related components
  - `dashboard/`: Admin dashboard components
  - `map/`: Location-based news mapping functionality

- `components/`: Reusable UI components
  - `ui/`: Base UI components (buttons, inputs, etc.)
  - `dashboard/`: Dashboard specific components

- `config/`: Application configuration
  - HTTP and map related configurations

- `hooks/`: Custom React hooks

- `lib/`: Utility functions

- `server/`: Server-side code and database operations

- `shared/`: Shared enumerations and constants

- `types/`: TypeScript type definitions

- `utils/`: Additional utility functions

## Key Features

- Location-based news aggregation
- Interactive map interface
- Admin dashboard for managing news sources

## Development

To start the development server:
```bash
npm run dev