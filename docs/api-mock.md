# Thesis Management System – Mock API Design (Draft)

Purpose
- Provide a stable local API surface for frontend development before backend is ready.

Endpoints (Draft)
- POST /api/auth/login
  - Body: { email, password }
  - Response: { token, user: { id, name, email, role } }
- GET /api/users
  - Response: [{ id, name, email, role, department }, ...]
- GET /api/papers
  - Query: status, search, page, size
  - Response: { total, items: [ Paper ] }
- POST /api/papers
  - Body: { title, abstract, keywords, authors, supervisorId, attachments }
  - Response: { id, ...paper, status: 'Draft' }
- GET /api/papers/{id}
  - Response: Paper with details
- POST /api/papers/{id}/reviews
  - Body: { reviewerId, score, comments, decision }
  - Response: Review object
- GET /api/reviews?paperId={id}
  - Response: [ Review ]

Mock Data Considerations
- Pre-populated users: students, reviewers, admins
- Papers with varying statuses and sample attachments
- Simple in-memory store with incremental IDs

Usage Notes
- Update endpoints as UI/API contracts evolve; keep mock data consistent with frontend expectations.
