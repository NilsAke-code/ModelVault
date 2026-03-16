# 3DModelVault — Project Guide

## Project Overview
A web app called **3DModelVault** for uploading, organizing, sharing, and downloading 3D models. The app uses a deep green color palette with a clean, modern layout.

## Tech Stack
- **Orchestration:** .NET Aspire
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** C# with ASP.NET Core Web API
- **Database:** SQL Server (Aspire Docker container) + Dapper (no Entity Framework)
- **Auth:** Microsoft account login (Microsoft Entra ID / MSAL)

## Core Features

### All Models
- Browse all available 3D models (seeded mock data + teacher uploads)
- Card layout with thumbnails, titles, authors, download/like counts
- Filter by category via toggleable sidebar
- Sort by: Newest, Downloads, Likes
- Search functionality via top bar
- Publicly accessible — no login required

### My Library (user's own uploads)
- Upload 3D model files (STL, 3MF) with thumbnail image — both stored on server
- Add title, description, and tags/categories
- Search and filter own models
- Edit and delete own models
- Same layout as All Models but scoped to the logged-in user

### Authentication
- Microsoft account login via MSAL
- Browsing and downloading is public — no login required
- Login required only for: uploading, editing, and deleting models

### Likes
- Simple counter — no per-user tracking
- Anyone can like a model without logging in

## Pages / Routes
- `/` — Home page with category chips, featured models, and a model card grid
- `/models` — All Models page with toggleable sidebar filters and vertical model list
- `/library` — User's own uploaded models (auth required)
- `/library/upload` — Upload new model (auth required)
- `/model/:id` — Single model detail page with description and download button

## Layout & UI Structure

### Global Layout
- **Left sidebar** (fixed, ~180px wide): Logo/app name top-left, vertical nav links below:
  - Home
  - All Models
  - (separator)
  - "You" section header
  - My Library
  - (separator)
  - Footer links at bottom of sidebar
- **Top bar** (spans content area to the right of sidebar): Search bar centered, profile/avatar and login button on the right
- **Content area**: Everything to the right of sidebar and below top bar
- **Responsive**: On mobile/tablet the sidebar collapses to a hamburger menu, content goes full width

### Home Page (`/`)
- **Tab row** at top of content area: horizontal pill/chip buttons for quick category filtering (e.g. "For You", "Trending", "Education", "Gadgets", "Toys & Games"). Active tab has accent fill, others are outlined/dark
- **Hero banner**: Optional area for announcements or featured model spotlight
- **Model grid**: Responsive grid of model cards, 4-5 columns on desktop, 2 columns on tablet, 1 on mobile. Each card:
  - Large thumbnail image (rounded corners, ~16:10 ratio)
  - Model title below image (bold, single line truncated)
  - Author avatar + author name row
  - Stats row: download icon + count, like icon + count
  - Hover effect: slight translateY(-2px) + shadow increase

### All Models Page (`/models`)
- **Top control bar**:
  - Left side: "Filters" / "Hide Filters" toggle button — clicking shows/hides the entire left filter sidebar with a smooth collapse animation
  - Right side of control bar: Sort options as text links — **Newest**, **Downloads**, **Likes** — active sort in accent color
- **Two-column layout** (when filters visible):
  - **Left filter sidebar** (~250px, toggleable):
    - "Categories" section: vertical list of category links (All, Education, Art, Gadgets, Household, Tools, Toys & Games, Mechanical, Miniatures). Active category highlighted with accent color. Chevron arrows for visual consistency
    - "Tags" section: horizontal pill buttons for quick tag filtering (e.g. Featured, Customizable, Parametric, Print-in-Place)
    - "Reset All Filters" button at bottom
  - **Right content area**: Vertical stacked model cards (single column, large landscape cards). Each card:
    - Large landscape thumbnail
    - Title below thumbnail (bold)
    - Author avatar + name
    - Download count + like count aligned right
- When filters are hidden, the content area expands to full width

### My Library Page (`/library`)
- Same layout as All Models but filtered to logged-in user's uploads only
- Prominent "Upload New Model" button at top
- Edit/delete action buttons visible on each card

### Model Detail Page (`/model/:id`)
- Large image/thumbnail display at top
- Title, author info, stats (downloads, likes)
- Description section
- Tags displayed as pill chips
- Prominent "Download" button — downloads the STL/3MF file
- File info (file type, file size)

### Upload Page (`/library/upload`)
- Clean form layout:
  - Drag-and-drop zone for 3D model file (STL, 3MF)
  - Drag-and-drop zone for thumbnail image
  - Title input
  - Description textarea
  - Category dropdown (fixed list matching All Models categories)
  - Tags input (multi-select or comma-separated)
  - Submit button

## Design Style

### Theme — Deep Forest Green
Dark theme built on a deep forest green palette with bright emerald and lime/chartreuse accents. Rich, modern, botanical-meets-tech aesthetic.

### Color Palette (define as Tailwind theme variables in tailwind.config)
```
--bg-primary:    #0a1f0a   (very dark blackish-green — main page background)
--bg-secondary:  #0f2b0f   (slightly lighter dark green — sidebar background)
--bg-card:       #163016   (muted dark green — card surfaces)
--bg-card-hover: #1c3c1c   (card hover state)
--text-primary:  #e8f5e8   (near-white with green tint — main text)
--text-secondary:#7fa97f   (muted sage green — secondary/meta text)
--accent:        #4ade80   (bright emerald green — buttons, active states, links)
--accent-hover:  #22c55e   (deeper green — hover on interactive elements)
--highlight:     #d0ff00   (lime/chartreuse — badges, special counters, attention-grabbing pops)
--border:        #1e3a1e   (subtle green-tinted borders)
--input-bg:      #122612   (form input backgrounds)
```

