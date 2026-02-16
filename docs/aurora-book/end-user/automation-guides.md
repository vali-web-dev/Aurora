# Advanced Automation Guides

Technical reference for power users who want to build custom automations, set up complex workflows, and orchestrate data across Aurora's 16 universes. This guide assumes familiarity with basic workflow creation.

---

## Part 1: Workflow Anatomy & Building Blocks

### Workflow Structure

Every Aurora workflow follows this pattern:

```
TRIGGER → CONDITION(S) → ACTION(S) → NOTIFICATION/LOGGING
  ↓         ↓                ↓            ↓
Event →  Should I  →  Do the →  Confirm
occurs   continue?    work      & record
```

### Available Triggers

**Time-Based**
- Every X minutes/hours/days (1, 5, 15, 30, 60, 240 minutes or 1-24 hours or daily)
- At specific time (9:00 AM daily, Monday 2 PM weekly, 1st of month, etc.)
- Cron expression (advanced): `0 9 * * MON-FRI` = 9 AM weekdays

**Event-Based**
- Task created/completed in Productivity
- Post published in Social
- New message in Communities
- Health signal logged (mood, sleep, exercise, etc.)
- Finance transaction added
- File created/modified in Create
- Device status changed in Home Control
- Learning course progressed
- Calendar event added/updated
- Travel itinerary changed

**Manual Triggers**
- Button in Automation dashboard (click to run)
- Global keyboard shortcut (⌘Shift+A / Ctrl+Shift+A)
- Voice command via Companion Panel
- QR code link (shareable trigger)

**External Triggers** (with API integration)
- Webhook endpoint (for 3rd party services)
- Email to specific address (auto-parsed)
- Push notification response (from outside Aurora)
- Slack/Teams message mention
- Zapier/IFTTT integration

### Conditions & Logic

**Comparison Operators**
```
equals, not_equals, contains, not_contains,
greater_than, less_than, starts_with, ends_with,
is_empty, is_not_empty, matches_pattern, in_list
```

**Logical Gates**
```
IF condition THEN action
IF condition1 AND condition2 THEN action
IF condition1 OR condition2 THEN action
IF (condition1 AND condition2) OR condition3 THEN action
```

**Variable References** (pass data through workflow)
```
${trigger.taskName} → use task name from trigger event
${step1.result} → use output from first action
${previous_run.success} → check if last run succeeded
${companion.scope} → current scope from Companion Panel
${user.timezone} → user's timezone setting
```

### Core Actions

**Data Manipulation**
- Create task/project in Productivity
- Post to Social, Communities, Collections
- Create/update Create document
- Log entry in Health, Finance, Travel
- Send message via notification system
- Search across all universes

**Conditional Logic**
- If/Then/Else branches
- Wait X seconds/minutes (pause workflow)
- Repeat N times (loop)
- Break on condition (exit loop early)
- Fork (create two parallel branches)
- Merge (combine results from parallel branches)

**Integration Actions**
- Send email (to external email address)
- Send Slack/Teams message
- Create calendar event (Google Cal, Outlook)
- Log to external API via webhook
- Fetch data from external API
- Transform data (JSON, CSV, XML parsing)

**Companion Panel Actions**
- Set Companion tone (Focused, Creative, Social, etc.)
- Set scope focus (show specific universe)
- Trigger signal (send to Companion Panel)
- Play sound/haptic feedback
- Show notification overlay

---

## Part 2: Practical Workflow Patterns

### Pattern 1: Task Auto-Escalation

**Goal**: If a task isn't completed by end of day, escalate it (notify, raise priority).

```yaml
Trigger: Daily at 5:00 PM
Conditions:
  - Task status = "Not Done"
  - Task due date = "Today"
  - Task priority < "High"
Actions:
  1. Update task priority to "High" (red color)
  2. Send Productivity notification: "Task overdue: [task name]"
  3. Add comment: "Auto-escalated at 5 PM"
  4. Optional: Ping team member via Social @mention
Logging: Log time, task name, old/new priority
```

### Pattern 2: Cross-Universe Data Funnel

**Goal**: Single input (event) flows to multiple universes for processing.

