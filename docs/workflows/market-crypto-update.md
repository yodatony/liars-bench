# market-crypto-update Workflow Documentation

_Last reviewed: 2026-04-21_

## Reference

### Triggers
- **workflow_dispatch**: Triggered externally on schedule via cron-job.org.

### Secrets
| Secret Name        | Description                     |
|--------------------|---------------------------------|
| TELEGRAM_TOKEN     | Token for Telegram Bot          |
| TELEGRAM_CHAT_ID   | Chat ID for sending messages    |
| TWELVEDATA_KEY     | API key for TwelveData service  |

### Tickers/Instruments Table
| Name       | Ticker   | Market | Own  |
|------------|----------|--------|------|
| Bitcoin    | BTC/USD  | CRYPTO | true |

### Output Fields
| Field      | Description                               |
|------------|-------------------------------------------|
| Current    | Current price of the asset                |
| DayPct     | Percentage change over the last day       |
| WeekPct    | Percentage change over the last week      |
| MonthPct   | Percentage change over the last month     |
| YtdPct     | Percentage change year-to-date            |

### API/Data Sources
- **TwelveData API**: Used for fetching cryptocurrency time series data.
- **Telegram API**: Used for sending messages to Telegram chat.

## How-to Guides

### Sending a Crypto Update to Telegram
1. Ensure the necessary secrets (`TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`, `TWELVEDATA_KEY`) are configured in the repository settings.
2. Trigger the workflow manually via the GitHub Actions interface or schedule it using an external service like cron-job.org.
3. Verify that the message is sent successfully to the specified Telegram chat.

## Explanation

The `market-crypto-update` workflow is designed to provide real-time updates on cryptocurrency prices, specifically Bitcoin, to a designated Telegram chat. It utilizes the TwelveData API to fetch market data and formats the output for better readability.

Key design decisions include the use of PowerShell for scripting due to its capability to handle JSON data and make RESTful API calls seamlessly. The workflow now incorporates emojis for better engagement in the Telegram messages and indicates ownership of the asset by appending an emoji in the message.

Error handling is included to ensure that if data for a requested ticker is unavailable, an error message is sent instead of failing silently.