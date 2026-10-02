# Workflow documentation: market-crypto-weekly-digest
**Workflow file:** [.github/workflows/market-crypto-weekly-digest.yml](../../.github/workflows/market-crypto-weekly-digest.yml)
**Last reviewed date:** 2026-10-02

## Intro
The `market-crypto-weekly-digest` workflow automates the retrieval of weekly cryptocurrency performance metrics from external APIs and sends a formatted summary report to a Telegram chat. It runs on a scheduled cron job or via manual dispatch to provide up-to-date tracking of key digital assets, comparing recent price points against historical intervals.

## Tutorials
This tutorial walks you through setting up and running the crypto weekly digest workflow for the first time.

### Prerequisites
- A GitHub repository with GitHub Actions enabled.
- A Telegram bot token and chat ID.
- A Twelve Data API key.

### Step 1: Add Secrets to GitHub
Navigate to your repository's **Settings** > **Secrets and variables** > **Actions** and add the following repository secrets:
- `TELEGRAM_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TWELVEDATA_KEY`

### Step 2: Create the Workflow File
Create the workflow directory structure and file at `.github/workflows/market-crypto-weekly-digest.yml` and paste the workflow code provided in the configuration.

### Step 3: Trigger the Workflow Manually
1. Go to the **Actions** tab in your GitHub repository.
2. Select the **market-crypto-weekly-digest** workflow from the left sidebar.
3. Click the **Run workflow** dropdown and click **Run workflow** to execute it immediately.
4. Verify that the message is successfully delivered to your configured Telegram channel.

## How-to guides

### How to Add or Remove Crypto Tickers
To modify the list of tracked assets, update the `$Indices` array inside the PowerShell step of the workflow file:
1. Open `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `$Indices = @(` block.
3. Add, modify, or remove custom hash tables representing the crypto assets. For example:
   ```powershell
   @{ Name = "ADA/USD"; Ticker = "ADA/USD"; Market = "CRYPTO"; Own = $false }
   ```
4. Commit and push the changes to your repository.

### How to Change the Schedule
To adjust how often the digest runs, modify the `cron` syntax under the `schedule` trigger:
1. Open `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `schedule` section:
   ```yaml
   schedule:
     - cron: '49 5 * * 0'
   ```
3. Update the cron expression to your desired schedule (current default is every Sunday at 05:49 UTC).

## Reference

### Triggers
| Trigger Type | Syntax / Details | Description |
| :--- | :--- | :--- |
| `workflow_dispatch` | N/A | Allows manual execution from the GitHub Actions UI. |
| `schedule` | `- cron: '49 5 * * 0'` | Runs automatically every Sunday at 05:49 UTC. |

### Secrets
| Secret Name | Description | Required |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | Bot authentication token provided by BotFather. | Yes |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where messages are sent. | Yes |
| `TWELVEDATA_KEY` | API key for fetching market data from Twelve Data. | Yes |

### Tickers / Instruments Table
| Name | Ticker | Market | Source | CoinId | Own Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | Twelve Data (Default) | N/A | `false` |
| BTC/USD | BTC/USD | CRYPTO | Twelve Data (Default) | N/A | `true` |
| ETH/USD | ETH/USD | CRYPTO | Twelve Data (Default) | N/A | `true` |
| HYPE/USD | HYPE/USD | CRYPTO | COINGECKO | `hyperliquid` | `true` |
| SOL/USD | SOL/USD | CRYPTO | Twelve Data (Default) | N/A | `false` |
| XRP/USD | XRP/USD | CRYPTO | Twelve Data (Default) | N/A | `true` |

### Output Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `Name` | String | Display name of the cryptocurrency asset. |
| `Flag` | String | Emoji indicator accompanying the asset (`💵`). |
| `Close` | Double | Latest fetched price rounded to 2 decimal places. |
| `WeekPct` | Double / Null | Percentage change from Monday open to the latest close. |
| `MonthPct` | Double / Null | Percentage change over a 30-day window. |
| `SixMoPct` | Double / Null | Percentage change over a 182-day window (Twelve Data only). |
| `YearPct` | Double / Null | Percentage change over a 365-day window (Twelve Data only). |
| `Own` | Boolean | Indicates whether the asset is part of the personal portfolio (`💼`). |
| `Error` | Boolean | Present and set to `true` if data retrieval fails. |
| `ErrorMsg` | String | Exception details if a data retrieval error occurs. |

### API / Data Sources
| Source Name | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/time_series` / `price` | Fetches historical candle data and real-time prices for standard crypto pairs. |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Fetches market chart data for tokens not adequately covered by Twelve Data (e.g., Hyperliquid). |
| Telegram Bot API | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Delivers the compiled HTML-formatted weekly report to the chat ID. |

## Explanation
The workflow is designed as a standalone PowerShell-driven GitHub Action to minimize dependencies on external third-party actions while ensuring high flexibility in processing financial time-series data. 

Key design decisions include:
- **PowerShell Execution (`pwsh`):** Using PowerShell across Linux runners provides robust data manipulation capabilities (`PSCustomObject`, LINQ-like filtering via `Where-Object` and `ForEach-Object`) which simplifies parsing multi-source API responses.
- **Multi-Source Fallback:** While Twelve Data serves as the primary provider, specific tokens (such as newly launched assets) use CoinGecko to prevent data availability gaps.
- **Rate-Limit Mitigations:** A 15-second artificial delay (`Start-Sleep`) is injected between Twelve Data requests to respect strict API rate limits on free or standard tiers.
- **Sorted Telegram Output:** Results are sorted descending by weekly performance (`WeekPct`) to highlight top gainers or losers at the very top of the digest message, enhanced with portfolio indicators (`💼`) for tracked assets.