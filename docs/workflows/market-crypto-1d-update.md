# Workflow documentation: market-crypto-1d-update
**Workflow file:** [.github/workflows/market-crypto-1d-update.yml](../../.github/workflows/market-crypto-1d-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token used to authenticate with the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the daily crypto update message is sent. |
| `TWELVEDATA_KEY` | API key required to fetch time series data from Twelve Data. |

### Tickers / Instruments
| Name | Ticker | Market | Own | Source | CoinId |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | `false` | Twelve Data (default) | — |
| BTC/USD | BTC/USD | CRYPTO | `true` | Twelve Data (default) | — |
| ETH/USD | ETH/USD | CRYPTO | `true` | Twelve Data (default) | — |
| HYPE/USD | HYPE/USD | CRYPTO | `true` | COINGECKO | `hyperliquid` |
| SOL/USD | SOL/USD | CRYPTO | `false` | Twelve Data (default) | — |
| XRP/USD | XRP/USD | CRYPTO | `true` | Twelve Data (default) | — |

### API / Data Sources
| Provider | Base Endpoint | Purpose |
| :--- | :--- | :--- |
| **Twelve Data** | `https://api.twelvedata.com/time_series` | Retrieves daily historical closing prices for standard crypto pairs. |
| **CoinGecko** | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Retrieves hourly/daily historical price points for assets requiring custom data tracking (e.g., Hyperliquid). |
| **Telegram Bot API** | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the formatted HTML summary payload to the designated chat ID. |

### Output Fields
| Field Name | Description |
| :--- | :--- |
| `Name` | The display name/symbol of the instrument. |
| `Flag` | Emoji indicator representing the market category (`💵` for crypto). |
| `Close` | The rounded closing price for the previous completed day. |
| `DayPct` | Percentage price change compared to the day prior, rounded to 2 decimal places. |
| `Date` | The calendar date of the evaluated closing price (`YYYY-MM-DD`). |
| `Own` | Boolean flag indicating portfolio ownership, represented by a briefcase emoji (`💼`) in the message. |
| `Error` | Boolean flag indicating whether data retrieval failed, resulting in an unavailable status message. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to the **Actions** tab in your GitHub repository.
2. Select the **market-crypto-1d-update** workflow from the sidebar.
3. Click the **Run workflow** dropdown button.
4. Confirm by clicking **Run workflow**. (Note: This workflow is typically driven externally via cron-job.org using workflow dispatch).

### How to add a new crypto instrument
1. Open the workflow file at `.github/workflows/market-crypto-1d-update.yml`.
2. Locate the `$Indices` array inside the PowerShell script block.
3. Add a new hash table entry representing the asset. 
   - For standard Twelve Data assets:
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $false }
     ```
   - For CoinGecko-backed assets:
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "coingecko-id" }
     ```
4. Commit and push your changes to the repository.

---

## Explanation

### Design Decisions

- **External Scheduling via `workflow_dispatch`**: The workflow relies exclusively on an external scheduler (cron-job.org) triggering the `workflow_dispatch` event rather than GitHub Actions' built-in cron syntax. This avoids standard GitHub Actions schedule delays and queuing issues during peak hours.
- **PowerShell as a Universal Scripting Engine**: PowerShell (`pwsh`) is used across the runner steps to handle data fetching, parsing, sorting, and formatting. This ensures consistent execution behavior across different runner environments and simplifies complex JSON and math manipulations.
- **Multi-Source Fallback Strategy**: While Twelve Data serves as the primary provider for standard currency pairs, a secondary source handler (`Get-CoinGeckoData`) is integrated to support tokens that may lack sufficient liquidity or history on traditional feeds (such as `HYPE/USD`).
- **Resilient Error Handling**: Individual data fetch operations are wrapped in `try/catch` blocks. If an API request fails or returns insufficient data for a specific ticker, the workflow marks that asset as unavailable rather than failing the entire job execution, ensuring partial reports are still successfully delivered to Telegram.
- **Performance-based Sorting**: Assets are automatically sorted in descending order by their daily percentage change (`DayPct`), highlighting top performers and market losers dynamically at the top of the Telegram notification.