```yaml
Trigger: New Finance expense logged
  └─ Extract: amount, category, date, notes
   
Actions (parallel):
  1. Productivity
     └─ Create task: "Review [category] spending"
     └─ Assign to Finance team member
     
  2. Health
     └─ Log signal: "Experienced stress spending" (if amount > threshhold)
     └─ Mood check-in: "How are you feeling?"
     
  3. Analytics
     └─ Create record in Collections
     └─ Update budget tracker document
     
  4. Notification
     └─ Post to Communities: "Spent [amount] on [category]"
     └─ (Only if marked public in Finance settings)

Completion: Summarize findings in Home universe card
```

### Pattern 3: Recurring Report Generation

**Goal**: Compile metrics from multiple universes weekly, format nicely, deliver to user.

```yaml
Trigger: Every Friday at 5:00 PM

Data Collection (parallel queries):
  1. Productivity: Tasks completed (count, time logged)
  2. Health: Average mood, sleep hours, exercise time
  3. Finance: Spending by category, budget adherence
  4. Learning: Courses completed, hours logged
  5. Social: Posts published, engagement rate
  6. Travel: Distance traveled, new places visited

Report Generation:
  1. Create Create document: "Week of [date] - Summary"
  2. Write sections for each universe with markdown formatting
  3. Embed charts/graphs (ASCII or reference to charts in source universes)
  4. Add trend analysis: "Compared to previous week..."
  5. List top achievements
  
Delivery:
  1. Publish to Collections Blog: "Weekly Recap"
  2. Send email summary (PDF version)
  3. Post to Communities: "Weekly check-in" thread
  4. Add card to Home: "Read your weekly recap"

Archive: Store report path in Finance for record-keeping
```

### Pattern 4: Conditional Workflow Chains

**Goal**: Outcome of one workflow triggers the next (automation orchestration).

```yaml
Workflow A - Morning Preparation:
  Trigger: Alarm goes off OR 7:00 AM
  Actions:
    1. Get weather from Travel API
    2. Check Productivity tasks for today
    3. Check Health mood & sleep quality
    4. Check Social notifications
    ├─ Store results in global context object
    └─ Return "morning_status" object

Workflow B - Companion Setup (triggered by A completion):
  Trigger: Workflow A completes successfully
  Conditions:
    - IF Health mood = "Low"
        → Set Companion tone to "Supportive"
    - ELSE IF Productivity has > 10 tasks
        → Set Companion tone to "Focused"
    - ELSE
        → Set Companion tone to "Friendly"
  Actions:
    1. Set Companion tone based on condition
    2. Set scope to most relevant universe
    3. Queue suggested next action
    4. Log recommendation in Home

Workflow C - Schedule Optimizer (triggered by B completion):
  Trigger: Workflow B completes
  Actions:
    1. Analyze predicted productivity from Health data
    2. Consider Travel commute time
    3. Consider Learning course schedule
    4. Suggest ideal time to focus on top 3 tasks
    5. Queue as Productivity suggestion
```

---

## Part 3: Advanced Data Manipulation

### Working with Variables & Context

**Setting Variables**
```yaml
Set context variable "trip_budget":
  $trip_budget = Finance.getTravelBudget(trip_id: "summer_europe")
  # Returns: 5000 (amount in cents, USD)

Set derived variable:
  $daily_budget = $trip_budget / 14  # 14-day trip
  # Result: 357143 (cents/day, ~$357)

Set conditional variable:
  $is_overbudget = IF $spent > $trip_budget THEN true ELSE false
  $urgency = CASE
    WHEN $spent > ($trip_budget * 1.1) THEN "CRITICAL"
    WHEN $spent > $trip_budget THEN "HIGH"
    WHEN $spent > ($trip_budget * 0.9) THEN "MEDIUM"
    ELSE "LOW"
```

**Data Type Conversions**
```yaml
Convert string to number:
  $task_minutes = parseInt(${step1.estimate})

Convert timestamp to date:
  $task_date = formatDate(${trigger.created_at}, "YYYY-MM-DD")

Convert object to string:
  $task_summary = JSON.stringify(${current_task})

Parse complex data:
  $emails = ${action1.response}.split(',').map(e => e.trim())
  # Split comma-separated emails and trim whitespace
```

