# Automation Universe - Quick Reference

**Shortcuts:**
- `⌘A` / `Ctrl+A` - Jump to Automation
- `⌘N` - New workflow
- `⌘T` - Trigger library
- `⌘H` - Run history & logs
- `⌘🧪` - Test mode

**Quick Workflows:**

| Workflow | Steps |
| --- | --- |
| Build workflow | New Workflow → Add trigger (event/time) → Add action step → Connect → Save |
| Test safely | Click Run Test → See results + logs → Check for errors → Adjust if needed |
| Debug failure | Run History → Find failed run → Click Inspect → View error details → Update workflow |
| Schedule runs | Open workflow → Click Schedule → Set time (e.g., daily 9am) → Choose days → Activate |
| Share with team | Workflow menu → Share → Add team members → Set permissions (view/copy/edit) |

**Pro Tips:**
- **Dry run first**: Always test before publishing to production
- **Error handling**: Most workflows have "if error" branch (ignore, notify, or retry automatically)
- **Conditional logic**: Use filters to run actions only if conditions met (e.g., "if budget exceeded")
- **Multi-step chains**: Nest multiple triggers and actions; one action output flows to next input
- **Transparent logs**: Every run logged; debugging usually means checking the specific failed step
- **Team templates**: Save successful workflows as team templates for reuse

**Common Commands:**
```
Trigger types           → Time-based, event-based (webhook), manual, conditional
Action types            → Send notification, create task, post to social, sync files
Conditional branches    → If/then logic, error handlers
Testing                 → Dry run, inspect logs, check data flow
Scheduling              → One-time, recurring (daily/weekly/monthly)
Team sharing            → View-only, copy, edit, admin roles
```

**Related Chapters:**
- [Advanced Usage](advanced-usage.md) - Automation patterns
- [Multi-Universe: Team Projects](multi-universe-workflows.md#scenario-4-launch-a-team-project)
