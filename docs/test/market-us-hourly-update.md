# Workflow documentation: market-us-hourly-update
**Workflow file:** [.github/workflows/market-us-hourly-update.yml](../../.github/workflows/market-us-hourly-update.yml)

**Last reviewed date:** 2026-10-13

## Intro
The `market-us-hourly-update` workflow fetches real-time financial quote data for US indices and stocks using the TwelveData API and delivers formatted hourly updates to a Telegram channel or chat. It dynamically formats percent changes using green/red emojis during open market hours and arrow indicators during closed hours, while also skipping notifications automatically on market holidays or weekends if no trading data is available.

## Tutorials

### Getting Started with US Market Hourly Updates

This tutorial guides you through setting up and running your first manual US market hourly update workflow.

#### Prerequisites
- A GitHub repository with GitHub Actions enabled.
- A Telegram bot token and chat ID.
- A TwelveData API key.

#### Step 1: Add Required Secrets to GitHub
1. Navigate to your GitHub repository and click on **Settings**.
2. In the left sidebar, expand **Secrets and variables**, then click **Actions**.
3. Click **New repository secret** and add the following three secrets:
   - `TELEGRAM_TOKEN`: Your Telegram Bot API token.
   - `TELEGRAM_CHAT_ID`: The destination chat or channel ID.
   - `TWELVEDATA_KEY`: Your API key from TwelveData.

#### Step 2: Verify the Workflow File
Ensure that `.github/workflows/market-us-hourly-update.yml` is present in your repository with the correct configuration and ticker list.

#### Step 3: Manually Trigger the Workflow
1. Go to the **Actions** tab in your GitHub repository.
2. Select the **market-us-hourly-update** workflow from the left sidebar.
3. Click the **Run workflow** dropdown button and click the green **Run workflow** button to execute it.
4. Once completed, check your Telegram chat to verify that the market update message was successfully received.

---

## How-to guides

### How to add a new ticker or ETF to the tracking list
1. Open the workflow file at `.github/workflows/market-us-hourly-update.yml`.
2. Locate the `$Indices` array inside the PowerShell step:
   ```powershell
   $Indices = @(
       @{ Name = "DJI (ETF)";     Ticker = "DIA";  Market = "US"; Own = $false }
       ...
   )
   ```
3. Add a new hash table entry following the existing schema:
   ```powershell
   @{ Name = "Apple"; Ticker = "AAPL"; Market = "US"; Own = $true }
   ```
   *Note: Set `Own = $true` if you want the portfolio briefcase icon (`💼`) displayed next to the ticker.*
4. Commit and push your changes to the repository.

### How to configure external scheduling via cron-job.org
1. Log in to your cron-job.org (or alternative external scheduler) account.
2. Create a new cron job configured to fire hourly (or at your desired cadence).
3. Set the target URL to invoke the GitHub Actions workflow dispatch endpoint using a GitHub Personal Access Token (PAT) with `repo` or `workflow` scope.

---

## Reference

### Triggers
| Trigger Type | Description |
|---|---|
| `workflow_dispatch` | Triggered externally on a schedule via services like cron-job.org or manually from the GitHub Actions UI. |

### Secrets
| Secret Name | Description |
|---|---|
| `TELEGRAM_TOKEN` | Bot token provided by BotFather for authenticating Telegram API calls. |
| `TELEGRAM_CHAT_ID` | Target chat, group, or channel identifier where messages are sent. |
| `TWELVEDATA_KEY` | API key for authenticating requests to TwelveData. |

### Tickers / Instruments Table
| Name | Ticker | Market | Portfolio Own (`Own`) |
|---|---|---|---|
| DJI (ETF) | `DIA` | US | `false` |
| DJUS (ETF) | `IYY` | US | `false` |
| S&P 500 (ETF) | `SPY` | US | `false` |
| MSFT | `MSFT` | US | `true` |
| NOW | `NOW` | US | `true` |
| TSLA | `TSLA` | US | `true` |
| AVGO | `AVGO` | US | `true` |

### Output Fields & Message Elements
| Field / Element | Description |
|---|---|
| Market Status (`$usStatus`) | Displays `Open 🔔` during market hours or `Closed 🔕` outside trading hours. |
| Message Header | Differentiates between regular Intraday updates (`📈`) and US Market Close summaries (`🔕 US Market Close 🔕`). |
| Percent Change Formatting | Uses colored circles (`🟢` / `🔴`) during market hours and arrows (`▲` / `▼`) during closed hours. |
| Portfolio Indicator (`💼`) | Appended to rows where `Own = $true`. |
| Error Fallback | Displays `— unavailable ⚠️` and the exception message if an individual ticker fetch fails. |

### API / Data Sources
| Source Name | Endpoint / Protocol | Purpose |
|---|---|---|
| TwelveData API | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | Fetches real-time quote data (closing price, percent change, datetime). |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Delivers formatted HTML messages to the specified chat ID. |

---

## Explanation

### Design Decisions and Architecture

The `market-us-hourly-update` workflow is designed to be lightweight, self-contained, and resilient. Running entirely within a single PowerShell script step on an `ubuntu-latest` runner avoids the complexity of maintaining external helper scripts or managing complex multi-job dependencies.

#### Timezone Handling and Market Hours Logic
GitHub Actions runners operate in UTC time. Financial markets operate in local times (specifically US Eastern Time for US markets). To determine whether the US market is currently open, the script converts current UTC time into `Europe/Stockholm` time and computes business hours and weekday constraints (`-not-in @('Saturday','Sunday')`). This ensures accurate intraday versus market-close messaging layout regardless of the runner's underlying infrastructure time.

#### Holiday and Non-Trading Day Safeguards
To prevent sending stale or misleading data on market holidays or weekends when exchanges are closed, the script checks the datetime returned by the TwelveData quote payload against the current date (`$TodayDate`). If the returned candle date does not match today's date, the workflow exits gracefully (`exit 0`) without dispatching a Telegram message.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart TD
    accTitle: Workflow Execution Flow
    accDescr: Visualizes the trigger, data fetching, market status checks, holiday validation, and Telegram message dispatch.

    A[Trigger: workflow_dispatch] --> B[Initialize PowerShell Environment]
    B --> C[Calculate Stockholm Time & Market Open Status]
    C --> D[Iterate Tickers & Fetch Quotes from TwelveData API]
    D --> E{API Success?}
    E -- Yes --> F[Extract Quote Data & Candle Date]
    E -- No --> G[Mark Ticker Unavailable & Log Error]
    F --> H{Candle Date matches Today?}
    G --> H
    H -- No --> I[Skip Execution / Exit 0]
    H -- Yes --> J[Construct HTML Message Payload]
    J --> K[Send Message via Telegram Bot API]
    K --> L[Workflow Complete]