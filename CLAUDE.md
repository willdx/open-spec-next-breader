<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Plasmo + Next.js hybrid extension project. Use parallel development commands:

```bash
# Development (runs both Plasmo extension and Next.js app in parallel)
npm run dev
# or
pnpm dev

# Individual development servers
npm run dev:plasmo  # Plasmo extension development
npm run dev:next    # Next.js app on port 1947

# Production build
npm run build
# or
pnpm build
```

## Architecture

This project combines a Plasmo browser extension with a Next.js application:

- **Plasmo Extension**: Built in `src/popup/` with the main popup component at `src/popup/index.tsx`
- **Next.js App**: Standard Next.js app in `src/app/` with pages and layouts
- **Shared Components**: Reusable React components in `src/components/` (currently `Main.tsx`)
- **Path Aliases**: Uses `~*` mapping to `./src/*` for imports

### Key Structure
- `src/popup/index.tsx` - Extension popup entry point
- `src/app/page.tsx` - Next.js app main page
- `src/app/layout.tsx` - Next.js app root layout
- `src/components/main.tsx` - Shared Main component used by both popup and app

### Extension Configuration
- Manifest V3 with host permissions for `https://*/*`
- Tabs permission enabled
- Chrome MV3 build output in `build/chrome-mv3-dev/` during development

## Development Notes
- The extension popup and Next.js app share the same Main component but with different props
- Extension loads from `build/chrome-mv3-dev/` during development
- TypeScript configuration extends Plasmo base with Next.js plugin support