# Market US 1D Update Workflow Documentation

**Last reviewed date:** 2026-04-21

## Reference

### Triggers
| Trigger | Description |
|---|---|
| `workflow_dispatch` | Allows manual triggering of the workflow. |
| `schedule` | Runs automatically at 04:56 UTC, Tuesday to Saturday. |

### Secrets
| Secret | Description |
|---|---|
| `TELEGRAM_TOKEN` | Your Telegram Bot API token. |
| `TELEGRAM_CHAT_ID` | The chat ID where updates will be sent. |
| `TWELVEDATA_KEY` | API key for Twelve Data service. |

### Tickers/Instruments Table
| Name                    | Ticker | Market | Own  |
|-------------------------|--------|--------|------|
| NVIDIA                  | NVDA   | US     | false|
| Apple                   | AAPL   | US     | false|
| Microsoft               | MSFT   | US     | true |
| Amazon                  | AMZN   | US     | false|
| Google A                | GOOGL  | US     | false|
| Tesla                   | TSLA   | US     | false|
| S&P 500 (ETF)          | SPY    | US     | false|
| DJI (ETF)              | DIA    | US     | false|

### Output Fields
| Field | Description |
|---|---|
| `Name` | The name of the stock or ETF. |
| `Flag` | Market flag emoji. |
| `Close` | Closing price of the stock. |
| `DayPct` | Percentage change for the day. |
| `Date` | Date of the data reported. |
| `Own` | Indicates whether the stock or ETF is owned. |
| `Error` | Indicates if there was an error fetching data. |

### API/Data Sources
- Twelve Data API for stock quotes: `https://api.twelvedata.com/quote?symbol=<ticker>&apikey=<your_key>`.
- Telegram Bot API for sending messages: `https://api.telegram.org/bot<your_token>/sendMessage`.

## How-to Guides

### Manually Trigger the Workflow
1. Navigate to the Actions tab of your GitHub repository.
2. Select `market-us-1d-update` from the list of workflows.
3. Click on the "Run workflow" button.

### Troubleshooting Errors in Data Fetching
1. Check the logs for the specific stock or ETF that failed to fetch data.
2. Validate your `TWELVEDATA_KEY` in the secrets.
3. Ensure that the ticker symbol used is valid and currently trading.

## Explanation

### Design Decisions and Reasoning
The workflow is designed to fetch and report daily updates of specific US stocks and ETFs. The triggers allow both manual execution and scheduled execution on weekdays for regular updates. 

The integration with Telegram provides immediate delivery of updates in a user-friendly format, which is crucial for timely market information. The use of Twelve Data API is chosen for its reliable data and ease of access via API key, ensuring that the workflow can quickly retrieve necessary market data for the listed instruments.

We have included error handling to gracefully log failures when data retrieval is unsuccessful, ensuring that the workflow continues running smoothly even if a single call fails. The choice of emojis in the output aims to enhance readability and engagement in Telegram messages.