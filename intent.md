# Project Intent: RequestFlow

## Purpose
**RequestFlow** is an interactive, mobile-first learning laboratory built for the **CloudCrane Recruitment Challenge**. Its objective is to demonstrate how an AI assistant and an engineer collaborate to conceptualize, test, ship, and iterate on a production-grade phone application using CloudCrane's Model Context Protocol (MCP).

### Evaluation Criteria Addressed
- **AI-Assisted Delivery**: Engineered and deployed via CloudCrane MCP tools.
- **Mobile-First Utility**: Built specifically for phone screens (touch-friendly targets $\ge 44\text{px}$, responsive layout, standalone PWA installable to the home screen).
- **Iterative 3-Version Lifecycle**: Progressive releases proving sound engineering judgment, including automated testing and an intentional rollback of a regressive UI experiment.
- **Backward-Compatible Data Migration**: Schema upgrades (v1 $\to$ v2) that preserve existing local storage without data loss or count resets.
- **Engineering Rigor**: Full unit and integration test coverage (`node --test`), pre-flight validation gates (`check_publish`), and zero external runtime dependencies.

---

## How It Works
When a user opens RequestFlow on their phone, the app presents an interactive, vertical pipeline that models modern backend infrastructure:

1. **Triggering Requests**: The user selects a scenario (e.g., *201 Created Order*, *401 Unauthorized*, or *504 DB Timeout*) and taps **Send Request** or **Step ➔** in the thumb-accessible bottom dock.
2. **Visual Packet Traversal**: An animated packet travels node-by-node along a glowing track through five architecture stages:
   - **Client / Browser**: Initiates the request with headers and auth tokens.
   - **DNS & TLS 1.3**: Demonstrates domain resolution and secure handshakes.
   - **Gateway / Load Balancer**: Models reverse proxying and SSL termination.
   - **Backend Controller**: Executes middleware, JWT verification, and routing.
   - **Database**: Runs ACID transactions or handles pool exhaustion.
3. **Deep Node Inspection**: Tapping any pipeline node slides up a bottom drawer with two views:
   - **Overview**: Clear, accessible explanations of what occurred at that layer.
   - **Wire Protocol**: Exact raw HTTP headers, JSON payloads, and SQL queries.
4. **Failure Visualization**: On error scenarios, execution halts precisely at the failing node (e.g., AuthMiddleware halts at Stage 4 with `401`), showing status codes and debugging hints.
5. **Progress Persistence**: Learning progress, inspection history, and total request metrics persist across app restarts using local storage.
