# market-se-1d-update Workflow

**Last reviewed date:** 2026-04-21

## Reference

### Triggers
| Trigger            | Description                                             |
|--------------------|---------------------------------------------------------|
| workflow_dispatch   | Manually trigger the workflow.                          |
| schedule           | Automatically run the workflow based on the cron schedule ('51 4 * * 2-6'). |

### Secrets
| Secret              | Description                        |
|---------------------|------------------------------------|
| TELEGRAM_TOKEN      | Token for authenticating with the Telegram Bot API. |
| TELEGRAM_CHAT_ID    | Chat ID for sending messages to Telegram. |
| EODHD_KEY           | API key for accessing EODHD service. |

### Tickers/Instruments Table
| Name              | Ticker         | Market | Own  |
|-------------------|----------------|--------|------|
| OMXSPI            | OMXSPI.INDX    | SE     | No   |
| OMXS30            | OMXS30.INDX    | SE     | No   |
| Atlas Copco B     | ATCO-B.ST      | SE     | Yes  |
| Investor B        | INVE-B.ST      | SE     | Yes  |
| Volvo B           | VOLV-B.ST      | SE     | No   |
| SAAB B            | SAAB-B.ST      | SE     | No   |
| Swedbank A        | SWED-A.ST      | SE     | No   |
| Handelsbanken A   | SHB-A.ST       | SE     | No   |
| SBB Norden B      | SBB-B.ST       | SE     | No   |
| SSAB B            | SSAB-B.ST      | SE     | No   |
| Novo Nordisk B    | NOVO-B.CO      | DK     | Yes  |

### Output Fields
| Field   | Description                                     |
|---------|-------------------------------------------------|
| Name    | Name of the stock or index.                     |
| Flag    | Country flag representing the market.           |
| Close   | Closing price of the stock or index on the previous trading day. |
| DayPct  | Percentage change from the previous closing price. |
| Date    | Date of the closing price.                       |
| Error   | Indicates whether there was an error fetching data. | 

### API/Data Sources
- Data for stocks is retrieved from the EODHD API using the endpoint: `https://eodhd.com/api/eod/{Ticker}?api_token={EODHD_KEY}&fmt=json&order=d&limit=3`.
- Messages are sent to Telegram using the Telegram Bot API: `https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage`.

## How-to Guides

### Sending a Daily Update
1. Trigger the workflow manually via GitHub Actions or wait for the scheduled time (4:51 AM UTC Tuesday to Saturday).
2. The workflow fetches the necessary data for the defined indices/tickers.
3. The data is processed, and a summary message is formatted.
4. The message is sent to the specified Telegram chat.

## Explanation

The design of this workflow automates the process of sending daily updates for selected stocks and indices primarily listed in Sweden and Denmark. The workflow fetches the previous day's closing prices and calculates the daily percentage change in price. The update is sent via Telegram for easy access and visibility.

Triggers are set to allow flexibility in execution (manual and scheduled), while the use of secrets ensures that sensitive information, such as API tokens, remains secure. The table structure for tickers facilitates easy maintenance and updates to the instruments being tracked without altering the core logic of the workflow. 

Error handling is included to account for any issues when retrieving data, ensuring that a clear and informative message is returned if data is unavailable. The workflow is powered by PowerShell, leveraging its capabilities to make HTTP requests and handle date and time operations efficiently.