**Array Operations**
```yaml
Filter array:
  $completed_tasks = Productivity.tasks.filter(t => t.status === "done")

Map array:
  $task_names = $completed_tasks.map(t => t.name).join(", ")
  # Result: "Task1, Task2, Task3"

Aggregate array:
  $total_time_spent = $completed_tasks.reduce((sum, t) => sum + t.hours, 0)
  $average_time = $total_time_spent / $completed_tasks.length
```

### Error Handling & Fallbacks

**Try/Catch Pattern**
```yaml
Try:
  1. Fetch data from Finance API
  2. Parse JSON response
  3. Calculate budget total
  
Catch error:
  - If network error: Use cached data from last run
  - If invalid JSON: Log error to Automation logs, continue
  - If math error: Set total to 0, notify user

Finally:
  - Always cleanup temp variables
  - Always log completion status
```

**Timeout & Retry Logic**
```yaml
Action: Query Finance for Q2 spending data
  Timeout: 5 seconds
  If timeout OR error:
    └─ Retry: Wait 2 seconds, try again (max 3 attempts)
    
  If all retries fail:
    └─ Action: Use hardcoded fallback value
    └─ Action: Send alert to user
    └─ Action: Schedule manual retry at next 6 AM
```

---

## Part 4: Cross-Universe Integration Examples

### Travel + Finance + Social Workflow

**Description**: When you post a travel photo on Social, automatically calculate trip costs and log to Finance, then update travel journal in Create.

```yaml
Trigger: New post created in Social with #travel hashtag

Extract data:
  $location_tags = extract hashtags starting with #
  $photo_urls = extract image URLs
  $timestamp = ${trigger.created_at}

Step 1 - Update Travel:
  1. Search Travel universe for trip containing $location_tags
  2. If trip found:
     └─ Add photo to trip journal
     └─ Extract location coordinates from photo metadata
     └─ Update Travel map pin with new photo
  
Step 2 - Finance Integration:
  1. Ask: "Did you spend money on this? (Y/N, optional)"
  2. If yes:
     ├─ Prompt for amount
     ├─ Prompt for category (Food/Transport/Activity/Lodging)
     └─ Create Finance transaction:
        - Amount: ${user_input.amount}
        - Category: ${user_input.category}
        - Description: "Travel experience: [Social post excerpt]"
        - Date: ${timestamp}
  3. Auto-calculate: Running trip total spent vs Budget
  
Step 3 - Create Integration:
  1. Update Travel journal document:
     ├─ Add date section if new day
     ├─ Add photo with caption
     ├─ Add metadata (location, budget impact)
     └─ Auto-link to related Finance transaction
  
Step 4 - Notification:
  1. Post to Communities in travel group:
     └─ "Shared travel photo from [location]"
  2. Update Home card: "Trip expenses: $X of $Y budget used"
```

### Learning + Create + Productivity Workflow

**Description**: As you complete Learning course, automatically create a project in Create with learnings, and add tasks to apply the knowledge.

```yaml
Trigger: Course lesson completed in Learning

Extract:
  $course_name = ${trigger.course_name}
  $lesson_title = ${trigger.lesson_title}
  $completion_video_url = ${trigger.video_url}
  $key_concepts = Learning.extractKeywords(${lesson_content})

Step 1 - Create Application Project:
  1. Fetch Create template: "Learning Application"
  2. Create new document:
     ├─ Title: "Applying [course_name] - [lesson_title]"
     ├─ Template includes: Key Concepts, Application Ideas, Practice Exercises
     └─ Pre-populate concepts section with $key_concepts
  3. Share with Learning study group (optional)

Step 2 - Add Tasks:
  1. Generate 3 application tasks in Productivity:
     ├─ Task 1: "Complete practice exercise from lesson"
     ├─ Task 2: "Teach concept to someone else"
     ├─ Task 3: "Apply to real project at work"
  2. Each task links to:
     ├─ Lesson URL
     ├─ Create project for notes
     └─ Time estimate (15-30 min per task)

Step 3 - Schedule:
  1. Add tasks to calendar:
     ├─ Practice: Tomorrow, 30 min session
     ├─ Teaching: This week (when ready)
     ├─ Application: Ongoing (when project aligns)
  2. Create reminder notifications

Step 4 - Track Progress:
  1. Create Health "learning" signal trigger
  2. When task completed:
     └─ Update Health: "Completed [lesson] application"
     └─ Log: Confidence level (1-10)
     └─ Store in Learning for progress tracking
```

