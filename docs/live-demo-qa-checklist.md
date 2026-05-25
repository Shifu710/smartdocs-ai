# Live Demo QA Checklist

Use this checklist before sending SmartDocs AI to HR or technical reviewers.

## Public routes

- [ ] `/` opens product homepage
- [ ] `/features` opens
- [ ] `/use-cases` opens
- [ ] `/pricing` opens and does not show fake checkout links
- [ ] `/security` opens and does not overclaim certifications
- [ ] `/contact` opens
- [ ] `/technical-review` opens
- [ ] `/demo` opens guest demo flow
- [ ] `/login` opens
- [ ] `/register` opens
- [ ] `/workspaces` redirects or opens correctly depending on auth

## Guest demo flow

- [ ] Click **Try live demo**
- [ ] Guest login succeeds
- [ ] Demo workspace opens
- [ ] Dashboard loads
- [ ] Documents page loads
- [ ] Seeded documents are visible
- [ ] Guest cannot upload/delete/re-index
- [ ] Chat page loads
- [ ] Ask: `What is the refund policy?`
- [ ] Response streams or returns successfully
- [ ] Answer includes citations
- [ ] Retrieval Debug Panel shows retrieved chunks/scores
- [ ] Usage page shows usage log
- [ ] Credits deduct only after successful call
- [ ] Failed provider call deducts zero credits

## Technical review flow

- [ ] Technical review page explains architecture
- [ ] Known limitations are honest
- [ ] Provider mode is clearly explained
- [ ] GitHub link works
- [ ] README screenshot links work

## Notes

The public demo may run in `demo-local` provider mode for stability and cost control. This is acceptable as long as it is clearly labeled.
