# Workflow documentation: market-crypto-hourly-update
**Workflow file:** [.github/workflows/market-crypto-hourly-update.yml](../../.github/workflows/market-crypto-hourly-update.yml)
**Last reviewed date:** 2026-10-02

## Reference

### Triggers
| Trigger | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally on schedule via cron-job.org. |

### Secrets
| Secret Name | Description |
| :--- | :--- |
| `TELEGRAM_TOKEN` | Bot token used to authenticate against the Telegram Bot API. |
| `TELEGRAM_CHAT_ID` | Target chat or channel ID where the formatted Telegram update is sent. |
| `TWELVEDATA_KEY` | API key required to authenticate requests to the Twelve Data REST API. |

### Tickers / Instruments
| Name | Ticker | Market | Own | Source | Coin ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BNB/USD | BNB/USD | CRYPTO | `false` | Twelve Data (Default) | — |
| BTC/USD | BTC/USD | CRYPTO | `true` | Twelve Data (Default) | — |
| ETH/USD | ETH/USD | CRYPTO | `true` | Twelve Data (Default) | — |
| HYPE/USD | HYPE/USD | CRYPTO | `true` | COINGECKO | `hyperliquid` |
| SOL/USD | SOL/USD | CRYPTO | `true` | Twelve Data (Default) | — |
| XRP/USD | XRP/USD | CRYPTO | `true` | Twelve Data (Default) | — |

*(Note: The exact configuration for individual instruments is defined directly within the PowerShell array in the workflow file.)*

### Output Fields
| Field | Description |
| :--- | :--- |
| `Current` | Rounded current price of the cryptocurrency instrument. |
| `DayPct` | Calculated 24-hour percentage change in price, formatted with trend emojis (🟢/🔴). |

### API / Data Sources
| Source | Endpoint / Method | Purpose |
| :--- | :--- | :--- |
| Twelve Data API | `https://api.twelvedata.com/quote?symbol={Ticker}&apikey={Key}` | Fetches real-time quote and daily percentage change data for standard crypto pairs. |
| CoinGecko API | `https://api.coingecko.com/api/v3/coins/{CoinId}/market_chart/range?vs_currency=usd&from={Unix}&to={Unix}` | Fetches historical price ranges to calculate intraday open and current prices for tokens not reliably indexed by Twelve Data. |
| Telegram Bot API | `https://api.telegram.org/bot{Token}/sendMessage` | Delivers the formatted HTML summary payload to the specified chat ID. |

---

## How-to guides

### How to manually trigger the workflow
1. Navigate to your GitHub repository in your web browser.
2. Click on the **Actions** tab.
3. In the left-hand sidebar, select the **market-crypto-hourly-update** workflow.
4. Click the **Run workflow** dropdown button on the right side.
5. Confirm the branch (typically `main`) and click **Run workflow**.

### How to add a new cryptocurrency ticker
1. Open the workflow file at `.github/workflows/market-crypto-hourly-update.yml`.
2. Locate the `$Indices` PowerShell array inside the `send-update` job step.
3. Add a new hashtable entry following the appropriate schema:
   - **For Twelve Data sources:**
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $false }
     ```
   - **For CoinGecko sources:**
     ```powershell
     @{ Name = "NEW/USD"; Ticker = "NEW/USD"; Market = "CRYPTO"; Own = $true; Source = "COINGECKO"; CoinId = "coingecko-id" }
     ```
4. Save the file and commit the changes to your repository.

---

## Explanation

### Design decisions and reasoning

#### PowerShell as a universal scripting layer
The workflow executes entirely within a single PowerShell (`pwsh`) runner step. This choice avoids the overhead of maintaining external script files or managing dedicated container images. PowerShell natively handles web requests (`Invoke-RestMethod`), JSON serialization (`ConvertTo-Json`), and robust string formatting, making it ideal for self-contained CI/CD automation tasks.

#### Hybrid data source strategy (Twelve Data & CoinGecko)
While Twelve Data provides reliable pricing feeds for major crypto pairs, some newer or specialized tokens lack sufficient intraday depth or availability on traditional financial APIs. By implementing a fallback/routing mechanism based on the `Source` property, the workflow can query CoinGecko's historical range endpoints when necessary. This ensures consistent report generation even if a specific asset isn't supported by the primary ticker provider.

#### Timezone handling for localized timestamps
Cryptocurrency markets trade 24/7, but reporting schedules are best reviewed in local contexts. The script explicitly establishes the `Europe/Stockholm` timezone (`[System.TimeZoneInfo]::FindSystemTimeZoneById`) to convert UTC timestamps into local time before injecting them into the Telegram header. This provides clarity to recipients regarding exactly when the intraday market snapshot was captured.

#### Resilient error handling per instrument
Instead of letting a single failed API request crash the entire workflow, the script wraps each instrument fetch in a `try/catch` block. If an individual API call fails or times out, the workflow logs the specific exception and gracefully flags that asset as `unavailable ⚠️` in the final Telegram message. This ensures that a transient third-party outage for one asset does not suppress updates for the rest of the portfolio.