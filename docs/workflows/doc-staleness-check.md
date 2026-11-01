# Workflow documentation: doc-staleness-check
**Workflow file:** [.github/workflows/doc-staleness-check.yml](../../.github/workflows/doc-staleness-check.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `doc-staleness-check` workflow automates the maintenance of workflow documentation by comparing the commit timestamps of workflow files against their corresponding documentation. When a workflow file is modified, the workflow uses the Gemini API to rewrite or update the relevant documentation file and opens or refreshes a pull request.

## Tutorials

### Getting Started with Documentation Staleness Checks

This tutorial walks a first-time user through running and validating the documentation staleness check workflow manually.

1. **Navigate to Actions**: Open your repository on GitHub and click on the **Actions** tab.
2. **Select the Workflow**: From the left sidebar, click on **doc-staleness-check**.
3. **Trigger Manually**: Click the **Run workflow** dropdown button.
4. **Target a Workflow (Optional)**: In the `workflow_name` input field, type the name of a specific workflow file without the `.yml` extension (e.g., `doc-staleness-check`), or leave it empty to check all workflows.
5. **Run**: Click the green **Run workflow** button.
6. **Verify Results**: Once the action completes, check the **Pull Requests** tab for any automatically generated documentation update PRs.

## How-to guides

### Running the Workflow Manually for a Single File
1. Go to the **Actions** tab in your GitHub repository.
2. Choose **doc-staleness-check** from the workflows list.
3. Click **Run workflow**.
4. Enter the target workflow name (e.g., `ci`) in the `workflow_name` input box.
5. Click **Run workflow** to execute the check against only that specific file.

### Reviewing and Merging Automated Documentation PRs
1. Navigate to your repository's **Pull Requests** tab.
2. Locate the pull request titled `📝 Doc update: <workflow-name>` or `📝 New doc: <workflow-name>`.
3. Review the file changes in the `docs/workflows/` directory to ensure the generated documentation matches the updated workflow logic.
4. If an open PR already exists and the workflow updates further, check the PR comments for automated updates and refreshed commit logs.
5. Click **Merge pull request** to integrate the updated documentation into the main branch.

## Reference

### Triggers

| Trigger Type | Schedule Expression / Details |
|---|---|
| Manual Trigger (`workflow_dispatch`) | Optional input `workflow_name`: Check a specific workflow file name without `.yml` (leave empty to check all). |
| Scheduled Trigger (`schedule`) | Cron: `'55 2 1 * *'` (Runs on the 1st of every month at 02:55 UTC). |

### Secrets

| Secret Name | Purpose |
|---|---|
| `GITHUB_TOKEN` | Provides repository write permissions to check out code, manage branches, and open or comment on pull requests. |
| `GEMINI_API_KEY` | Authenticates requests sent to the Gemini API for generating and rewriting documentation content. |

### Tickers/Instruments Table

| No. | Ticker | Description |
|---|---|---|
| N/A | N/A | This workflow does not process financial instruments or market tickers. |

### Output Fields

| Field | Description |
|---|---|
| `Workflow Last Changed` | Timestamp of the most recent commit modifying the workflow YAML file. |
| `Doc Last Changed` | Timestamp of the most recent commit modifying the target documentation file. |
| `Is Stale` | Boolean value evaluating whether the workflow file has changes newer than the documentation file. |
| `PR Title` | Title assigned to the generated documentation pull request (`📝 Doc update: <name>` or `📝 New doc: <name>`). |

### API/Data Sources

- **GitHub REST / CLI API**: Interrogates commit history, lists open pull requests, creates branches, commits files, and opens/updates pull requests.
- **Gemini API (`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`)**: OpenAI-compatible endpoint used to evaluate diffs and generate up-to-date documentation using the `gemini-3.5-flash-lite` model.

## Explanation

The `doc-staleness-check` workflow solves the common problem of documentation drifting out of sync with rapidly changing CI/CD configurations. By automating the comparison between workflow commit dates and documentation commit dates, it shifts the burden of documentation upkeep from manual reminders to continuous automation.

The design relies on PowerShell scripts executing within an `ubuntu-latest` runner to parse Git history and isolate commits made since the documentation was last touched. It integrates the `diataxis-doc-writer` agent instructions and the `mermaid-diagrams` skill directly from the repository's agent and skill paths, feeding them into the Gemini model alongside the workflow YAML and current documentation context. This ensures that the generated documentation consistently adheres to rigorous Diátaxis structure and includes clear visual diagrams.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Doc Staleness Check Workflow Flow
    accDescr: Visualizes the trigger sources leading to staleness evaluation, Gemini generation, and automated pull request management.

    subgraph Triggers
        A1[Manual: workflow_dispatch] --> B
        A2[Scheduled: cron 55 2 1 * *] --> B
    end

    subgraph Evaluation & Processing
        B[Checkout Repository] --> C[Scan Workflow Files]
        C --> D{Is Workflow Stale?}
        D -- No --> E[Skip / Exit]
        D -- Yes --> F[Fetch Recent Commits & Current Docs]
        F --> G[Call Gemini API for Documentation Content]
    end

    subgraph PR Management
        G --> H{Existing PR Found?}
        H -- Yes --> I[Refresh Existing Branch & Add PR Comment]
        H -- No --> J[Create New Branch & Open Pull Request]
    end