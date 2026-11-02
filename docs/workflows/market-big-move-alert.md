# Workflow documentation: Market Big Move Alert

**Workflow file:** [.github/workflows/market-big-move-alert.yml](../../.github/workflows/market-big-move-alert.yml)

**Last reviewed date:** 2026-11-02

## Intro

The Market Big Move Alert workflow monitors designated US stock tickers for intraday price movements exceeding a 3% threshold using the Twelve Data API. When significant moves occur during or outside market hours, it instantly dispatches a formatted notification to a configured Telegram chat.

## Tutorials

### Setting up and running your first big move check

This tutorial walks a first-time user through configuring the required repository secrets, verifying the tracked tickers list, and executing the workflow manually to verify your Telegram alerts are working properly.

1. **Configure Repository Secrets**
   Navigate to your GitHub repository settings, go to **Secrets and variables** > **Actions**, and add the following secrets:
   - `TELEGRAM_TOKEN`: Your Telegram bot token obtained via BotFather.
   - `TELEGRAM_CHAT_ID`: The destination Telegram chat or channel ID.
   - `TWELVEDATA_KEY`: Your API key from Twelve Data.

2. **Inspect the Ticker List**
   Open `.github/workflows/market-big-move-alert.yml` and review the `$Indices` array. Ensure the default tickers (AAPL, AMZN, GOOGL, MSFT, AVGO, TSLA, NOW) match the instruments you wish to monitor.

3. **Manually Trigger the Workflow**
   - Go to the **Actions** tab in your GitHub repository.
   - Select the **market-big-move-alert** workflow from the sidebar.
   - Click **Run workflow**, select your branch, and click the green **Run workflow** button to execute an immediate check.

4. **Verify the Output**
   Check your designated Telegram chat. If any monitored ticker has moved by 3% or more, you will receive a formatted alert message indicating the stock, price, direction, and portfolio ownership status.

## How-to guides

### How to add a new ticker to the monitoring list
1. Open `.github/workflows/market-big-move-alert.yml` in your editor.
2. Locate the `$Indices` array inside the `check-moves` job step.
3. Add a new hashtable entry following the existing schema:
   ```powershell
   @{ Name = "NVDA"; Ticker = "NVDA"; Market = "US"; Own = $true }
   ```
4. Commit and push the changes to your default branch.

### How to adjust the alert percentage threshold
1. Open `.github/workflows/market-big-move-alert.yml`.
2. Locate the variable assignment `$Threshold = 3` inside the PowerShell script block.
3. Change `3` to your desired percentage threshold (e.g., `5` for a 5% move).
4. Save, commit, and push your changes.

## Reference

### Triggers
| Trigger Type | Description |
|---|---|
| `workflow_dispatch` | Triggered manually via the GitHub Actions UI or externally on a schedule via cron-job.org. |

### Secrets
| Secret Name | Description | Required |
|---|---|---|
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate message delivery. | Yes |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel identifier. | Yes |
| `TWELVEDATA_KEY` | Twelve Data API key for fetching real-time quote data. | Yes |

### Tickers / Instruments
| Name | Ticker Symbol | Market | Portfolio Ownership (`Own`) |
|---|---|---|---|
| AAPL | AAPL | US | `false` |
| AMZN | AMZN | US | `false` |
| GOOGL | GOOGL | US | `false` |
| MSFT | MSFT | US | `true` |
| AVGO | AVGO | US | `true` |
| TSLA | TSLA | US | `true` |
| NOW | NOW | US | `true` |

### Output Fields
| Field / Variable | Source | Description |
|---|---|---|
| `$R.percent_change` | Twelve Data API | Calculated intraday percentage change for the ticker. |
| `$R.close` | Twelve Data API | Latest closing or current price of the instrument. |
| `$R.datetime` | Twelve Data API | Timestamp of the fetched candle data, used to verify trading day validity. |
| `$Alerts` | Script logic | Aggregated list of formatted HTML strings representing tickers meeting the move threshold. |

### API / Data Sources
| Provider | Endpoint Pattern | Purpose |
|---|---|---|
| Twelve Data | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | Fetching real-time quote metrics and price changes. |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Delivering formatted notification messages to chats. |

## Explanation

The Market Big Move Alert workflow is designed around reliability, cost efficiency, and lightweight execution. By utilizing GitHub Actions with PowerShell (`pwsh`), the workflow avoids the overhead of maintaining dedicated server infrastructure while leveraging robust cross-platform scripting capabilities.

Market monitoring relies on polled REST API requests to Twelve Data rather than persistent WebSocket connections. This request-response model fits naturally into scheduled or manual CI/CD triggers. Timezone handling explicitly normalizes execution times to Central European Time (`Europe/Stockholm`) to accurately calculate US market open and close windows relative to local operational schedules.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart TD
    accTitle: Market Big Move Alert Execution Flow
    accDescr: Visualizes the sequence from workflow dispatch through price checking and conditional Telegram notification delivery.

    Start([Workflow Dispatch]) --> InitEnv[Initialize PowerShell & Timezone Europe/Stockholm]
    InitEnv --> LoopStart{Loop through Indices}
    
    LoopStart --> FetchAPI[Fetch Quote from Twelve Data API]
    FetchAPI --> CheckError{API Error or Closed Day?}
    
    CheckError -- Yes --> SkipDay[Skip / Log Warning]
    CheckError -- No --> CalcMove[Calculate Percentage Move & Price]
    
    CalcMove --> ThresholdCheck{Absolute Move >= 3%?}
    ThresholdCheck -- Yes --> AddAlert[Append to Alert List with Emoji & Portfolio Tag]
    ThresholdCheck -- No --> NextIndex
    
    SkipDay --> NextIndex{More Tickers?}
    AddAlert --> NextIndex
    
    NextIndex -- Yes --> LoopStart
    NextIndex -- No --> AnyAlerts{Any Alerts Collected?}
    
    AnyAlerts -- No --> EndNoOp([Exit: No Big Moves])
    AnyAlerts -- Yes --> SendTelegram[POST Formatted HTML Message to Telegram API]
    SendTelegram --> EndSuccess([Exit: Alert Sent Successfully])