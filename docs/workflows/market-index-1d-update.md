# Workflow documentation: market-index-1d-update
**Workflow file:** [.github/workflows/market-index-1d-update.yml](../../.github/workflows/market-index-1d-update.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `market-index-1d-update` workflow fetches end-of-day and daily market index data for configured Swedish and US markets and pushes a summary report directly to a Telegram chat. It exists to automate daily performance tracking of core financial indices using a lightweight PowerShell script executed within GitHub Actions.

## Tutorials
This tutorial guides you through setting up and running your first manual execution of the `market-index-1d-update` workflow.

### 1. Prerequisites
- A GitHub repository with the workflow file placed at `.github/workflows/market-index-1d-update.yml`.
- Active API credentials for **EODHD** and **Twelve Data**.
- A Telegram bot token and chat ID where the report will be posted.

### 2. Configure Repository Secrets
1. Navigate to your GitHub repository and click on **Settings**.
2. In the left sidebar, expand **Secrets and variables** and select **Actions**.
3. Click **New repository secret** and add the following three secrets:
   - `TELEGRAM_TOKEN`: Your Telegram bot access token.
   - `TELEGRAM_CHAT_ID`: The target chat or channel ID.
   - `EODHD_KEY`: Your API key for EODHD.
   - `TWELVEDATA_KEY`: Your API key for Twelve Data.

### 3. Run the Workflow Manually
1. In your repository, click on the **Actions** tab at the top.
2. Select the **market-index-1d-update** workflow from the left-hand list.
3. Click the **Run workflow** dropdown button on the right side.
4. Confirm by clicking the green **Run workflow** button.
5. Click into the active workflow run to watch the PowerShell script execute. Once complete, check your Telegram channel to verify that the formatted index review message was delivered successfully.

## How-to guides
These guides cover routine operational tasks for managing and interacting with the workflow.

### How to trigger the workflow via an external scheduler (cron-job.org)
Since the workflow uses `workflow_dispatch` without an internal cron schedule, you can trigger it externally via a web service like cron-job.org:
1. Generate a GitHub Personal Access Token (PAT) with `repo` or `workflow` scope.
2. Set up an HTTP POST request job in cron-job.org pointing to the GitHub REST API endpoint:
   `https://api.github.com/repos/{owner}/{repo}/actions/workflows/market-index-1d-update.yml/dispatches`
3. Include headers for authorization (`Bearer <PAT>`) and GitHub API versioning (`X-GitHub-Api-Version: 2022-11-28`).

### How to add a new market index ticker
1. Open `.github/workflows/market-index-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell step:
   ```powershell
   $Indices = @(
       @{ Name = "OMXSPI";     Ticker = "OMXSPI.INDX"; Market = "SE" }
       # Add your new index here
   )
   ```
3. Add a new hashtable specifying `Name`, `Ticker`, and `Market` (`SE` for EODHD or `US` for Twelve Data).
4. Commit and push the changes to your repository.

## Reference
This section provides factual data regarding triggers, secrets, tracked instruments, and output formats.

### Triggers
| Trigger Type | Description |
|---|---|
| `workflow_dispatch` | Allows manual execution from the GitHub Actions UI and supports external HTTP webhook triggers (e.g., cron-job.org). |

### Secrets
| Secret Name | Description | Required |
|---|---|---|
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate message delivery. | Yes |
| `TELEGRAM_CHAT_ID` | Identifier for the destination Telegram chat or group. | Yes |
| `EODHD_KEY` | API key used for fetching Swedish (`SE`) market index data from EODHD. | Yes |
| `TWELVEDATA_KEY` | API key used for fetching US (`US`) market index data via Twelve Data. | Yes |

### Tickers and Instruments Table
| Display Name | Ticker Symbol | Market | Data Provider |
|---|---|---|---|
| OMXSPI | `OMXSPI.INDX` | SE | EODHD |
| OMXS30GI | `OMXS30GI.INDX` | SE | EODHD |
| OMXS30 | `OMXS30.INDX` | SE | EODHD |
| S&P 500 (ETF) | `SPY` | US | Twelve Data |
| DJUS (ETF) | `IYY` | US | Twelve Data |
| DJI (ETF) | `DIA` | US | Twelve Data |

### Output Fields
| Field | Description |
|---|---|
| `Name` | Human-readable name of the index or ETF displayed in the Telegram message. |
| `Flag` | Emoji flag representing the market region (`🇸🇪` for Sweden, `🇺🇸` for United States). |
| `Close` | Rounded closing price for the target trading day. |
| `DayPct` | Percentage change compared to the previous trading day, formatted with a green (`🟢`) or red (`🔴`) indicator. |
| `Error` | Boolean flag set to `true` if data retrieval fails, rendering an "unavailable ⚠️" status message. |

### API / Data Sources
| Provider | Base Endpoint / URL Structure | Used For |
|---|---|---|
| EODHD | `https://eodhd.com/api/eod/{Ticker}?api_token={Key}&fmt=json&order=d&limit=3` | Swedish indices (`SE`) |
| Twelve Data | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | US ETFs (`US`) |
| Telegram Bot API | `https://api.api.telegram.org/bot{Token}/sendMessage` | Dispatching the formatted report |

## Explanation
This section outlines the architectural decisions and design choices behind the `market-index-1d-update` workflow.

### Design Decisions
- **PowerShell Runtime**: The script runs inside a `pwsh` step on an `ubuntu-latest` runner. This allows cross-platform execution of robust scripting logic (such as hashtables, custom PSCustomObjects, and error handling blocks) without maintaining external script files in the repository.
- **External Scheduling via `workflow_dispatch`**: Removing native cron triggers in favor of manual/external triggers simplifies workflow execution management and prevents unwanted runs when repositories go inactive or fork.
- **Provider-Split Architecture**: The script splits data retrieval based on market origin (`SE` uses EODHD, `US` uses Twelve Data) to leverage the most accurate and cost-effective data provider per asset class.
- **Strict Date Filtering**: Results are filtered to strictly match the previous calendar trading day (`$YesterdayDate`), ensuring reports consistently reflect completed session data rather than intraday fluctuations.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Workflow Execution Flow
    accDescr: Visualizes how the market index update workflow is triggered and executes its PowerShell data collection and notification steps.

    A[External Cron / Manual Trigger] -->|workflow_dispatch| B(GitHub Actions Runner: ubuntu-latest)
    B --> C[PowerShell Script Execution]
    C --> D{Market Region?}
    D -->|SE| E[Fetch EODHD API]
    D -->|US| F[Fetch Twelve Data API]
    E --> G[Process & Filter Results]
    F --> G
    G --> H[Format HTML Telegram Message]
    H --> I[Send Message via Telegram Bot API]