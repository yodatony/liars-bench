# Workflow documentation: doc-staleness-check
**Workflow file:** [.github/workflows/doc-staleness-check.yml](../../.github/workflows/doc-staleness-check.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers

| Trigger Type | Schedule Expression |
|---|---|
| Manual | `workflow_dispatch` |
| Schedule | `55 2 1 * *` (1st of every month at 02:55 UTC) |

### Secrets

| Secret Name | Purpose |
|---|---|
| `GITHUB_TOKEN` | Provides authentication for Git operations, checking out the repository, and managing pull requests via GitHub CLI (`gh`). |
| `GEMINI_API_KEY` | Provides authentication for calling the Gemini API to check/rewrite documentation content. |

### Tickers/Instruments Table

| No. | Ticker | Description |
|---|---|---|
| N/A | N/A | This workflow does not process financial tickers or market instruments. |

### Output Fields

| Field | Description |
|---|---|
| `BranchName` | The Git branch created or refreshed for the documentation update PR (`doc-update/<WorkflowName>-<Timestamp>`). |
| `IsStale` | Boolean value indicating whether the workflow file has newer commits than the corresponding documentation file. |
| `ExistingPR` | Metadata object representing an already open pull request for the workflow documentation, if any. |

### API/Data Sources

| Source | Purpose |
|---|---|
| GitHub CLI / API (`gh pr`) | List open PRs, create new pull requests, add comments to existing pull requests, and apply labels. |
| Git History (`git log`) | Compare commit timestamps between workflow files and documentation files, and list commits made since the last doc update. |
| Google Generative Language API | OpenAI-compatible chat completions endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`) using model `gemini-3.5-flash-lite` to generate or update documentation. |

## How-to guides

### Creating or Updating Documentation

1. **Trigger the Workflow**:
   - Wait for the automated schedule to trigger on the 1st of every month at 02:55 UTC, or manually trigger the workflow via the **Actions** tab in GitHub using `workflow_dispatch`.

2. **Automated Staleness Verification**:
   - The workflow checks out the repository and inspects all workflow YAML files in `.github/workflows/`.
   - It compares the last commit date of each workflow file against its corresponding documentation file in `docs/workflows/`.

3. **AI Generation and PR Management**:
   - If a workflow file is newer than its documentation (or the documentation doesn't exist), the workflow queries the Gemini API to generate updated documentation matching the Diataxis framework.
   - If an open pull request already exists for that workflow's documentation, the workflow refreshes the existing branch, pushes new commits, and adds a progress comment to the open PR.
   - Otherwise, it creates a new branch, commits the updated documentation, and opens a new pull request labeled `documentation`.

### Reviewing the PR

1. Navigate to the **Pull Requests** tab in your repository.
2. Locate the pull request titled either `📝 New doc: <WorkflowName>` or `📝 Doc update: <WorkflowName>`.
3. Review the changes made to the markdown file under `docs/workflows/` to ensure accuracy against recent workflow adjustments and commits.
4. Merge the pull request or request changes as needed.

## Explanation

The `doc-staleness-check` workflow automates the maintenance of repository documentation by ensuring that markdown files in `docs/workflows/` do not drift out of sync with their corresponding GitHub Actions workflow definitions. 

Key design decisions include:
- **Diataxis Framework Compliance**: Enforces a strict four-section structure (Reference, How-to guides, Explanation) to maintain consistency across all workflow documentation.
- **Robust PR Management**: Instead of blindly spamming new pull requests when workflow updates happen frequently, the script detects existing open PRs (`doc-update/<WorkflowName>-*`) and refreshes them, preventing PR fatigue for maintainers.
- **Resilient API Handling**: Incorporates retry logic with fixed delays for transient Google Generative Language API 500/503 errors, and gracefully skips processing if rate limits (429 quota exhaustion) are hit.
- **PowerShell Implementation**: Utilizes PowerShell (`pwsh`) scripts to handle git operations, REST API payloads, and string manipulations uniformly across operating systems.