### Typography
- Use a modern, distinctive sans-serif — avoid generic defaults (Arial, Inter, Roboto, system-ui)
- Suggested options: "Plus Jakarta Sans", "Outfit", "Satoshi", or "General Sans"
- Clear hierarchy: bold titles in --text-primary, lighter metadata in --text-secondary

### Spacing & Polish
- Consistent padding and gaps using Tailwind spacing scale
- Rounded corners on cards: rounded-lg or rounded-xl
- Subtle hover transitions on all interactive elements (150-200ms ease)
- Card hover: translateY(-2px) + shadow with faint green-tinted glow
- Active nav items: accent-colored left border or subtle background highlight
- Buttons: accent background (#4ade80) with dark text (#0a1f0a), rounded-lg
- Smooth collapse/expand animation on filter sidebar toggle

### Responsive Design
- Desktop: full sidebar + content layout as described
- Tablet (~768px): sidebar collapses to hamburger, model grid 2 columns
- Mobile (~480px): hamburger nav, model grid 1 column, stacked layout
- Touch-friendly tap targets (min 44px)
- Search bar adapts to available width

## Puppeteer Screenshot Loop
After making visual/design changes to the frontend:
1. Run the screenshot script to capture current state of key pages
2. Analyze the screenshots for design quality — spacing, alignment, color consistency, typography hierarchy, hover states, responsive behavior
3. If the design doesn't meet the quality bar, make improvements and repeat
4. Continue iterating until the design looks polished and consistent

Install Puppeteer as a dev dependency:
```bash
npm install puppeteer --save-dev
```

Create a screenshot utility script at `tools/screenshot.ts` that:
- Launches headless Chrome
- Navigates to localhost dev server
- Takes full-page screenshots of key pages: home, models, library, model detail, upload
- Also takes screenshots at mobile viewport width (390px)
- Saves all screenshots to `tools/screenshots/`

## Mock / Seed Data
- Pre-populate the database with 20-30 mock models across all categories on first run
- Use placeholder thumbnail images from Unsplash/Picsum with 3D-printing and tech themes (search terms: "3d printing", "3d model", "prototype", "tech gadget", "mechanical parts")
- Each mock model should have realistic titles, descriptions, varied categories, tags, and randomized download/like counts
- Mock author names and avatars for variety
- Flag all seed data with IsExploreModel = true so it's distinguishable from real uploads

## Database Schema (Dapper + SQL Server)

### Models table
- Id (int, PK, identity)
- Title (nvarchar)
- Description (nvarchar)
- FilePath (nvarchar) — path to stored STL/3MF file on disk
- ThumbnailPath (nvarchar) — path to stored thumbnail image on disk
- Category (nvarchar)
- AuthorId (nvarchar) — Microsoft account ID
- AuthorName (nvarchar)
- Downloads (int, default 0)
- Likes (int, default 0)
- CreatedAt (datetime2)
- UpdatedAt (datetime2)
- IsExploreModel (bit) — true for seeded mock data, false for real uploads

### Tags table
- Id (int, PK, identity)
- Name (nvarchar, unique)

### ModelTags table (junction)
- ModelId (int, FK → Models.Id)
- TagId (int, FK → Tags.Id)
- Primary key on (ModelId, TagId)

## Project Structure
```
/
├── ModelVault.AppHost/              # .NET Aspire host
├── ModelVault.Api/                  # C# Web API backend
│   ├── Endpoints/                   # Minimal API endpoint definitions
│   ├── Repositories/                # Dapper SQL queries
│   ├── Models/                      # C# data models / DTOs
│   ├── Services/                    # Business logic
│   └── Seed/                        # Database seed data (mock models)
├── modelvault-frontend/             # React + TS + Tailwind
│   ├── src/
│   │   ├── components/              # Reusable UI components (ModelCard, Sidebar, FilterBar, etc.)
│   │   ├── pages/                   # Page components (Home, Models, Library, ModelDetail, Upload)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client / fetch wrappers
│   │   └── types/                   # TypeScript interfaces
│   └── tools/
│       ├── screenshot.ts            # Puppeteer screenshot utility
│       └── screenshots/             # Screenshot output folder
└── ModelVault.ServiceDefaults/      # Aspire shared config
```

## File Storage
- Uploaded model files (STL, 3MF) and thumbnail images are stored on disk
- Configurable upload path (default: `uploads/` directory under the API project)
- Never store binary files in the database
- Seed data thumbnails use external placeholder image URLs

## API Endpoints
- `GET    /api/models`              — list models (query params: ?search, ?category, ?tag, ?sort=newest|downloads|likes)
- `GET    /api/models/:id`          — single model with full details
- `POST   /api/models`              — upload new model with file + thumbnail (auth required, multipart/form-data)
- `PUT    /api/models/:id`          — update model metadata (auth required)
- `DELETE /api/models/:id`          — delete model + files from disk (auth required)
- `GET    /api/models/:id/download` — increment download count + return file stream
- `POST   /api/models/:id/like`     — increment like count (simple counter, no auth required)
- `GET    /api/tags`                — list all available tags
- `GET    /api/categories`          — list all categories (fixed list)

## Important Notes
- Use Dapper for ALL database access — no Entity Framework anywhere
- Keep raw SQL queries organized in repository classes
- Use Microsoft.Identity.Web for auth middleware
- Store uploaded files on disk in a configurable path — never store binary files in the database
- Seed the database with mock models on first run (check if data exists first to avoid duplicates)
- All colors must be defined in Tailwind config using the CSS variables above — never hardcode colors in components

- Categories are a fixed list, not user-created
- SQL Server runs as an Aspire Docker container resource
