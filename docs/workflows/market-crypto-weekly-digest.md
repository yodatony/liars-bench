# Workflow documentation: market-crypto-weekly-digest
**Workflow file:** [.github/workflows/market-crypto-weekly-digest.yml](../../.github/workflows/market-crypto-weekly-digest.yml)

**Last reviewed date:** 2026-11-02

## Intro
The `market-crypto-weekly-digest` workflow automates the retrieval of weekly cryptocurrency performance metrics from external financial APIs and publishes a consolidated summary directly to a Telegram channel. It runs on a scheduled basis every Sunday morning to provide timely updates on weekly, monthly, six-monthly, and yearly asset trends.

## Tutorials

This tutorial guides you through setting up and running your first crypto weekly digest workflow manually.

### Prerequisites
- A GitHub repository with GitHub Actions enabled.
- A Telegram bot token and chat ID.
- A Twelve Data API key.

### Step 1: Add repository secrets
1. Navigate to your GitHub repository and click on **Settings**.
2. In the left sidebar, expand **Secrets and variables**, then click **Actions**.
3. Click **New repository secret**.
4. Add the following three secrets:
   - `TELEGRAM_TOKEN`: Your Telegram bot API token.
   - `TELEGRAM_CHAT_ID`: The target Telegram chat or channel ID.
   - `TWELVEDATA_KEY`: Your Twelve Data API key.

### Step 2: Verify the workflow file
Ensure the workflow file is saved at `.github/workflows/market-crypto-weekly-digest.yml` with the correct syntax and PowerShell execution steps.

### Step 3: Trigger a manual run
1. Go to your repository's **Actions** tab on GitHub.
2. Select the **market-crypto-weekly-digest** workflow from the left sidebar.
3. Click the **Run workflow** dropdown button and click **Run workflow** to execute it immediately.
4. Monitor the job logs to verify that the PowerShell script successfully queries Twelve Data and CoinGecko, processes returns, and sends the message to Telegram.

---

## How-to guides

### How to add or remove crypto tickers from the digest
To modify the list of tracked assets, update the `$Indices` array inside the workflow file:

