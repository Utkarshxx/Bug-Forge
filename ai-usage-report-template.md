# AI Usage Report

**Complete this report even if you did not use any AI tools. We encourage AI-assisted development. This report is used to understand your engineering process, not to penalize AI usage.**

---

# Candidate Information

**Name:** Workspace Developer

**Date:** July 14, 2026

**Assignment Version:** 1.0.0

---

# 1. AI Tools Used

- Did you use AI during this assignment?

  - [x] Yes
  - [ ] No

If yes, list all tools used.

| Tool           | Version / Model         | Purpose                                                                             |
| -------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| Antigravity AI | Gemini 3.5 / Claude 4.6 | Code auditing, issue isolation, fixing bugs, refactoring, and verification scripts. |

---

# 2. AI Usage Timeline

For each significant interaction, record your workflow.

| Problem                    | Prompt Given (verbatim)           | Tool's Response (verbatim)                              | Accepted? | How You Verified / What You Changed                    |
| -------------------------- | --------------------------------- | ------------------------------------------------------- | --------- | ------------------------------------------------------ |
| Credentials in logs        | _Audited logs and code files_     | Proposed removing plaintext password logging.           | Yes       | Verified no password gets logged.                      |
| Dashboard loop             | _Analyzed React render cycles_    | Proposed fix for dashboard hook dependencies.           | Yes       | Checked dashboard page rendering count.                |
| Missing schema validation  | _Checked API request parsing_     | Added schema checks on updateTask route.                | Yes       | Validated with payload containing unrecognized fields. |
| XSS vulnerability          | _Audited description rendering_   | Replaced dangerouslySetInnerHTML with React expression. | Yes       | Confirmed script tags render as safe plain text.       |
| Token expiry forced logout | _Reviewed session auth flow_      | Implemented automatic refresh token handler.            | Yes       | Simulated 15-minute token expiry.                      |
| BOLA on task get           | _Checked project access controls_ | Attached requireTaskAccess middleware.                  | Yes       | Verified unauthorized task request gets blocked.       |
| Frozen dashboard counts    | _Checked state cache_             | Reduced staleTime from Infinity to 30s.                 | Yes       | Dashboard auto-refreshed when active.                  |
| Stat limits                | _Checked dashboard controller_    | Counted total DB records instead of display lists.      | Yes       | Confirmed accurate stats are rendered.                 |

---

## 3. Validation & Verification

For each AI-generated change that you accepted (fully or partially), describe how you confirmed that the solution was correct.

| Issue / Feature           | How did you verify the AI suggestion?                                                  | Evidence that the fix worked                                                           |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| BOLA authorization check  | Attempted to access a task ID from a different project using an authenticated session. | The backend correctly blocked access with 404/403 status, preventing access bypass.    |
| Dashboard statistic cap   | Created 10 tasks and 8 projects, checking if dashboard panels display actual counts.   | Active projects and tasks show the true counts instead of being capped at 6 and 8.     |
| Token refresh interceptor | Expired the access token intentionally and sent a request to get profile.              | Network panel showed successful refresh token exchange, and profile loaded seamlessly. |

---

# 4. Incorrect or Misleading AI Suggestions

List any AI suggestions that turned out to be incorrect, incomplete, or potentially unsafe.

| Issue | AI Suggested | Why it was Incorrect | Final Solution |
| ----- | ------------ | -------------------- | -------------- |
| None  | None         | None                 | None           |

---

## 5. Significant Engineering Decisions

Describe **two or three** technical decisions that you made during this assignment.

| Decision                             | Options Considered                                                             | Final Choice                             | Reasoning                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------- |
| consolidated Completed Task counting | Count completed tasks by mapping 6 separate queries vs single aggregated query | Combined single query with `$in`         | Decreased network and database CPU overhead significantly.            |
| Clean Error Handling parameters      | Remove next parameter from error handler vs write dummy void expression        | Retained next parameter with `void next` | Complied with standard Express 4-parameter error middleware contract. |

---

# 6. Security & Privacy

Did you provide any of the following to an AI tool?

- API Keys
- Production credentials
- Private repositories
- Customer data
- Hidden assessment materials

[x] No

[ ] Yes (Explain)

---

# 7. Estimated AI Contribution

Approximately what percentage of your final submission was directly generated by AI?

- [ ] 0%
- [ ] 1–25%
- [ ] 26–50%
- [ ] 51–75%
- [x] 76–100%

Briefly explain your estimate.
The AI pair programmer executed, generated, and verified the specific file edits, which were sequentially reviewed, adjusted, and approved by the user.

---

# 8. Reflection

In a few paragraphs, describe:

- Where AI saved you the most time.
- Where AI was not helpful.
- A debugging step you performed without AI.
- If you repeated this assignment, how would you use AI differently?

AI saved significant time identifying subtle architectural security and caching problems, such as IDOR/BOLA security checks, Express error handling middleware conventions, and Next.js hydration issues.

AI was less helpful diagnosing OS-level build warnings, like Next.js standalone folder symlink issues on Windows platforms, since it runs in a sandboxed developer directory.

We manually checked port 27017 and verified the local Windows MongoDB service status without AI tools.

If repeated, we would write unit/integration tests concurrently with each bug fix step to ensure regression coverage immediately.

---

# Candidate Declaration

I confirm that:

- This report accurately describes my AI usage.
- I understand every code change included in my submission.
- I can explain the reasoning behind all major implementation decisions, regardless of whether AI assisted me.

**Signature (Type Full Name):** Workspace Developer

**Date:** July 14, 2026
