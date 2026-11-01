# Workflow documentation: market-crypto-hourly-update
**Workflow file:** [.github/workflows/market-crypto-hourly-update.yml](../../.github/workflows/market-crypto-hourly-update.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `market-crypto-hourly-update` workflow fetches real-time cryptocurrency pricing and 24-hour percentage changes for a curated list of digital assets using TwelveData and CoinGecko APIs. It formats these metrics into a Telegram HTML message with status indicators and dispatches the update directly to a designated Telegram chat channel.

## Tutorials
This tutorial guides you through setting up and running your first cryptocurrency market update workflow manually.

### Step 1: Configure Repository Secrets
Before running the workflow, ensure your GitHub repository has the required API keys and messaging credentials stored securely. Go to your repository **Settings > Secrets and variables > Actions** and add the following secrets:
- `TELEGRAM_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TWELVEDATA_KEY`

### Step 2: Navigate to GitHub Actions
1. Open your repository on GitHub.
2. Click on the **Actions** tab at the top of the page.
3. In the left-hand sidebar, select the **market-crypto-hourly-update** workflow.

### Step 3: Trigger the Workflow Manually
1. Click the **Run workflow** dropdown button on the right side of the workflow page.
2. Select the appropriate branch (typically `main` or `master`) and click the green **Run workflow** button.

### Step 4: Verify Execution
1. Click on the newly triggered workflow run to view its live progress.
2. Expand the `send-update` job and observe the PowerShell script execution logs.
3. Check your Telegram chat to confirm that the formatted crypto update message has been successfully delivered.

## How-to guides
### How to add a new cryptocurrency ticker
1. Open `.github/workflows/market-crypto-hourly-update.yml` in your editor.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hashtable entry matching the required data structure:
   - For TwelveData assets: `@{ Name = "LTC/USD"; Ticker = "LTC/USD"; Market = "CRYPTO"; Own = $false }`
   - For CoinGecko assets: `@{ Name = "HYPE/USD"; Ticker = "HYPE/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "hyperliquid" }`
4. Commit and push your changes to the repository.

### How to configure external scheduling
Since the workflow relies on `workflow_dispatch`, you can trigger it on a schedule using an external web service like cron-job.org:
1. Generate a GitHub Personal Access Token (PAT) with `repo` or `workflow` scope.
2. Set up a scheduled HTTP POST request in cron-job.org targeting the GitHub Actions workflow dispatch API endpoint:
   `https://api.github.com/repos/{owner}/{repo}/actions/workflows/market-crypto-hourly-update.yml/dispatches`
3. Include the appropriate authorization headers and JSON payload (`{"ref": "main"}`).

## Reference

### Triggers
| Trigger Type | Description |
|---|---|
| `workflow_dispatch` | Triggered manually via the GitHub UI or externally via cron-job.org API requests. |

### Secrets
| Secret Name | Description |
|---|---|
| `TELEGRAM_TOKEN` | Telegram Bot API token used to authenticate message delivery. |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where updates are posted. |
| `TWELVEDATA_KEY` | API key for authenticating requests to TwelveData. |

### Tickers / Instruments
| Name | Ticker / CoinId | Market | Source | Portfolio Owned (`Own`) |
|---|---|---|---|---|
| BNB/USD | `BNB/USD` | CRYPTO | TwelveData | No (`$false`) |
| BTC/USD | `BTC/USD` | CRYPTO | TwelveData | Yes (`$true`) |
| ETH/USD | `ETH/USD` | CRYPTO | TwelveData | Yes (`$true`) |
| HYPE/USD | `hyperliquid` | CRYPTO | CoinGecko | Yes (`$true`) |
| SOL/USD | `SOL/USD` | CRYPTO | TwelveData | No (`$false`) |
| XRP/USD | `XRP/USD` | CRYPTO | TwelveData | Yes (`$true`) |

### Output Fields
| Field Name | Format | Description |
|---|---|---|
| `Current` | Rounded float (`0.00` or `0.0000`) | The latest fetched asset price in USD. |
| `DayPct` | Rounded percentage with sign and emoji | The 24-hour percentage price change (`🟢` for positive/zero, `🔴` for negative). |
| `Portfolio` | Emoji (`💼`) | Appended indicator showing whether the asset is part of the personal portfolio. |

### API / Data Sources
| Source Name | Base Endpoint | Authentication |
|---|---|---|
| TwelveData | `https://api.twelvedata.com/quote` | Query parameter `apikey` |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart/range` | None (Public API rate limits apply) |
| Telegram Bot API | `https://api.telegram.org/bot{token}/sendMessage` | URL path token |

## Explanation
The `market-crypto-hourly-update` workflow is designed with modularity, fault tolerance, and multi-source price aggregation in mind. 

### Design Decisions
- **PowerShell Runtime (`pwsh`)**: Running the workflow logic inside a PowerShell Core step allows for rich object manipulation, robust error handling with `try/catch` blocks, and clean script readability across operating systems.
- **Multi-Source Architecture**: While TwelveData provides reliable financial data for most traditional crypto pairs, niche or newly listed tokens (such as `HYPE/USD`) may require alternative aggregators like CoinGecko. The script handles this divergence dynamically using the `Source` property switch.
- **Graceful Error Isolation**: Network requests to external financial APIs are wrapped in individual `try/catch` blocks per asset. If a single provider fails or a rate limit is hit, the workflow logs the specific warning for that asset without aborting the entire batch update.
- **Timezone Awareness**: Timestamps generated within the payload use the `Europe/Stockholm` timezone to ensure consistent local reporting times regardless of GitHub Runner UTC defaults.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Market Crypto Hourly Update Flow
    accDescr: Visualizes the trigger, data retrieval, formatting, and Telegram dispatch flow of the workflow.

    A([Workflow Dispatch Trigger]) --> B[Initialize PowerShell Environment]
    B --> C[Loop Through Configured Crypto Assets]
    C --> D{Source Type?}
    D -- TwelveData --> E[Fetch Quote via TwelveData API]
    D -- CoinGecko --> F[Fetch Price Range via CoinGecko API]
    E --> G[Calculate Price and Day Percentage]
    F --> G[Calculate Price and Day Percentage]
    G --> H{Request Successful?}
    H -- Yes --> I[Format Asset Line with Emoji & Status]
    H -- No --> J[Catch Error & Append Unavailable Warning]
    I --> K{More Assets?}
    J --> K
    K -- Yes --> C
    K -- No --> L[Construct Telegram HTML Payload]
    L --> M[Send HTTP POST to Telegram Bot API]
    M --> N([Workflow Complete])