### Team Productivity + Social + Health Workflow

**Description**: For team sprint, automatically compile daily standup from team posts, generate blockers report, and track team wellness signals.

```yaml
Trigger: Daily at 9:00 AM (team standup time)

Step 1 - Collect Standups:
  1. Query Social recent posts from team members tagged #standup AND #today
  2. Extract: What worked, blockers, next actions
  3. Compile in Productivity standup task description
  
Step 2 - Generate Report:
  1. Parse blocker mentions (anything with #blocked)
  2. If blockers > 2: Create urgent Productivity task "Address team blockers"
  3. Create Communities thread: "Daily standup summary"
     └─ Post compiled updates

Step 3 - Health Check:
  1. For each team member:
     ├─ Check if they logged a Health signal recently
     ├─ If no signal in 24 hrs: Flag as potential issue
     └─ Add to "Wellness check" Productivity task
  2. If team mood trending down:
     └─ Alert team lead (Productivity notification)

Step 4 - Team Planning:
  1. In Automation dashboard, show:
     ├─ Standups collected: X of Y team members
     ├─ Blockers identified: [list]
     ├─ Wellness status: [color coded by team member]
     └─ Recommended action: "Schedule blocker-clearing meeting"
```

---

## Part 5: Performance & Optimization

### Workflow Performance Tips

**1. Minimize API Calls**
```yaml
❌ SLOW: Loop pattern
  FOR EACH of 100 tasks:
    - GET task details from server
    - Result: 100 API calls

✅ FAST: Batch pattern
  - GET all tasks in single batch query
  - Result: 1 API call
```

**2. Use Caching**
```yaml
First run (cache miss):
  1. Fetch user's timezone list (10 items)
  2. Store in persistent cache
  3. Time: 100ms

Subsequent runs (cache hit):
  1. Load from cache (in-memory or local)
  2. Time: 1ms

Invalidate cache:
  - When user updates timezone preferences
  - Every 24 hours (auto-refresh)
  - On manual refresh button click
```

**3. Avoid Redundant Conditions**
```yaml
❌ SLOW: Redundant checks
  IF universe == "Finance" THEN ...
  IF universe == "Finance" THEN ...
  IF universe == "Finance" THEN ...

✅ FAST: Combine checks
  IF universe == "Finance" THEN
    └─ Do all Finance-related checks in one block
```

**4. Use Parallel Execution**
```yaml
❌ SLOW: Sequential (10 seconds total)
  Step 1: Fetch Finance data (5 sec)
  Step 2: Fetch Health data (5 sec)
  Total: 10 seconds

✅ FAST: Parallel (5 seconds total)
  Step 1a: Fetch Finance data (5 sec) ┐
  Step 1b: Fetch Health data (5 sec)  ├─ Run simultaneously
  Step 2: Wait for both (merge results) ┘
  Total: 5 seconds
```

### Throttling & Rate Limiting

**External API Limits**
```yaml
Workflow makes requests to external API with rate limit: 100 requests/minute

Configuration:
  Max concurrent requests: 10
  Delay between requests: 600ms (60 sec / 100 = 0.6 sec per request)
  Queue excess requests: FIFO queue (First In, First Out)
  
If limit reached:
  └─ Pause workflow, retry after rate limit window (1 minute)
  └─ Alert user: "API rate limit reached, retrying..."
```

---

## Part 6: Debugging & Monitoring

### Logging Strategies

**Levels**
```yaml
DEBUG: Detailed variable values, all steps
  └─ Used during development/testing

INFO: Workflow progress, key milestones
  └─ "Fetched 50 tasks", "Processing batch 2 of 5"
  └─ Keep enabled in production

WARN: Unusual but non-blocking issues
  └─ "Task duration estimate not set"
  └─ "Using cached data (network timeout)"

ERROR: Failures, but workflow continues
  └─ "Failed to fetch 3rd-party data, using fallback"

FATAL: Workflow stops
  └─ "Invalid workflow configuration"
  └─ "Database connection failed"
```

**Structured Logging**
```yaml
Log entry template:
  Timestamp: 2026-02-16T09:15:42Z
  Workflow: "Daily Report Generation"
  Run ID: abc123def456
  Step: 2/5 "Fetch Finance Data"
  Level: INFO
  Message: "Fetched 156 transactions for Feb 2026"
  Data:
    transaction_count: 156
    time_ms: 245
    cache_hit: false
```

