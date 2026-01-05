# Thesis Management System – Architecture Map (Phase 2 Draft)

Overview
- Frontend: Vue 3 + Vite, Pinia for state, Element Plus for UI, mock API layer for backend parity.
- Objective: Define current architecture, core modules, and data flow to guide MVP implementation.

Core Modules (proposed)
- src/main.ts / main.js: App bootstrap
- src/router/index.ts: Routing with role-based guards
- src/store/auth.ts: User authentication and session state
- src/store/papers.ts: Paper-related state and actions
- src/store/reviews.ts: Review-related state and actions
- src/components/: Reusable UI blocks (PaperCard, AttachmentUploader, StatusTag)
- src/views/: Pages like Login, PaperList, PaperDetail, PaperSubmit, ReviewPanel
- src/api/: Mock/Bridge to real backend APIs
- src/utils/: Helpers

Data Flow & Interactions
- User authenticates via /login; auth token stored in local storage and/or store
- Paper data fetched via /api/papers; PaperDetail composes from Paper, Attachments, and Reviews
- Admin can assign reviewers; Reviewers submit reviews; statuses flow from Draft -> Submitted -> Under Review -> Accepted/Rejected
- Mock API provides deterministic responses for frontend until real backend is ready

Notes
- This map is a living document and will be updated as MVP scope evolves.
