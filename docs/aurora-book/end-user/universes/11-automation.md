# Automation Universe

## Purpose
Build workflows and rules without complexity.

## What It Is
- Visual workflow builder
- Integration with many apps and services
- Scheduled tasks
- Data transformation
- Error handling and logs

## Who Uses It
- Power users
- Teams automating workflows

## Companion Tone
Analyst (precise, transparent, logic-focused)

## Key Features
- No-code builder
- Expression language for advanced logic
- Webhooks
- Data mapping
- Error logs and debugging
- Rate limiting and throttling controls

## Core Surfaces
- Workflow canvas
- Trigger and action library
- Run history and logs
- Error handling dashboard

## Key Actions
- Build a workflow from triggers and actions
- Test and publish automations
- Monitor run history
- Pause or disable workflows

## Signals and Personalization
- Focus signal simplifies views to active workflows
- Reflection signal surfaces run insights

## Notifications
- Optional alerts for failed runs
- No alerts without opt-in

## Feature Table
| Area | What you can do | Where it lives |
| --- | --- | --- |
| Workflows | Build and publish automations | Workflow canvas |
| Triggers | Connect apps and events | Trigger library |
| Logs | Debug runs and errors | Run history |

## Detailed Feature Matrix
| Screen | Primary Actions | Notes |
| --- | --- | --- |
| Workflow canvas | Build and connect steps | Drag-and-drop flow |
| Trigger library | Choose events and sources | Explicit consent required |
| Run history | Inspect failures, retry | Transparent logs |

## How To
- Build a workflow: add a trigger and action.
- Test safely: run a dry test before publishing.
- Debug issues: open run history and review errors.

## Common Workflows
- If-this-then-that routines
- Scheduled syncs and reporting

## Step-by-step Guides

### Build a Simple Workflow
1. Open Automation and click New Workflow.
2. Add a trigger (e.g., time of day, event).
3. Add an action step.
4. Connect them together.

### Test a Workflow Before Publishing
1. Click Run Test on your draft workflow.
2. Review test results and logs.
3. Adjust if needed.
4. Click Publish when ready.

### Debug a Failed Workflow
1. Open Run History.
2. Find the failed run.
3. Click Inspect to view error details.
4. Retry manually or update workflow.

### Schedule Workflow Runs
1. Open a workflow.
2. Click Schedule or Trigger.
3. Set time (e.g., daily at 9am).
4. Choose days of week if recurring.
5. Activate scheduling.

### Monitor Workflow Performance
1. Open Metrics or Stats.
2. View run success rate.
3. Check average runtime.
4. See recent errors.
5. Optimize based on data.

### Share Workflow with Team
1. Click Share on a published workflow.
2. Invite team members.
3. Set permissions (view, copy, collaborate).
4. Team members can modify or reuse.
5. Changes sync across team.

## Visual Guide

**Workflow Canvas**
> Visual editor showing workflow as connected boxes (triggers, conditions, actions). Each box shows trigger/action name, configuration indicator, and connection lines between boxes. Key elements: Trigger block at top, action blocks below, condition logic blocks, connection lines showing flow, Test button, Save/Publish buttons.

**Test Run Results & Logs**
> Debug view showing simulated or actual workflow execution with detailed logs. Shows each step executed, data passed between steps, any errors encountered. Key elements: Step-by-step execution list, data values visible for each step, error messages highlighted in red, timestamp for each action.

**Run History with Error Details**
> Historical list of all workflow executions showing status, start time, duration, and error summary. Clicking an execution reveals full logs. Key elements: Execution list sorted by date (newest first), status badge (success/error/skipped), duration time, error summary, view logs button.

## Privacy Notes
Automation data is local by default. External integrations require explicit consent.

## Accessibility Notes
- Keyboard navigation on the workflow canvas
- Clear labels for triggers and actions
- Reduced motion for canvas transitions
