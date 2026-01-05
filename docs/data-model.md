# Thesis Management System – Data Model (Draft)

Entities
- User: { id, name, email, role, department }
- Paper: { id, title, abstract, keywords, authors: [userId], supervisorId, status, submissionDate, attachments }
- Review: { id, paperId, reviewerId, score, comments, decision, date }
- Assignment: { paperId, reviewerId, role }
- Comment: { id, paperId, authorId, content, date }
- Attachment: { id, paperId, filename, url }

Relationships
- Paper <-> User: many-to-many (authors)
- Paper -> Review: one-to-many
- Paper -> Assignment: one-to-many
- Paper -> Comment: one-to-many

Notes
- This schema focuses on frontend MVP needs; backend may evolve this model.
