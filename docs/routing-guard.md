# Thesis Management System – Routing Guard (Draft)

Purpose
- Define the basic role-based routing guard to enforce access control in MVP.

Routing Tree (Draft)
- /login (Public)
- /dashboard (Auth-only)
- /papers (Auth, Students/Admins/Reviewers)
- /papers/new (Auth, Students/Admins)
- /papers/:id (Auth, All roles)
- /papers/:id/reviews (Auth, Reviewer/Admin for that paper)

Role Mapping (Initial)
- Student: can view/submit own papers; view paper detail
- Reviewer: can view assigned papers; submit reviews
- Admin: can manage users and assignments; view all papers

Guard Logic (High Level)
- If route requiresAuth, ensure token present
- If route defines roles, ensure currentUser.role is in allowed roles
- If not authenticated or role not authorized, redirect to /login

Implementation Notes
- Use router.beforeEach to enforce checks based on route.meta.requiresAuth and route.meta.roles
- Store and retrieve currentUser from Pinia (auth store) or localStorage
