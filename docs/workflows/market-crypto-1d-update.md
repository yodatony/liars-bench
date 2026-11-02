# Workflow documentation: market-crypto-1d-update
**Workflow file:** [.github/workflows/market-crypto-1d-update.yml](../../.github/workflows/market-crypto-1d-update.yml)

**Last reviewed date:** 2026-11-02

## Intro
The `market-crypto-1d-update` workflow fetches daily closing prices and percentage changes for a curated list of cryptocurrency assets from external APIs and distributes a formatted summary via Telegram. It runs on an external schedule to ensure stakeholders receive consistent, automated daily performance tracking without manual intervention.

## Tutorials

### Getting Started with the Crypto Daily Update Workflow

This tutorial guides you through setting up and running your first crypto daily update workflow manually to verify that your secrets and API integrations are configured correctly.

#### Prerequisites
- A GitHub repository with the `market-crypto-1d-update.yml` workflow file added to `.github/workflows/`.
- Active API keys for Twelve Data and CoinGecko (where applicable).
- A Telegram Bot Token and Chat ID for receiving notifications.

#### Step 1: Configure Repository Secrets
Before executing the workflow, you must provide the necessary credentials as GitHub Actions secrets.
1. Navigate to your GitHub repository and click **Settings**.
2. In the left sidebar, expand **Secrets and variables** and select **Actions**.
3. Click **New repository secret** and add the following three secrets:
   - `TELEGRAM_TOKEN`: Your Telegram bot API token.
   - `TELEGRAM_CHAT_ID`: The target chat or channel ID for notifications.
   - `TWELVEDATA_KEY`: Your Twelve Data API key.

#### Step 2: Trigger the Workflow Manually
Because the workflow uses `workflow_dispatch` to receive external cron triggers, you can easily test it directly from the GitHub UI:
1. Go to your repository and click the **Actions** tab.
2. Select the **market-crypto-1d-update** workflow from the left navigation list.
3. Click the **Run workflow** dropdown button on the right side.
4. Confirm by clicking the green **Run workflow** button.

#### Step 3: Verify Output
1. Click on the newly triggered workflow run to view its live execution logs.
2. Confirm that the PowerShell step executes successfully and prints `Crypto daily update sent.` at the completion.
3. Check your Telegram chat to view the formatted daily review message containing asset prices and portfolio markers.

---

## How-to Guides

### How to Add a New Cryptocurrency Ticker
To track an additional cryptocurrency asset in your daily update:
1. Open `.github/workflows/market-crypto-1d-update.yml` in your editor.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hashtable entry for your asset using either Twelve Data or CoinGecko as the data source:
   - **Twelve Data source example:**
     ```powershell
     @{ Name = "ADA/USD"; Ticker = "ADA/USD"; Market = "CRYPTO"; Own = $false }
     ```
   - **CoinGecko source example:**
     ```powershell
     @{ Name = "HYPE/USD"; Ticker = "HYPE/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "hyperliquid" }
     ```
4. Commit and push your changes to the repository.

### How to Mark an Asset as Owned in Your Portfolio
To toggle the portfolio ownership badge (`💼`) for an existing asset:
1. Open `.github/workflows/market-crypto-1d-update.yml`.
2. Find the target cryptocurrency object within the `$Indices` array.
3. Change the `Own` property value from `$false` to `$true` (or vice versa):
   ```powershell
   @{ Name = "BTC/USD"; Ticker = "BTC/USD"; Market = "CRYPTO"; Own = $true }
   ```
4. Save, commit, and push the workflow file.

---

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on a schedule via cron-job.org or manually via the GitHub Actions interface. |

### Secrets
| Secret Name | Description | Required |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | API token for your Telegram bot to authenticate message dispatch. | Yes |
| `TELEGRAM_CHAT_ID` | Target Telegram chat or channel ID where the update message is sent. | Yes |
| `TWELVEDATA_KEY` | API authentication key for fetching financial time-series data from Twelve Data. | Yes |

