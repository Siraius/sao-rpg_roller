# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **SAO RPG Dice Roller** web application built with Next.js 15. It's designed to handle dice rolling for tabletop RPG sessions, specifically implementing the SAO RPG system with BD (Basic Dice), CD (Combo Dice), LD (Lucky Dice), and MD (Modifier Dice).

## Development Commands

### Core Development
- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build`  
- **Production server**: `npm start`
- **Linting**: `npm run lint`

### Docker Development
- **Start containerized dev environment**: `docker-compose up`
- **Rebuild container**: `docker-compose up --build`

The Docker setup includes hot-reload support and runs on port 3000.

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Neon (PostgreSQL serverless)  
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Dice Engine**: @dice-roller/rpg-dice-roller
- **UI Components**: Radix UI primitives with class-variance-authority

### Directory Structure
```
app/                  # Next.js App Router pages and layouts
├── page.tsx         # Main dice roller interface with form
├── layout.tsx       # Root layout with fonts
└── globals.css      # Global Tailwind styles

components/          # React components
└── ui/             # shadcn/ui components
    ├── button.tsx   # Customized button component
    └── diceroll.tsx # Dice rolling logic component

lib/                 # Shared utilities
└── utils.ts        # Tailwind class merging utility
```

### Database Schema
The application uses 5 main database tables:
- **app_user**: `(userid, name, email)`
- **character**: `(characterid, name, class, owneruserid, campaignid)`
- **campaign**: `(campaignid, name, title, system, ispublic)`
- **session**: `(sessionid, title, campaignid, starttime, endtime)`  
- **roll**: `(rollid, userid, purposeid, sessionid, characterid, postid, ts)`
- **post**: `(postid, url, description)`
- **dietype**: `(dietypeid, code, name, sides)`
- **dieresult**: `(dieresultid, rollid, dietypeid, value)`

### Key Components

**Main Page (`app/page.tsx`)**:
- Server action form handling for database inserts
- Form fields for user/character/campaign data
- Integration with Neon database via serverless functions
- Currently has placeholder dice roll values (not connected to dice component)

**Dice Roll Component (`components/ui/diceroll.tsx`)**:
- Client-side dice rolling using @dice-roller/rpg-dice-roller
- SAO RPG system: BD (1d10), CD (1d12), LD (1d20), MD (1d10)
- React state management for roll results
- Currently not integrated with main form

### Configuration Files
- **components.json**: shadcn/ui configuration (New York style, RSC enabled)
- **tsconfig.json**: Path aliases set up (`@/*` maps to root)
- **docker-compose.yml**: Development containerization

## Environment Setup

**Required Environment Variables**:
- `DATABASE_URL`: Neon database connection string

**Font Configuration**:
- Uses Geist and Geist Mono fonts from next/font/google
- CSS variables: `--font-geist-sans`, `--font-geist-mono`

## Current State & Known Issues

1. **Dice Integration**: The main form has placeholder dice roll values but doesn't use the actual dice rolling component
2. **Form Submission**: Form creates database entries but doesn't display or use the dice roll results
3. **Search Functionality**: Search fields are present in UI but not implemented
4. **Error Handling**: No error handling for database operations or form validation

## Development Context

When working on this codebase:
- The main challenge is connecting the dice rolling logic to the form submission
- Database operations use Neon's serverless SQL with parameterized queries
- The UI follows a gray-themed design with responsive flexbox layouts
- Components use the shadcn/ui design system with Tailwind CSS