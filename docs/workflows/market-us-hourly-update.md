# Workflow documentation: Market US Hourly Update
**Workflow file:** [.github/workflows/market-us-hourly-update.yml](../../.github/workflows/market-us-hourly-update.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `market-us-hourly-update` workflow fetches real-time financial quote data for US indices and tracked stock positions using the TwelveData API. It evaluates whether the US stock market is currently open in CET time, formats the percentage changes accordingly, and pushes a structured HTML-formatted summary message directly to a Telegram chat.

## Tutorials

### Setting Up and Running Your First Market US Hourly Update
This tutorial guides you through configuring and running the US market update workflow for the very first time. By the end, you will successfully trigger a test run and receive a market update message in your Telegram chat.

#### Prerequisites
- A GitHub repository with GitHub Actions enabled.
- A Telegram bot token and a target chat ID.
- A free API key from [TwelveData](https://twelvedata.com/).

#### Step 1: Add Repository Secrets
To allow the workflow to securely access external APIs and Telegram, you must configure GitHub Secrets.
1. Navigate to your GitHub repository and click on **Settings**.
2. In the left sidebar, expand **Secrets and variables** and click **Actions**.
3. Click **New repository secret** and add the following three secrets one by one:
   - `TELEGRAM_TOKEN`: Your Telegram Bot API token.
   - `TELEGRAM_CHAT_ID`: The recipient chat ID or channel ID.
   - `TWELVEDATA_KEY`: Your TwelveData API key.

#### Step 2: Create the Workflow File
Create the workflow directory structure if it does not already exist, and add the workflow file:
1. In your repository, create the path `.github/workflows/`.
2. Create a file named `market-us-hourly-update.yml`.
3. Paste the contents of the market US hourly update workflow configuration into this file and commit your changes to your default branch.

#### Step 3: Trigger a Manual Test Run
Because this workflow is configured with `workflow_dispatch` to be triggered externally (such as via cron-job.org) on a schedule, you can manually invoke it to verify your setup:
1. Go to your repository's **Actions** tab.
2. Select the **market-us-hourly-update** workflow from the left sidebar.
3. Click the **Run workflow** dropdown button and click **Run workflow**.

#### Step 4: Verify the Output
1. Wait a few seconds for the `ubuntu-latest` runner to spin up and execute the PowerShell script.
2. Open your Telegram chat or channel.
3. Confirm that you receive a formatted update showing US market status, indices, and individual tickers with color-coded price action emoji indicators.

---

## How-to guides

### How to Add or Remove Tracked Tickers
To customize the list of financial instruments monitored by the workflow, modify the `$Indices` array inside the PowerShell step in the workflow file.

1. Open `.github/workflows/market-us-hourly-update.yml`.
2. Locate the `$Indices = @(...)` block within the `send-update` job step.
3. Add a new hashtable entry following the established pattern:
   ```powershell
   @{ Name = "NVIDIA"; Ticker = "NVDA"; Market = "US"; Own = $true }
   ```
   *Note: Set `Own = $true` if you hold the asset (adds a 💼 portfolio badge) or `Own = $false` for broader market indices (ETF).*
4. Save the file and commit changes to your repository.

### How to Test Workflow Changes Locally
Because the script runs in PowerShell (`pwsh`), you can test modifications to data parsing or message formatting locally on your machine before pushing to GitHub.

1. Open your local terminal and start a PowerShell session.
2. Set the required environment variables:
   ```powershell
   $env:TELEGRAM_TOKEN = "your_bot_token"
   $env:TELEGRAM_CHAT_ID = "your_chat_id"
   $env:TWELVEDATA_KEY = "your_twelvedata_key"
   ```
3. Copy the script block inside the `run:` section of the workflow file into a local `.ps1` script file.
4. Execute the script locally. Review console outputs to verify that TwelveData requests succeed and JSON payloads parse correctly without syntax errors.

---

## Reference

### Triggers
| Trigger | Type | Description |
| :--- | :--- | :--- |
| `workflow_dispatch` | Manual / External Webhook | Triggered externally on schedule (e.g., via cron-job.org) or manually via GitHub Actions UI. |

### Secrets
| Secret Name | Required | Description |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | Yes | Telegram Bot API access token used to authenticate API requests. |
| `TELEGRAM_CHAT_ID` | Yes | Target Telegram chat or channel ID where messages are delivered. |
| `TWELVEDATA_KEY` | Yes | TwelveData API key used to fetch real-time financial quotes. |

### Tickers and Instruments
| Name | Ticker Symbol | Market | Portfolio Tracked (`Own`) |
| :--- | :--- | :--- | :--- |
| DJI (ETF) | `DIA` | US | No (`$false`) |
| DJUS (ETF) | `IYY` | US | No (`$false`) |
| S&P 500 (ETF) | `SPY` | US | No (`$false`) |
| MSFT | `MSFT` | US | Yes (`$true`) |
| NOW | `NOW` | US | Yes (`$true`) |
| TSLA | `TSLA` | US | Yes (`$true`) |
| AVGO | `AVGO` | US | Yes (`$true`) |

### Output Fields & Formatting Elements
| Element / Field | Type | Description |
| :--- | :--- | :--- |
| Market Status (`usStatus`) | String | Evaluates to `Open 🔔` during market hours or `Closed 🔕` outside of trading hours. |
| Percentage Change (`DayPct`) | Rounded Float | Rounded to 2 decimal places. Formatted with `+` / `-` signs and color-coded emojis (`🟢`/`🔴` when open, `▲`/`▼` when closed). |
| Portfolio Badge (`Own`) | Emoji (`💼`) | Appended to items where `Own = $true`. |
| Holiday Guard (`CandleDate`) | Date String | Validates against today's date (`yyyy-MM-dd`); exits early without sending a message if no trading occurred (market holiday/closure). |

### API / Data Sources
| Source Name | Endpoint / Protocol | Purpose |
| :--- | :--- | :--- |
| TwelveData API | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | Fetches real-time closing price, percentage change, and transaction date for financial instruments. |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Dispatches formatted HTML messages to the specified chat ID. |

---

## Explanation

### Design Decisions and Rationale

#### PowerShell as the Execution Environment
The workflow uses PowerShell (`pwsh: shell`) rather than native bash scripting or discrete actions. This design choice provides robust object-handling capabilities, native hashtable syntax for defining financial instrument metadata collections, and clean script block evaluation without requiring external language dependencies on the runner.

#### Timezone Handling and Market Hours Logic
Stock market status calculation requires precise timezone awareness. The script explicitly converts UTC time to `Europe/Stockholm` timezone (`$TZ`) to evaluate whether current time falls within regular US trading hours (Monday through Friday, between 15:30 and 22:00 CET). This guarantees accurate intraday versus market-close messaging headers regardless of runner UTC defaults.

#### Holiday and Non-Trading Day Safeguards
To avoid spamming outdated or stale closing prices on weekends, market holidays, or unscheduled closures, the workflow checks the candle date returned by TwelveData against the current date (`$TodayDate`). If the fetched quote date does not match today's date, the script terminates gracefully (`exit 0`), preventing redundant messages from reaching the Telegram channel.

#### Workflow Architecture Flow
```mermaid
%%{init: {'theme':'default'}}%%
flowchart TD
    accTitle: Market US Hourly Update Flow
    accDescr: Visualizes the trigger, execution steps, API requests, holiday checks, and Telegram notification delivery of the workflow.

    A[workflow_dispatch Trigger] --> B[Initialize Runner & PowerShell Env]
    B --> C[Calculate CET Time & US Market Hours]
    C --> D[Iterate Through Ticker List]
    D --> E[Fetch Quote via TwelveData API]
    E --> F{API Error or Closed Market?}
    F -- Error --> G[Append Error Warning to Lines]
    F -- Success --> H[Format Percentage & Portfolio Badge]
    G --> I{More Tickers?}
    H --> I
    I -- Yes --> D
    I -- No --> J{Candle Date Matches Today?}
    J -- No (Holiday/Weekend) --> K[Exit Gracefully - No Message Sent]
    J -- Yes --> L[Construct HTML Payload & Send Telegram Message]