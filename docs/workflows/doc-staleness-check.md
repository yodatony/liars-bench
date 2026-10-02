# Workflow documentation: doc-staleness-check
**Workflow file:** [.github/workflows/doc-staleness-check.yml](../../.github/workflows/doc-staleness-check.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger Type | Schedule Expression / Event | Description |
|---|---|---|
| Manual Trigger | `workflow_dispatch` | Allows manual triggering via GitHub Actions UI or API. |
| Scheduled Trigger | `55 2 1 * *` | Runs automatically on the 1st of every month at 02:55 UTC. |

### Secrets

| Secret Name | Purpose |
|---|---|
| `GITHUB_TOKEN` | Provides access to repository content, commit history, and GitHub CLI operations for creating branches and pull requests. |
| `GEMINI_API_KEY` | Authenticates requests to Google's Gemini API (`gemini-3.8-flash`) for rewriting or generating documentation. |

### Tickers/Instruments Table

| Ticker | Instrument Type | Description |
|---|---|---|
| N/A | N/A | This workflow does not process or monitor financial tickers or market instruments. |

### Output Fields

| Field | Description |
|---|---|
| `BranchName` | Name of the generated branch (`doc-update/<WorkflowName>-<YYYYMMDD>`). |
| `PR Title` | Title of the pull request created (`📝 Doc update: <WorkflowName>` or `📝 New doc: <WorkflowName>`). |
| `PR Body` | Body text including comparison dates, instructions, and recent workflow commit logs. |
| `WorkflowDate` | Timestamp of the last Git commit modifying the workflow file. |
| `DocDate` | Timestamp of the last Git commit modifying the corresponding documentation file. |
| `IsStale` | Boolean indicating whether the documentation is missing or older than the workflow file. |

### API/Data Sources

| API / Data Source | Purpose |
|---|---|
| GitHub CLI (`gh`) / Git | Inspects open pull requests, checks commit logs, creates branches, commits documentation changes, and opens pull requests. |
| Google Gemini API | OpenAI-compatible completions endpoint (`gemini-3.8-flash`) used to analyze workflow changes and generate or update Diataxis-formatted documentation. |

## How-to guides

### Creating or Updating Documentation

1. **Trigger the Workflow**:
   - Manually trigger the workflow using the GitHub Actions interface or wait for the scheduled monthly run.

2. **Check for Staleness**:
   - The workflow iterates over all `.github/workflows/*.yml` files and checks the last commit date against their corresponding documentation files in `docs/workflows/`.

3. **Generate Documentation via Gemini**:
   - If the workflow file has a newer commit than the documentation file (or documentation does not exist) and no open PR exists for it, the workflow sends the workflow file, existing doc, and recent commit history to the Gemini API (`gemini-3.8-flash`).
   - If Gemini returns a transient error (such as 429, 500, or 503), the workflow retries up to 5 times with exponential backoff.

4. **Review and Merge the Pull Request**:
   - The workflow commits the generated documentation to a branch named `doc-update/<WorkflowName>-<YYYYMMDD>` and opens a pull request labeled `documentation`.
   - Maintainers can review the generated pull request against the workflow changes and merge or request edits.

### Reviewing the PR

1. Open the pull request created by the workflow.
2. Review the changes against the workflow file.
3. Ensure that the documentation accurately reflects the current workflow.
4. Merge the PR if everything looks correct.

## Explanation

The `doc-staleness-check` workflow is designed to ensure that workflow documentation in `docs/workflows/` remains up-to-date with corresponding workflow files in `.github/workflows/`. 

By comparing Git commit timestamps between each workflow and its corresponding markdown document, the workflow identifies stale or missing documentation. To avoid duplicate pull requests, it checks whether an open PR already exists for the given workflow before proceeding.

When a workflow requires documentation updates, it sends the workflow content, previous documentation, and recent commit logs to Google's Gemini API (`gemini-3.8-flash`) using an OpenAI-compatible endpoint. The prompt instructs the model to follow the Diataxis framework (Reference, How-to guides, and Explanation) and preserve existing contextual information while bringing reference tables and descriptions into alignment with the workflow definition. Exponential backoff retry logic is implemented to handle intermittent rate limits or high-demand service responses (503/429).