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
| HYPE/USD | HYPE/USD | CRYPTO | `true` | `COINGECKO` | `hyperliquid` |
| SOL/USD | SOL/USD | CRYPTO | `true` (Wait: `false` in code) | Twelve Data (default) | — |
| XRP/USD | XRP/USD | CRYpto | `true` | Twelve Data (default) | — |

*(Note: SOL/USD `Own` is set to `$false` in the underlying workflow array).*

### Output Fields
| Field | Description |
| :--- | :--- |
| `Name` | The display name / ticker symbol of the crypto asset. |
| `Flag` | Emoji indicator representing the market type (💵 for CRYPTO). |
| `Close` | Rounded closing price of the asset for the previous day. |
| `DayPct` | Calculated percentage change compared to the day before, formatted with 🟢/🔴 indicators. |
| `Date` | The calendar date of the evaluated previous day (YYYY-MM-DD). |
| `Own` | Boolean flag indicating whether the asset is held in the portfolio (marked with 💼). |
| `Error` | Boolean flag set to `true` if data retrieval fails, rendering the asset as unavailable ⚠️. |

### API / Data Sources
| Provider | Endpoint | Purpose |
| :--- | :--- | :--- |
| Twelve Data | `https://api.twelvedata.com/time_series` | Fetches daily historical time series data for standard crypto pairs. |
| CoinGecko | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Fetches historical price points for assets requiring alternative sources (e.g., HYPE/USD). |
| Telegram Bot API | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the compiled daily performance digest to the specified chat ID. |

---

## How-to guides

### How to trigger the workflow manually
1. Navigate to your repository on GitHub and click on the **Actions** tab.
2. Select the **market-crypto-1d-update** workflow from the sidebar list.
3. Click the **Run workflow** dropdown button on the right side.
4. Confirm by clicking the green **Run workflow** button.

### How to add a new crypto asset to the daily report
1. Open the workflow file at `.github/workflows/market-crypto-1d-update.yml`.
2. Locate the `$Indices` PowerShell array within the `send-info` job steps.
3. Add a new hashtable entry following the appropriate schema:
   - For Twelve Data sources:
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $false }
     ```
   - For CoinGecko sources:
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "coingecko-id" }
     ```
4. Commit your changes to the repository.

---

## Explanation

### Design decisions
- **External Cron Scheduling:** The workflow relies exclusively on the `workflow_dispatch` trigger, allowing an external scheduling service (such as cron-job.org) to invoke the update on demand without depending strictly on GitHub Actions' internal cron latency.
- **PowerShell Runtime:** PowerShell (`pwsh`) is chosen as the execution shell across all steps on the `ubuntu-latest` runner, enabling robust data manipulation, hashtable iteration, and error handling through standard .NET methods and custom functions (`Get-CryptoData`, `Get-CoinGeckoData`).
- **Multi-Source Fallback Strategy:** While Twelve Data serves as the primary provider for standard cryptocurrency pairs, a secondary provider branch (`CoinGecko`) is integrated to seamlessly support alternative assets (like Hyperliquid's HYPE/USD) whose data availability requires specialized identifiers.
- **Graceful Error Handling:** Individual asset lookups are wrapped in `try/catch` blocks. If an API call fails or returns insufficient points, the workflow flags the asset as unavailable rather than failing the entire pipeline, ensuring the rest of the daily report is still delivered.
- **Descending Percentage Sort:** Assets are automatically sorted by their daily percentage change (`DayPct`) in descending order, immediately highlighting top performers and market losers at the top of the Telegram notification.