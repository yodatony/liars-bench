# Workflow documentation: market-stock-1d-update
**Workflow file:** [.github/workflows/market-stock-1d-update.yml](../../.github/workflows/market-stock-1d-update.yml)

**Last reviewed date:** 2026-11-01

## Intro
The `market-stock-1d-update` workflow automates the retrieval of daily stock market data for a curated list of international equities across Swedish, Danish, and US markets. It computes daily percentage changes, formats the results into a clean HTML summary, and dispatches the digest directly to a configured Telegram chat.

## Tutorials

### Getting Started with the Market Stock Daily Update Workflow
This tutorial walks a first-time user through setting up, configuring, and executing the `market-stock-1d-update` workflow to deliver automated daily stock summaries to Telegram.

#### Step 1: Configure Repository Secrets
Before the workflow can fetch financial data or send messages, you must provide API keys and Telegram credentials. Navigate to your GitHub repository settings:
1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following four secrets:
   - `TELEGRAM_TOKEN`: Your Telegram Bot API token obtained via BotFather.
   - `TELEGRAM_CHAT_ID`: The target Telegram channel or chat ID where updates will be posted.
   - `EODHD_KEY`: API key for EOD Historical Data (used for Swedish and Danish markets).
   - `TWELVEDATA_KEY`: API key for Twelve Data (used for US markets).

#### Step 2: Review the Ticker List
The workflow evaluates a predefined list of stock indices and equities within the PowerShell execution block. You can inspect or modify this array inside [.github/workflows/market-stock-1d-update.yml](../../.github/workflows/market-stock-1d-update.yml) to add or remove instruments based on your portfolio preferences (`Own = $true` or `$false`).

#### Step 3: Trigger the Workflow Manually
Because the workflow uses `workflow_dispatch`, it is designed to be triggered externally on a schedule (for example, via cron-job.org) or manually:
1. Navigate to the **Actions** tab in your GitHub repository.
2. Select the **market-stock-1d-update** workflow from the left sidebar.
3. Click **Run workflow** and confirm the branch.

#### Step 4: Verify the Results
Once the workflow run completes successfully:
1. Check the GitHub Actions run logs to verify that `Stock daily update sent.` is printed.
2. Open your Telegram chat to confirm receipt of the formatted HTML stock summary message containing latest closing prices, daily percentage change indicators (🟢/🔴), and portfolio markers (💼).

---

## How-to guides

### How to Add a New Stock Ticker
To track an additional stock or equity in your daily update:
1. Open [.github/workflows/market-stock-1d-update.yml](../../.github/workflows/market-stock-1d-update.yml).
2. Locate the `$Indices` PowerShell array inside the `send-info` job.
3. Add a new hash table entry matching the required properties:
   ```powershell
   @{ Name = "NEW"; Ticker = "NEW.ST"; Market = "SE"; Own = $true }
   ```
4. Commit and push the changes to your repository.

### How to Trigger the Workflow via External Cron Service
To automate daily executions using an external service like cron-job.org:
1. Generate a GitHub Personal Access Token (PAT) with `repo` or `workflow` scope.
2. Configure an HTTP POST request in your external cron scheduler targeting the GitHub REST API workflow dispatch endpoint:
   `https://api.github.com/repos/{owner}/{repo}/actions/workflows/market-stock-1d-update.yml/dispatches`
3. Include appropriate headers (`Authorization: Bearer <PAT>`, `Accept: application/vnd.github+json`) and a JSON body specifying the target ref: `{"ref": "main"}`.

---

## Reference

### Triggers
| Trigger Type | Description |
| :--- | :--- |
| `workflow_dispatch` | Triggered externally via API (e.g., cron-job.org scheduler). |

### Secrets
| Secret Name | Description | Required |
| :--- | :--- | :--- |
| `TELEGRAM_TOKEN` | Telegram bot access token for authentication. | Yes |
| `TELEGRAM_CHAT_ID` | Recipient chat or channel identifier. | Yes |
| `EODHD_KEY` | API authentication key for EODHD. | Yes |
| `TWELVEDATA_KEY` | API authentication key for Twelve Data. | Yes |

