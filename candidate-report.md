# BugForge Engineering Assessment Report

## Executive Summary

This report summarizes the investigation, fixes, verification, and remaining risks identified in the BugForge application. Over the course of the assessment, we systematically audited the codebase (both frontend and backend), fixed critical functional defects, closed major security vulnerabilities, resolved compilation/linter warnings, and optimized database queries. All fixes have been verified locally via automated unit tests and manual behavior checking.

---

## Issues Found, Severity, Impact, and Root Cause

| Issue # | Component | Description & Root Cause                                                                           | Severity     | Impact                                             | Fix & Resolution                                                                             |
| :------ | :-------- | :------------------------------------------------------------------------------------------------- | :----------- | :------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| **1**   | API       | **Plaintext Passwords in Logs**: Plaintext passwords were being logged to server logs.             | **High**     | Credentials leak in logs.                          | Removed password from `req.log.info` in login flow.                                          |
| **2**   | Web       | **Dashboard Infinite Re-render Loop**: Component state logic caused infinite dashboard re-renders. | **Medium**   | App crash, high CPU, rate limit exhaustion.        | Corrected the dependency hooks and rendering states on dashboard.                            |
| **3**   | API       | **Missing Schema Validation in Update Task**: Task updates bypassed Zod schema parsing.            | **Medium**   | Database pollution with invalid field data.        | Added Zod schema validation using `taskSchema.partial().parse()`.                            |
| **4**   | Web       | **Stored XSS Vulnerability**: Project descriptions rendered using `dangerouslySetInnerHTML`.       | **High**     | Malicious scripts run in users' browsers.          | Replaced `dangerouslySetInnerHTML` with standard safe React rendering.                       |
| **5**   | Web       | **Stale Token Cleanup**: Local storage values were cleared indiscriminately on logout.             | **Low**      | Stale tokens/settings state.                       | Updated logout logic to selectively and cleanly purge auth keys.                             |
| **6**   | API       | **Missing Route Registrations for Comments**: Update and delete comments endpoints were missing.   | **High**     | Users unable to update/delete comments.            | Registered patch/delete comment routes in index router.                                      |
| **7**   | Web       | **Memory Leak in Notification Polling**: Polling interval was never cleared on component unmount.  | **Low**      | Browser performance degradation.                   | Cleaned up polling interval using useEffect return cleanup function.                         |
| **8**   | API       | **Incomplete Database Session Cleanup**: Logout did not clear refresh token from database.         | **Medium**   | Session hijacking risk.                            | Updated DB query to explicitly `$unset` the user's refresh token on logout.                  |
| **9**   | API       | **Inactive Express Error Handler**: Global handler was ignored due to missing 4th `next` param.    | **High**     | Server crashes and unhandled error responses leak. | Restored 4-argument signature to ensure Express invokes the handler.                         |
| **10**  | API       | **Loose ObjectId Validation**: Input IDs were not checked for standard Mongoose format.            | **Medium**   | DB query errors / unexpected cast crashes.         | Added 24-character hex regex validation to Zod ObjectId parser.                              |
| **11**  | API       | **Unpopulated Comment Updates**: Author profiles vanished from comments on edit.                   | **Low**      | Broken frontend user interface.                    | Added `.populate('author')` to the return payload of `updateComment`.                        |
| **12**  | API       | **Missing Admin Role Check**: Admin permissions were not honored in task controller check.         | **Medium**   | Admins unable to manage specific task operations.  | Restructured task project checker to recognize and permit admin role.                        |
| **13**  | API       | **Dangling Comments on Task Delete**: Deleting tasks did not delete nested comments.               | **Low**      | Orphaned data/pollution.                           | Implemented cascade deletion of comments in the deleteTask controller.                       |
| **14**  | API       | **Dangling Tasks/Comments on Project Delete**: Project deletion left tasks and comments behind.    | **Medium**   | Orphaned data/pollution.                           | Added cascade query to delete all tasks and comments associated with project.                |
| **15**  | API       | **Crashing Middleware on Project Access**: Missing try/catch caused crashes on invalid params.     | **Medium**   | Backend service crashes.                           | Wrapped the middleware execution in a robust try/catch block.                                |
| **16**  | API       | **Avatar URL Validation**: Zod rejected empty strings or null values on update.                    | **Low**      | Profile updates failed for users.                  | Allowed nullable and empty strings in the Zod profile schema.                                |
| **17**  | Web       | **React Hydration Mismatch**: Theme toggle button mismatched initial state.                        | **Medium**   | Disrupted UI hydration.                            | Added mounted check hook to defer rendering until hydration completes.                       |
| **18**  | Web       | **Forced Session Expirations (Token Refresh)**: No frontend mechanism to use refresh tokens.       | **High**     | Forced logouts every 15 minutes.                   | Integrated fetch interceptor to exchange refresh token on 401 response.                      |
| **19**  | API       | **Broken Object-Level Authorization (BOLA)**: GET `/tasks/:taskId` lacked project access check.    | **Critical** | Read bypass of unauthorized tasks.                 | Attached `requireTaskAccess` middleware to task retrieval endpoint.                          |
| **20**  | Web       | **Frozen Dashboard Data**: Dashboard used `staleTime: Infinity`.                                   | **Medium**   | Stale metrics and status reports.                  | Reduced `staleTime` to 30 seconds for automatic data refreshing.                             |
| **21**  | Workspace | **Linter & Type Errors**: Windows environments failed to build/lint.                               | **Medium**   | Failed CI pipelines.                               | Fixed availableProject typing, resolved unused vars, made lint script cross-platform.        |
| **22**  | API       | **Inaccurate & Capped Dashboard Stats**: Statistics capped by paginated limits.                    | **Medium**   | Wrong statistics displayed.                        | Restructured dashboard queries to count true database records separately from limited lists. |

---

## Technical Decisions and Trade-offs

1. **Automatic Token Refresh (JWT Interceptor)**
   - **Problem**: Token expiry forced logouts every 15 minutes.
   - **Decision**: We added a custom interceptor directly within the `api` helper. When a 401 response occurs, it halts the original request, fetches a new access token, updates the state, and retries the failed call seamlessly.
   - **Trade-off**: Slightly increases API client complexity, but provides an exceptional user experience by preventing arbitrary session dropouts.

2. **Accurate Dashboard Counting**
   - **Problem**: Stacking 6 parallel count queries was slow and inaccurate due to pagination limits.
   - **Decision**: We consolidated database queries. We now fetch all accessible project IDs first and then run a single, optimized Mongoose `$in` count query for all completed tasks, eliminating loop-based queries.

---

## Remaining Risks & Recommended Work

1. **Local Symlinks on Windows**: Standalone Next.js build fails locally on Windows due to symlink restrictions. This works fine on standard CI/Linux. Enabling Developer Mode or running builds containerized is recommended.
2. **Rate Limiting**: Add rate-limiting on authentication routes (`/auth/login`, `/auth/register`) to protect against brute-force attacks.