### Tickers / Instruments Table
| Name | Ticker | Market | Source | CoinId | Own Portfolio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | Twelve Data (Default) | — | No (`$false`) |
| BTC/USD | BTC/USD | CRYPTO | Twelve Data (Default) | — | Yes (`$true`) |
| ETH/USD | ETH/USD | CRYPTO | Twelve Data (Default) | — | Yes (`$true`) |
| HYPE/USD | HYPE/USD | CRYPTO | COINGECKO | `hyperliquid` | Yes (`$true`) |
| SOL/USD | SOL/USD | CRYPTO | Twelve Data (Default) | — | No (`$false`) |
| XRP/USD | XRP/USD | CRYPTO | Twelve Data (Default) | — | Yes (`$true`) |

### Output Fields (Telegram Message)
| Field / Component | Description |
| :--- | :--- |
| **Header** | Static title indicating `CRYPTO — Daily review 📈` with UTC movement date context. |
| **Asset Flag & Name** | Currency symbol (`💵`) paired with the asset trading name (e.g., `BTC/USD`). |
| **Close Price** | Rounded closing price for the previous day. |
| **Day Pct (DayPct)** | Calculated percentage change from the prior day, decorated with color indicators (`🟢` / `🔴`). |
| **Portfolio Indicator** | Optional badge (`💼`) appended if `Own` is set to `$true`. |
| **Error State** | Displays `— unavailable ⚠️` if data fetching encounters an exception for that specific ticker. |

### API / Data Sources
| Source Name | Endpoint / Protocol | Purpose |
| :--- | :--- | :--- |
| **Twelve Data API** | `https://api.twelvedata.com/time_series` | Retrieves daily historical closing prices for standard crypto pairs. |
| **CoinGecko API** | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Retrieves granular market pricing history for tokens not natively supported or indexed properly via Twelve Data. |
| **Telegram Bot API** | `https://api.telegram.org/bot{token}/sendMessage` | Dispatches the formatted HTML payload to the designated chat ID. |

---

## Explanation

### Design Decisions and Reasoning

The `market-crypto-1d-update` workflow is designed around simplicity, resilience, and containerized execution using PowerShell (`pwsh`) on an `ubuntu-latest` runner. 

#### PowerShell Execution Environment
PowerShell is chosen as the universal scripting language across platforms because it offers robust error handling (`try/catch` blocks), native handling of JSON payloads (`ConvertTo-Json`), and straightforward hashtable syntax (`[PSCustomObject]`). This makes processing multi-source API responses clear and maintainable.

#### Multi-Source Data Strategy
While Twelve Data provides reliable daily intervals for most major cryptocurrencies, certain assets require alternative providers like CoinGecko due to ticker availability or data structure discrepancies. The workflow handles this by supporting an optional `Source` property (`COINGECKO`) that routes specific assets through a custom extraction function capable of parsing UNIX timestamp price arrays into midnight-aligned daily closes.

#### Fault Isolation via Iterative Try/Catch
Rather than failing the entire workflow run if a single API request times out or returns an error, the execution wraps each ticker lookup in an isolated `try/catch` block. If an asset fails, its error state is recorded gracefully, allowing the remaining assets to be processed, sorted, and delivered to Telegram with an unavailability warning (`⚠️`).

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Workflow Execution Flow
    accDescr: Visualizes the sequence from workflow dispatch to fetching multi-source crypto data, sorting results, and posting the update to Telegram.

    A[Workflow Dispatch] --> B[Initialize PowerShell Environment]
    B --> C[Loop Through Indices Array]
    C --> D{Source == COINGECKO?}
    D -- Yes --> E[Fetch Data from CoinGecko API]
    D -- No --> F[Fetch Data from Twelve Data API]
    E --> G{Request Successful?}
    F --> G{Request Successful?}
    G -- Yes --> H[Parse & Calculate DayPct]
    G -- No --> I[Mark Asset as Error]
    H --> J[Sort Results by DayPct Descending]
    I --> J
    J --> K[Construct HTML Telegram Payload]
    K --> L[Send Message via Telegram API]