### Test & Debug Mode

**Test Run in Sandbox**
```yaml
1. Don't modify actual data (read-only mode)
2. Run with test trigger data (fake events)
3. Show all variable values at each step
4. Allow step-by-step execution (pause/resume)
5. Show predictions: "If running now, would complete in X seconds"

Example:
  Trigger: Simulate "Task completed: Buy groceries"
  Step 1: ✅ Parse trigger (value: { taskId: "test-123" })
  Step 2: ✅ Update Productivity mock database
          Output: { success: true, task: { ... } }
  Step 3: ✅ Notify user (preview: "🎉 Task done: Buy groceries")
```

### Monitoring Dashboard

**What to Track**
```yaml
Per Workflow:
  ├─ Last run time
  ├─ Last run status (success/error)
  ├─ Run frequency (daily, hourly, on-demand, etc.)
  ├─ Average execution time
  ├─ Error rate (% of runs that fail)
  ├─ Data processed (records, API calls)
  └─ Notifications triggered

System-Wide:
  ├─ Total active workflows: 47
  ├─ Daily workflow executions: 1,230
  ├─ Success rate: 98.7%
  ├─ Avg execution time: 2.3 seconds
  ├─ Most-run workflow: "Morning Briefing" (47 runs/day)
  └─ Most-failed workflow: "Sync to External API" (8 failures/24hrs)
```

---

## Part 7: Security & Permissions

### Data Access Control in Workflows

**Principle: Workflows inherit user's permissions**

```yaml
User (John) can access:
  - Own Productivity tasks
  - Shared Productivity tasks (from managers)
  - Public Social posts
  - Private Health data (own only)

Workflow (John's "Daily Report"):
  └─ Can only access what John can access
  └─ Cannot access: Team members' private health data
  └─ Cannot query: Finance data from other users

Best practice:
  └─ Always add permission checks before accessing data
  └─ Log failed access attempts
```

### Safe External Integrations

**Authentication**
```yaml
Store API keys:
  ✅ In secure Aurora vault (encrypted at rest)
  ❌ In workflow definition (plaintext)
  ❌ In logs (visible to debugging)

Usage:
  1. Store key: Settings → Integrations → Add API key
  2. Reference in workflow: ${vault.key:slack_api}
  3. Aurora retrieves and injects securely into request
```

**Webhook Validation**
```yaml
When receiving webhook from external service:
  1. Verify signature in request headers using shared secret
  2. Check timestamp (reject if > 5 minutes old)
  3. Validate request came from expected origin (IP whitelist optional)
  4. Log all webhook attempts (success and failures)
```

---

## Reference: Common Workflow Templates

### Template 1: Daily Briefing

**Files**: Combines all universes into one morning summary.

```yaml
Trigger: 7:00 AM daily
Actions:
  1. Get previous day summary from Productivity
  2. Get sleep/mood data from Health
  3. Get yesterday's spending from Finance
  4. Get news from communities
  5. Compile into Create document
  6. Send to email as PDF
  7. Display as Home widget
```

### Template 2: Weekly Check-In

```yaml
Trigger: Friday 5:00 PM
Actions:
  1. Create Create document: "Week summary"
  2. Compile seven days of data
  3. Calculate trends
  4. Generate charts
  5. Invite team feedback (Communities post)
```

### Template 3: Budget Alert

```yaml
Trigger: Whenever Finance transaction added
Condition: If amount > $50 AND category == "Discretionary"
Action:
  1. Check current month spending vs budget
  2. If over budget: Send urgent alert
  3. Suggest cutback in same category
```

### Template 4: Team Sync

```yaml
Trigger: Daily 9:00 AM
Actions:
  1. Collect team posts from Social
  2. Extract blockers
  3. Summarize in Communities
  4. Create Productivity tasks for blockers
```

---

## Getting Help

- Check workflow logs for error details (Automation → Run History)
- Enable DEBUG logging during development
- Test run before enabling automation
- Use Community templates as starting points
- Share workflow snapshots in Communities for feedback
- Contact support with workflow definition and logs

**Common Issues & Solutions** are documented in [Support](support.md). For technical questions, post in [Communities → Automation Help](https://communities.aurora.local/automation).