1. Open `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `$Indices` array definition within the PowerShell script block:
   ```powershell
   $Indices = @(
       @{ Name = "BNB/USD";   Ticker = "BNB/USD";   Market = "CRYPTO"; Own = $false }
       # Add or modify entries here
   )
   ```
3. To add a standard Twelve Data asset, include:
   ```powershell
   @{ Name = "ADA/USD"; Ticker = "ADA/USD"; Market = "CRYPTO"; Own = $false }
   ```
4. To add a CoinGecko-backed asset, include:
   ```powershell
   @{ Name = "HYPE/USD"; Ticker = "HYPE/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "hyperliquid" }
   ```
5. Commit and push your changes to the repository.

### How to adjust the schedule of the digest
To change when the automated digest is sent:

1. Open `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `schedule` trigger block:
   ```yaml
   on:
     workflow_dispatch:
     schedule:
       - cron: '49 5 * * 0'
   ```
3. Modify the cron expression to your desired schedule (the default runs at 05:49 UTC every Sunday).
4. Save, commit, and push the workflow file.

---

## Reference

### Triggers
| Trigger Type | Expression / Syntax | Description |
| :--- | :--- | :--- |
| **Workflow Dispatch** | `workflow_dispatch:` | Allows manual execution from the GitHub Actions UI. |
| **Schedule** | `- cron: '49 5 * * 0'` | Automatically triggers every Sunday at 05:49 UTC. |

### Secrets
| Secret Name | Required | Description |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | Yes | Bot token provided by BotFather for authenticating Telegram API requests. |
| `TELEGRAM_CHAT_ID` | Yes | Unique identifier for the target chat, group, or channel where the digest is posted. |
| `TWELVEDATA_KEY` | Yes | API key for authenticating requests to Twelve Data. |

### Tickers and Instruments Table
| Name | Ticker | Market | Source | Coin ID / Notes | Portfolio Flag (`Own`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BNB/USD` | `BNB/USD` | `CRYPTO` | Twelve Data | Default REST API endpoint | `false` |
| `BTC/USD` | `BTC/USD` | `CRYPTO` | Twelve Data | Default REST API endpoint | `true` (💼) |
| `ETH/USD` | `ETH/USD` | `CRYPTO` | Twelve Data | Default REST API endpoint | `true` (💼) |
| `HYPE/USD` | `HYPE/USD` | `CRYPTO` | CoinGecko | `hyperliquid` | `true` (💼) |
| `SOL/USD` | `SOL/USD` | `CRYPTO` | Twelve Data | Default REST API endpoint | `false` |
| `XRP/USD` | `XRP/USD` | `CRYPTO` | Twelve Data | Default REST API endpoint | `true` (💼) |

### Output Fields (Telegram Message Structure)
| Section / Metric | Format | Description |
| :--- | :--- | :--- |
| **Header** | Bold & Italic HTML | Indicates message category, timeframe (`Monday open → latest close`), and rolling lookback offsets (`1M = 30 | 6M = 182 | 1Y = 365`). |
| **Asset Row** | `<b>FLAG Name</b> (Close) <b>WeekPct</b> Portfolio` | Displays asset name, latest closing price, percentage change since Monday open with color indicators (🟢/🔴), and portfolio ownership marker (💼) if applicable. |
| **Historical Sub-row** | `<i>1M: ... | 6M: ... | 1Y: ...</i>` | Displays 30-day, 182-day, and 365-day percentage shifts relative to latest price. |
| **Error Row** | `<b>FLAG Name</b> — unavailable ⚠️`<br>`<i>Error: Message</i>` | Fallback display triggered if API retrieval fails for a specific ticker. |

### API / Data Sources
| Provider | Base Endpoint / Method | Purpose |
| :--- | :--- | :--- |
| **Twelve Data** | `https://api.twelvedata.com/time_series` | Retrieves historical daily open/close candles for calculating weekly, monthly, six-month, and yearly performance metrics. |
| **Twelve Data** | `https://api.twelvedata.com/price` | Fetches real-time latest spot price for target tickers. |
| **CoinGecko** | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Retrieves 31-day historical price points for assets not fully supported by Twelve Data historical endpoints. |
| **Telegram Bot API** | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the formatted HTML markdown digest to the specified chat ID. |

---

## Explanation

### Design Decisions and Rationale

The `market-crypto-weekly-digest` workflow is structured around PowerShell executing within a standard GitHub Actions Linux runner (`ubuntu-latest`). This architecture was chosen for several key reasons:

1. **Cross-Platform Scripting:** PowerShell (`pwsh`) is used because it provides robust, readable object-manipulation pipelines, clean exception handling blocks (`try`/`catch`), and native JSON payload conversion (`ConvertTo-Json`), which simplifies constructing complex API requests and payloads.
2. **Resilient Data Sourcing:** While Twelve Data serves as the primary financial data engine, fallback support for CoinGecko is integrated into the ticker schema (`Source = "COINGECKO"`). This allows tracking newly launched or specialized tokens (like Hyperliquid) that may lack robust historical candlestick coverage on traditional financial feeds.
3. **Rate Limit Mitigation:** A deliberate 15-second pause (`Start-Sleep -Seconds 15`) is injected between Twelve Data requests to respect public API rate limits and prevent HTTP 429 (Too Many Requests) errors during batch execution.
4. **Graceful Error Handling:** Network failures or missing data points for an individual asset are caught locally within the asset iteration loop rather than aborting the entire workflow. This guarantees that a temporary failure on one ticker does not suppress the digest for the remaining portfolio.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart TD
    accTitle: Workflow Execution Flow
    accDescr: Visualizes how triggers initiate the job, fetch data from APIs, process performance metrics, and send a summary to Telegram.

    A([Workflow Trigger]) -->|Scheduled cron / Manual dispatch| B[GitHub Actions Job: send-digest]
    B --> C[Initialize Europe/Stockholm Timezone & Ticker Array]
    C --> D{Loop through Tickers}
    
    D -->|Source: COINGECKO| E[Invoke CoinGecko API Market Chart]
    D -->|Source: Twelve Data| F[Invoke Twelve Data Time Series & Price APIs]
    
    E --> G[Calculate Percentage Changes & Latest Close]
    F --> G
    
    G --> H{API Error Encountered?}
    H -- Yes --> I[Log Warning & Mark Asset as Unavailable]
    H -- No --> J[Store Processed Metrics & Sort by Weekly Performance]
    
    I --> K{More Tickers?}
    J --> K
    
    K -- Yes --> D
    K -- No --> L[Format HTML Message Payload]
    L --> M[Send POST Request to Telegram Bot API]
    M --> N([Workflow Complete])