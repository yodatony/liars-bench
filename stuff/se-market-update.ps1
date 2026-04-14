# ── Config ──────────────────────────────────────────────
$TELEGRAM_TOKEN   = "YOUR_TOKEN_HERE"
$TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"
# ────────────────────────────────────────────────────────

$TZ  = [System.TimeZoneInfo]::FindSystemTimeZoneById('Europe/Stockholm')
$Now = [System.TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow, $TZ)

$Indices = @(
    @{ Name = "OMXS30";     Ticker = "^OMX";      Market = "SE" }
    @{ Name = "OMXSPI";     Ticker = "^OMXSPI";   Market = "SE" }
    @{ Name = "Investor B"; Ticker = "INVE-B.ST";  Market = "SE" }
)

function Get-MarketStatus {
    $T = $Now.Hour * 60 + $Now.Minute
    if ($T -ge 540 -and $T -lt 1050) { return "Open" }
    return "Closed"
}

function Get-IndexData([string]$Ticker) {
    $Year = $Now.Year.ToString()
    $Enc  = [Uri]::EscapeDataString($Ticker)
    $R    = Invoke-RestMethod `
                -Uri "https://query1.finance.yahoo.com/v8/finance/chart/$Enc`?interval=1d&range=1y" `
                -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } `
                -ErrorAction Stop
    $Meta       = $R.chart.result[0]
    $Closes     = $Meta.indicators.quote[0].close
    $Timestamps = $Meta.timestamp
    if (-not $Closes -or $Closes.Count -eq 0) { throw "No data for $Ticker" }

    $Rows = @(for ($i = $Closes.Count - 1; $i -ge 0; $i--) {
        if ($null -ne $Closes[$i]) {
            [PSCustomObject]@{
                date  = [DateTimeOffset]::FromUnixTimeSeconds($Timestamps[$i]).ToString('yyyy-MM-dd')
                close = [double]$Closes[$i]
            }
        }
    })
    if ($Rows.Count -eq 0) { throw "No valid rows for $Ticker" }

    $N        = $Rows.Count
    $Cur      = $Rows[0].close
    $YtdClose = ($Rows | Where-Object { $_.date -like "$Year*" } | Select-Object -Last 1).close

    function Pct($From) {
        if (-not $From -or $From -eq 0) { return $null }
        [math]::Round(($Cur - $From) / $From * 100, 2)
    }

    [PSCustomObject]@{
        Current  = [math]::Round($Cur, 2)
        DayPct   = Pct $Rows[1].close
        WeekPct  = Pct ($N -ge 6  ? $Rows[5].close  : $Rows[$N-1].close)
        MonthPct = Pct ($N -ge 22 ? $Rows[21].close : $Rows[$N-1].close)
        YtdPct   = Pct $YtdClose
    }
}

function Fmt([object]$v) {
    if ($null -eq $v) { return "N/A" }
    "$(if ($v -ge 0) { '🟢 +' } else { '🔴 ' })$v%"
}

function FmtArrow([object]$v) {
    if ($null -eq $v) { return "N/A" }
    "$(if ($v -ge 0) { '▲ +' } else { '▼ ' })$v%"
}

$lines = @("*📈 SE Market Update — $($Now.ToString('yyyy-MM-dd HH:mm')) CET*", "")

foreach ($idx in $Indices) {
    try {
        $d      = Get-IndexData $idx.Ticker
        $status = Get-MarketStatus
        $lines += "*SE: $($idx.Name)* — $($d.Current) [$status]"
        $lines += "*Day: $(Fmt $d.DayPct)* | Week: $(FmtArrow $d.WeekPct) | Month: $(FmtArrow $d.MonthPct) | YTD: $(FmtArrow $d.YtdPct)"
    } catch {
        $lines += "*SE: $($idx.Name)* — unavailable ⚠️"
        $lines += "  _Error: $($_.Exception.Message)_"
    }
    $lines += ""
}

$body = @{
    chat_id    = $TELEGRAM_CHAT_ID
    text       = ($lines -join "`n")
    parse_mode = "Markdown"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" `
    -Method Post -Body $body -ContentType "application/json; charset=utf-8"
Write-Host "Sent at $($Now.ToString('HH:mm')) CET"