### Tickers and Instruments Table
| Name | Ticker | Market | Portfolio Ownership (`Own`) | Data Source |
| :--- | :--- | :--- | :--- | :--- |
| ATCO B | `ATCO-B.ST` | SE | `true` (💼) | EODHD |
| LATO B | `LATO-B.ST` | SE | `false` | EODHD |
| INVE B | `INVE-B.ST` | SE | `true` (💼) | EODHD |
| VOLV B | `VOLV-B.ST` | SE | `false` | EODHD |
| SAAB B | `SAAB-B.ST` | SE | `false` | EODHD |
| SWED A | `SWED-A.ST` | SE | `false` | EODHD |
| SHB A | `SHB-A.ST` | SE | `false` | EODHD |
| SEB A | `SEB-A.ST` | SE | `true` (💼) | EODHD |
| EVO | `EVO.ST` | SE | `true` (💼) | EODHD |
| Novo B | `NOVO-B.CO` | DK | `true` (💼) | EODHD |
| AVGO | `AVGO` | US | `true` (💼) | Twelve Data |
| AAPL | `AAPL` | US | `false` | Twelve Data |
| MSFT | `MSFT` | US | `true` (💼) | Twelve Data |
| AMZN | `AMZN` | US | `false` | Twelve Data |
| GOOGL | `GOOGL` | US | `false` | Twelve Data |
| TSLA | `TSLA` | US | `true` (💼) | Twelve Data |
| NOW | `NOW` | US | `true` (💼) | Twelve Data |

### Output Fields
| Field / Variable | Type | Description |
| :--- | :--- | :--- |
| `Close` | Double | Rounded closing price for the target trading day. |
| `DayPct` | Double / Null | Percentage change compared to the previous trading session. |
| `Date` | String (`yyyy-MM-dd`) | Date corresponding to the retrieved market data entry. |
| `Error` | Boolean | Set to `true` if data retrieval or parsing fails. |

### API / Data Sources
| Provider | Base URL / Endpoint | Purpose |
| :--- | :--- | :--- |
| EOD Historical Data | `https://eodhd.com/api/eod/` | Fetches historical end-of-day pricing for Nordic markets (SE, DK). |
| Twelve Data | `https://api.twelvedata.com/quote` | Fetches real-time / quote data for US equities. |
| Telegram Bot API | `https://api.telegram.org/bot<TOKEN>/sendMessage` | Delivers formatted HTML notification messages. |

---

## Explanation

### Design Decisions and Rationale

The `market-stock-1d-update` workflow is architected around reliability, modular data sourcing, and clean presentation. Key design considerations include:

1. **Multi-Provider Strategy**: Nordic stocks (Sweden and Denmark) rely on EOD Historical Data for accurate regional closing prices, whereas US equities utilize Twelve Data for efficient quote retrieval. This separation ensures optimal data accuracy across different global exchanges.
2. **Robust Error Handling**: Individual ticker requests are wrapped in `try/catch` blocks. If an API call fails or returns insufficient data, the workflow flags the error rather than failing the entire run, ensuring that partial updates are still successfully dispatched.
3. **Date Filtering**: Results are explicitly filtered against the previous trading day (`$YesterdayDate`) to guarantee that weekend or holiday execution timing issues do not skew the reported daily movement figures.
4. **HTML Telegram Formatting**: Telegram messages utilize HTML parse mode (`parse_mode = "HTML"`) combined with intuitive visual indicators (flags 🇸🇪/🇩🇰/🇺🇸, trend emojis 🟢/🔴, and portfolio briefcases 💼) for high readability at a glance.

```mermaid
%%{init: {'theme':'default'}}%%
flowchart LR
    accTitle: Workflow Execution Flow
    accDescr: Visualizes the trigger, data retrieval, filtering, and Telegram dispatch steps of the market-stock-1d-update workflow.

    Start([Workflow Dispatch]) --> Init[Initialize PowerShell Environment]
    Init --> Fetch[Iterate Tickers & Fetch Data<br/><i>EODHD / Twelve Data</i>]
    Fetch --> Filter[Filter by Previous Trading Day<br/>& Sort by DayPct]
    Filter --> Format[Format HTML Telegram Message]
    Format --> Send[Send HTTP POST to Telegram API]
    Send --> End([Workflow Complete])