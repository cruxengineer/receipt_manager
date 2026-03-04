# Phase 1: Project Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish tech stack, project structure, and development environment for a mobile-first static web app. This includes selecting and configuring the framework, build tool, AI vision provider, and deployment pipeline. The app must work smoothly on iPhone Safari and be deployable as a static site with PWA capabilities.

</domain>

<decisions>
## Implementation Decisions

### AI Vision Provider
- **Provider:** Anthropic Claude with vision capabilities
- **Model:** Claude 3.5 Sonnet (best balance of speed, accuracy, cost)
- **Pricing:** ~$0.01-0.02 per receipt, target <5 second response time
- **API key management:** Environment variable (`ANTHROPIC_API_KEY` in `.env.local`)
- **Mock mode:** Environment flag (`VITE_MOCK_MODE=true`) returns hardcoded sample receipt data for testing

### Styling & UI Approach
- **CSS framework:** Tailwind CSS (utility-first, excellent mobile support, small bundle)
- **Component library:** shadcn/ui (copy-paste Tailwind components, customizable, accessible)
- **Color coding:** Blue for Person A, Green for Person B (high contrast, colorblind-friendly)
- **Mobile-first strategy:** Touch-first design with desktop support (44x44pt minimum touch targets)

### Claude's Discretion
The following were not explicitly discussed - Claude has flexibility here:
- Framework & language: React + TypeScript (recommended default - familiar ecosystem, type safety, strong mobile support)
- Build tool: Vite + React Router (fast dev server, simple static deployment, flexible routing)
- Deployment target: Choose among Vercel, Netlify, or Cloudflare Pages based on ease of setup
- Testing setup: Decide during implementation (Vitest for unit tests if needed)
- Project structure: Follow standard Vite + React conventions (src/, public/, components/, etc.)
- Animation library for swipe gestures: Research and choose appropriate library (Framer Motion, React Spring, or custom)
- PWA manifest configuration: Standard setup for home screen installation
- Loading states and error UI: Use shadcn/ui patterns with Tailwind styling

</decisions>

<specifics>
## Specific Ideas

- iPhone Safari is the primary target - test thoroughly on iOS
- Static hosting with zero backend - client-side only architecture
- Environment variables for configuration (API keys, feature flags)
- Routing flow: home → capture → swipe → summary (4 main routes)
- PWA-friendly: must be installable to home screen per DEPL-03

</specifics>

<code_context>
## Existing Code Insights

### Current State
- Empty project except for README.md and planning artifacts
- No src/ directory or package.json yet
- Git repository initialized

### Foundation Requirements
- Must scaffold from scratch with Vite + React + TypeScript
- Need to set up Tailwind CSS + shadcn/ui from zero
- CI/CD pipeline for static deployment (GitHub Actions likely)
- .env.local for API keys (must be git-ignored)

### Integration Points
- Anthropic API client setup for vision calls
- Mock mode switch for development/testing without API costs
- Routing structure that supports swipe navigation flow

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-foundation*
*Context gathered: 2026-03-03*
