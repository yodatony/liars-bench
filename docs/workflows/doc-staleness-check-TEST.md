# Workflow documentation: doc-staleness-check-test
**Workflow file:** [.github/workflows/doc-staleness-check-TEST.yml](../../.github/workflows/doc-staleness-check-TEST.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `doc-staleness-check-test` workflow automates documentation maintenance by detecting when workflow files have changed since their corresponding markdown documentation was last updated. When stale or missing documentation is identified, the workflow utilizes the Gemini API to generate or rewrite accurate documentation, and subsequently opens or updates a pull request with the changes.

## Tutorials

### Getting Started with the Doc Staleness Workflow
This tutorial walks you through setting up and running the documentation staleness check manually for the first time.

1. **Verify Repository Secrets**: Ensure that `GEMINI_API_KEY` is configured in your repository settings under **Settings > Secrets and variables > Actions**, as it is required for calling the Gemini API.
2. **Navigate to Actions**: In your GitHub repository, click on the **Actions** tab.
3. **Select the Workflow**: From the left sidebar, click on **doc-staleness-check-test**.
4. **Trigger Manually**: Click the **Run workflow** dropdown button. 
5. **Specify Workflow Input (Optional)**: In the `workflow_name` input field, type the file name of a specific workflow without the `.yml` extension (e.g., `doc-staleness-check-TEST`) if you want to test a single file, or leave it blank to evaluate all workflow files.
6. **Run the Workflow**: Click the green **Run workflow** button to execute the job.
7. **Verify the Results**: Once the workflow finishes, check your **Pull Requests** tab. A new pull request containing the generated or updated documentation will be open for your review.

## How-to Guides

### How to Target a Single Workflow for Staleness Checking
If you want to bypass checking the entire repository and focus exclusively on one workflow file:

1. Navigate to the **Actions** tab in GitHub.
2. Select **doc-staleness-check-test**.
3. Click **Run workflow**.
4. In the `workflow_name` input prompt, enter the exact target workflow base name (for example, enter `ci` for `.github/workflows/ci.yml`).
5. Click **Run workflow** to execute the targeted check.

### How to Force Documentation Regeneration on an Existing PR
If an automated documentation pull request is already open and you want to force a refresh due to new changes:

1. Push your recent changes to the target workflow file.
2. Trigger the `doc-staleness-check-test` workflow manually via the **Actions** tab, leaving the input field blank to evaluate all files.
3. The workflow will detect the open pull request, compare the latest workflow commit date against the PR branch date, and automatically refresh the branch with newly generated documentation and append a status comment.

## Reference

### Triggers
| Trigger Type | Description | Configuration / Inputs |
|---|---|---|
| `workflow_dispatch` | Manual trigger allowing on-demand execution. | Optional input: `workflow_name` (string) to target a specific workflow file without the `.yml` extension. |
| `schedule` | Automatic time-based trigger. | Cron expression: `'55 2 1 * *'` (Runs on the 1st of every month at 02:55 UTC). |

### Secrets
| Secret Name | Scope / Permission | Description |
|---|---|---|
| `${{ secrets.GITHUB_TOKEN }}` | `contents: write`, `pull-requests: write` | Automatically provided GitHub token used for checking out files, pushing branches, managing pull requests, and adding comments. |
| `${{ secrets.GEMINI_API_KEY }}` | Environment variable | API key required to authenticate requests sent to the Gemini AI API for generating and rewriting documentation. |

### Tickers / Instruments Table
*This workflow does not interact with financial tickers or external instruments.*

### Output Fields & Environment Variables
| Variable / Field Name | Source / Origin | Description |
|---|---|---|
| `GH_TOKEN` | `${{ secrets.GITHUB_TOKEN }}` | Exposed to the PowerShell script for interacting with the GitHub CLI (`gh`). |
| `GEMINI_API_KEY` | `${{ secrets.GEMINI_API_KEY }}` | Exposed to the PowerShell script for Gemini API authentication. |
| `REPO` | `${{ github.repository }}` | The `owner/repo` string identifying the current repository. |
| `WORKFLOW_NAME` | `${{ github.event.inputs.workflow_name }}` | The specific workflow file base name provided during manual dispatch, if any. |

### API / Data Sources
| Source Name | Type | Purpose |
|---|---|---|
| Gemini AI API (`generativelanguage.googleapis.com`) | REST API (OpenAI-compatible) | Used to process workflow contents and generate context-aware Diátaxis documentation using the `gemini-3.5-flash-lite` model. |
| GitHub CLI (`gh`) | CLI Tool | Used programmatically to query open pull requests, create new pull requests, and post update comments. |

## Explanation

### Design Decisions and Reasoning

#### Why Automate Documentation Staleness?
Documentation frequently falls out of sync with code and CI/CD configurations because manual updates are easy to forget. By tying documentation audits to a scheduled cron job and manual dispatches, this workflow ensures that engineers are continuously nudged with ready-to-merge pull requests whenever a workflow file changes.

#### Integration of Diátaxis and AI Agents
Instead of relying on rigid templates or generic summaries, the workflow reads the `diataxis-doc-writer` agent instructions and the `mermaid-diagrams` skill directly from the repository. This guarantees that any generated or updated documentation adheres strictly to the Diátaxis framework (separating Tutorials, How-to guides, Reference, and Explanations) while maintaining consistent formatting and structural integrity.

#### Workflow Flow Visualization
```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Doc Staleness Check Flow
    accDescr: Visualizes how the workflow checks files, queries the Gemini API, and manages GitHub pull requests.

    subgraph Triggers
        A1[workflow_dispatch]
        A2[schedule cron]
    end

    subgraph Evaluation
        B1["Checkout Repository"]
        B2["Iterate Workflow Files"]
        B3["Compare Git Commits & Dates"]
    end

    subgraph Processing
        C1{Is Doc Stale?}
        C2{Open PR Exists?}
        C3["Call Gemini API"]
    end

    subgraph Actions
        D1["Create New PR"]
        D2["Update Existing PR & Comment"]
        D3["Skip / No Action"]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 -- yes --> C2
    C1 -- no --> D3
    C2 -- yes --> C3
    C2 -- no --> C3
    C3 --> D1
    C3 --> D2