# Workflow documentation: market-us-hourly-update
**Workflow file:** [.github/workflows/market-us-hourly-update.yml](../../.github/workflows/market-us-hourly-update.yml)

**Last reviewed date:** 2026-10-13

## Intro
The `market-us-hourly-update` workflow fetches real-time financial data for configured US indices and stocks from the Twelve Data API and dispatches a formatted notification to a Telegram channel or chat. It automatically determines whether the US market is currently open to tailor percentage formatting and evaluates whether trading is active on the current date to prevent sending stale holiday updates.

## Tutorials

### Getting Started with the Market US Hourly Update Workflow

This tutorial guides you through setting up and running your first manual dispatch of the market US hourly update workflow. By the end, you will have successfully configured your secrets and executed the workflow to receive a Telegram market notification.

#### Prerequisites
- A GitHub repository with the workflow file located at `.github/workflows/market-us-hourly-update.yml`.
- A Telegram Bot token (from BotFather) and a target Chat ID.
- A Twelve Data API key.

#### Step 1: Add Required GitHub Secrets
Before running the workflow, configure the necessary repository secrets so GitHub Actions can authenticate with Telegram and Twelve Data.

1. Navigate to your GitHub repository and click on **Settings**.
2. In the left sidebar, expand **Secrets and variables** and click **Actions**.
3. Click **New repository secret** and add the following three secrets one by one:
   - Name: `TELEGRAM_TOKEN` | Value: Your Telegram Bot Token
   - Name: `TELEGRAM_CHAT_ID` | Value: Your Telegram Chat ID
   - Name: `TWELVEDATA_KEY` | Value: Your Twelve Data API Key

#### Step 2: Trigger the Workflow Manually
Since the workflow runs on an external schedule via cron-job.org using `workflow_dispatch`, you can trigger it manually to test your configuration.

1. In your GitHub repository, click on the **Actions** tab.
2. In the left-hand workflow list, select **market-us-hourly-update**.
3. Click the **Run workflow** dropdown button on the right side.
4. Leave the branch selected to `main` (or your default branch) and click the green **Run workflow** button.

#### Step 3: Verify the Results
1. Wait a few moments for the `ubuntu-latest` runner to spin up and execute the PowerShell script.
2. Check the workflow run logs to confirm the output message `Sent at HH:mm CET` appears.
3. Open your Telegram chat to verify that the market update message was successfully received with current index pricing and status indicators.

---

## How-to guides

### How to Add a New Ticker to Track
To track an additional stock or ETF in your market updates, update the `$Indices` array inside the PowerShell script block.

1. Open `.github/workflows/market-us-hourly-update.yml` in your editor.
2. Locate the `$Indices` array inside the `run` step:
   ```powershell
   $Indices = @(
       @{ Name = "DJI (ETF)";     Ticker = "DIA";  Market = "US"; Own = $false }
       ...
   )
   ```
3. Add a new hash table entry with the required properties (`Name`, `Ticker`, `Market`, and `Own`):
   ```powershell
   @{ Name = "AAPL"; Ticker = "AAPL"; Market = "US"; Own = $true }
   ```
4. Commit and push your changes to the repository.

### How to Configure External Scheduling via cron-job.org
The workflow relies on `workflow_dispatch` to allow external schedulers to trigger runs.

1. Create an account on [cron-job.org](https://www.cron-job.org/).
2. Create a new cron job pointing to your GitHub repository dispatch endpoint using the GitHub REST API:
   - URL: `https://api.github.com/repos/{owner}/{repo}/actions/workflows/market-us-hourly-update.yml/dispatches`
   - Method: `POST`
   - Headers: Include your GitHub Personal Access Token (PAT) with `repo` or `workflow` scope, along with a valid User-Agent.
   - Body: `{"ref":"main"}`
3. Set your desired hourly schedule frequency (e.g., every hour during market hours).

---

## Reference

### Triggers
| Trigger | Type | Description |
| :--- | :--- | :--- |
| `workflow_dispatch` | Manual / External API | Triggered externally on schedule via cron-job.org or manually via the GitHub UI. |

### Secrets
| Secret Name | Description | Required |
| :--- | :--- | :---: |
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate message sending. | Yes |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where updates are posted. | Yes |
| `TWELVEDATA_KEY` | API key for fetching market quotes from Twelve Data. | Yes |

### Tickers and Instruments Table
| Name | Ticker | Market | Portfolio Ownership (`Own`) |
| :--- | :--- | :--- | :--- |
| DJI (ETF) | `DIA` | US | No (`$false`) |
| DJUS (ETF) | `IYY` | US | No (`$false`) |
| S&P 500 (ETF) | `SPY` | US | No (`$false`) |
| MSFT | `MSFT` | US | Yes (`$true`) |
| NOW | `NOW` | US | Yes (`$true`) |
| TSLA | `TSLA` | US | Yes (`$true`) |
| AVGO | `AVGO` | US | Yes (`$true`) |

### Output Fields
| Field / Variable | Source / Calculation | Description |
| :--- | :--- | :--- |
| `Current` | `[math]::Round([double]$R.close, 2)` | The latest closing or current price of the ticker. |
| `DayPct` | `[math]::Round([double]$R.percent_change, 2)` | The percentage change for the trading day. |
| `Date` | `$R.datetime.Substring(0, 10)` | The date corresponding to the price data (`YYYY-MM-DD`). |
| `UsMarketOpen` | Boolean logic based on CET time & day of week | Evaluates if the US market is currently open (Monday–Friday, 15:30–22:00 CET). |
| `IsMarketClose` | `$Hour -eq 22 -and $Min -eq 0` | Determines if the run coincides with the exact US market close time. |

### API / Data Sources
| Source Name | Endpoint / Protocol | Purpose |
| :--- | :--- | :--- |
| Twelve Data API | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | Retrieves real-time quote data, pricing, and percentage changes. |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Delivers formatted HTML messages to the specified chat ID. |

---

## Explanation

### Design Decisions and Rationale

#### PowerShell on `ubuntu-latest`
The workflow executes PowerShell (`pwsh`) scripts directly inside a standard Linux runner (`ubuntu-latest`). This design choice enables rich object manipulation, robust error handling (`try/catch`), script block reuse, and native hash-table filtering without requiring custom-built container images or external Python/Node.js setup steps.

#### Timezone Handling (Europe/Stockholm)
Financial markets operate on US Eastern Time, but user reporting and scheduling are aligned with European schedules (CET/CEST). The script explicitly queries the `Europe/Stockholm` timezone to evaluate market open/close boundaries and display local timestamps correctly in message headers.

#### Holiday and Weekend Safety Checks
To prevent sending misleading notifications or spamming channels when markets are closed for holidays or weekends, the script checks two distinct conditions:
1. **Day of Week & Time Boundaries (`UsMarketOpen`):** Ensures intraday percentage formatting uses arrows (`▲`/`▼`) when closed and colored indicators (`🟢`/`🔴`) when open.
2. **Candle Date Validation (`$CandleDate -ne $TodayDate`):** Compares the date returned by Twelve Data against the current system date. If trading did not occur today (e.g., a market holiday), the script terminates gracefully (`exit 0`) without dispatching a notification.