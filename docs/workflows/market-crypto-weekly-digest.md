# Workflow documentation: market-crypto-weekly-digest
**Workflow file:** [.github/workflows/market-crypto-weekly-digest.yml](../../.github/workflows/market-crypto-weekly-digest.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `schedule` | Automatically executes every Sunday at 05:49 UTC (`49 5 * * 0`). |
| `workflow_dispatch` | Allows manual execution on demand via the GitHub Actions UI. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token provided by Telegram's BotFather, used to authenticate API requests. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the weekly crypto digest message will be delivered. |
| `TWELVEDATA_KEY` | API key for authenticating requests against the Twelve Data market data platform. |

### Tickers and Instruments
| Name | Ticker | Market | Own Status | Source | Coin ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `BNB/USD` | `BNB/USD` | `CRYPTO` | `False` | `TWELVEDATA` *(default)* | - |
| `BTC/USD` | `BTC/USD` | `CRYPTO` | `True` | `TWELVEDATA` *(default)* | - |
| `ETH/USD` | `ETH/USD` | `CRYPTO` | `False` | `TWELVEDATA` *(default)* | - |
| `HYPE/USD` | `HYPE/USD` | `CRYPTO` | `True` | `COINGECKO` | `hyperliquid` |
| `SOL/USD` | `SOL/USD` | `CRYPTO` | `False` | `TWELVEDATA` *(default)* | - |
| `XRP/USD` | `XRP/USD` | `CRYPTO` | `True` | `TWELVEDATA` *(default)* | - |

### Output Fields
| Field Name | Description |
| :--- | :--- |
| `Name` | Display name of the cryptocurrency pair. |
| `Flag` | Emoji icon representing the currency category (`💵`). |
| `Close` | Latest available market price rounded to 2 decimal places. |
| `WeekPct` | Percentage price change from the most recent Monday's open/price to the latest close. |
| `MonthPct` | Percentage price change over a 30-day lookback window. |
| `SixMoPct` | Percentage price change over a 182-day lookback window *(Twelve Data sources only)*. |
| `YearPct` | Percentage price change over a 365-day lookback window *(Twelve Data sources only)*. |
| `Own` | Boolean flag indicating portfolio ownership (`💼` icon added if true). |
| `Error` | Boolean flag indicating whether data fetching failed for the instrument. |
| `ErrorMsg` | Detailed error description if data retrieval failed. |

### API and Data Sources
| Source | Endpoint / Method | Purpose |
| :--- | :--- | :--- |
| **Twelve Data** | `https://api.twelvedata.com/time_series` | Retrieves historical daily open/close candles for calculating medium-to-long term performance metrics. |
| **Twelve Data** | `https://api.twelvedata.com/price` | Retrieves real-time latest price for spot calculations. |
| **CoinGecko** | `https://api.coingecko.com/api/v3/coins/{id}/market_chart` | Retrieves recent granular pricing history for alternative tokens (e.g., Hyperliquid) where Twelve Data is unsupported. |
| **Telegram Bot API** | `https://api.telegram.org/bot{token}/sendMessage` | Delivers the compiled Markdown-formatted digest to the configured Telegram chat. |

---

## How-to Guides

### Run the Digest Manually
1. Navigate to your repository on GitHub and click the **Actions** tab.
2. In the left-hand sidebar, select the **market-crypto-weekly-digest** workflow.
3. Click the **Run workflow** dropdown button on the right side.
4. Confirm the branch (typically `main`) and click **Run workflow** to trigger immediate execution.

### Add a New Crypto Instrument
1. Open the workflow file at `.github/workflows/market-crypto-weekly-digest.yml`.
2. Locate the `$Indices` array inside the PowerShell step:
   ```powershell
   $Indices = @(
       @{ Name = "BNB/USD";   Ticker = "BNB/USD";   Market = "CRYPTO"; Own = $false }
       ...
   )
   ```
3. Add a new hash table entry using the appropriate format:
   - For standard Twelve Data pairs:
     ```powershell
     @{ Name = "ADA/USD"; Ticker = "ADA/USD"; Market = "CRYPTO"; Own = $false }
     ```
   - For CoinGecko-backed pairs:
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "token-identifier" }
     ```
4. Commit the changes to your repository.

---

## Explanation

### Design Decisions and Architecture

- **Multi-Source Fallback Capability:** While Twelve Data serves as the primary financial data provider for major pairs, certain alternative or emerging assets require CoinGecko due to ticker availability. The workflow isolates fetching logic into distinct functions (`Get-CryptoWeeklyData` and `Get-CoinGeckoWeeklyData`) to seamlessly blend data from disparate API schemas into a unified reporting structure.
- **Rate-Limit Management:** A deliberate 15-second pause (`Start-Sleep -Seconds 15`) is introduced between iterations when querying Twelve Data. This mitigates HTTP 429 (Too Many Requests) errors imposed by free or standard tier rate limits.
- **Monday-Anchor Performance Metric:** The digest measures weekly performance (`WeekPct`) explicitly by referencing the opening price or earliest available tick of the current week's Monday against the latest real-time closing price. This offers a clean weekly return baseline independent of rolling 24-hour windows.
- **Robust Error Isolation:** The workflow wraps individual asset fetching loops in `try/catch` blocks. If a specific API call fails or times out, the error is logged as a workflow warning and rendered gracefully as an unavailable status item (`⚠️`) in the final Telegram report, preventing a single broken ticker from crashing the entire digest generation pipeline.
- **Scheduled Execution Timing:** Configured to run at 04:59 UTC on Sundays (`49 5 * * 0`), the workflow captures weekend and weekly closing conditions right before the start of the new global trading week.