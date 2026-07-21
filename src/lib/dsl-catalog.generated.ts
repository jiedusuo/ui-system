// Frozen editor snapshot of ray's DSL vocabulary. The rewrite retired the
// server metadata endpoint and its generator; factor entries below mirror
// `crates/wire/src/factors.rs::FACTORS_V2` and intentionally contain no v1
// aliases.

export const DSL_CATALOG = {
  "schema_version": 1,
  "authors": [
    {
      "constant": "Author.Enrich",
      "label": "Enrich",
      "detail": "Enrich author",
      "routing_supported": true
    },
    {
      "constant": "Author.Demon",
      "label": "Demon",
      "detail": "Demon author",
      "routing_supported": true
    },
    {
      "constant": "Author.JTradez",
      "label": "J Tradez",
      "detail": "J Tradez author",
      "routing_supported": true
    },
    {
      "constant": "Author.Qiko",
      "label": "Qiko",
      "detail": "Qiko author",
      "routing_supported": true
    },
    {
      "constant": "Author.QuantumWave",
      "label": "Quantum Wave",
      "detail": "Quantum Wave author",
      "routing_supported": true
    },
    {
      "constant": "Author.Sre",
      "label": "SRE",
      "detail": "Stock & Real Estate author",
      "routing_supported": false
    }
  ],
  "builtins": [
    {
      "name": "position.avg_fill",
      "type": "num",
      "scope": "graph",
      "detail": "average fill for the managed position"
    },
    {
      "name": "position.current_avg",
      "type": "num",
      "scope": "graph",
      "detail": "current average after partial fills"
    },
    {
      "name": "option.mark",
      "type": "num",
      "scope": "both",
      "detail": "latest option mark"
    },
    {
      "name": "option.bid",
      "type": "num",
      "scope": "both",
      "detail": "latest option bid"
    },
    {
      "name": "option.ask",
      "type": "num",
      "scope": "both",
      "detail": "latest option ask"
    },
    {
      "name": "option.spread",
      "type": "num",
      "scope": "both",
      "detail": "ask − bid in dollars"
    },
    {
      "name": "option.spread_pct",
      "type": "num",
      "scope": "both",
      "detail": "spread as a fraction of mark"
    },
    {
      "name": "option.dte",
      "type": "num",
      "scope": "both",
      "detail": "days to expiry"
    },
    {
      "name": "option.kind",
      "type": "enum",
      "scope": "both",
      "detail": "OptionKind.Call or OptionKind.Put"
    },
    {
      "name": "underlying.close",
      "type": "num",
      "scope": "graph",
      "detail": "latest underlying mark/close"
    },
    {
      "name": "underlying.entry",
      "type": "num",
      "scope": "graph",
      "detail": "underlying quote captured near entry/fill"
    },
    {
      "name": "position.original_qty",
      "type": "num",
      "scope": "graph",
      "detail": "contracts at graph start"
    },
    {
      "name": "position.remaining_qty",
      "type": "num",
      "scope": "graph",
      "detail": "contracts still managed"
    },
    {
      "name": "author.entry_px",
      "type": "num",
      "scope": "graph",
      "detail": "author's entry price when known"
    },
    {
      "name": "author.exit_px",
      "type": "num",
      "scope": "graph",
      "detail": "author's exit price when known"
    },
    {
      "name": "author.fraction",
      "type": "num",
      "scope": "graph",
      "detail": "author trim/close fraction"
    },
    {
      "name": "author.id",
      "type": "enum",
      "scope": "both",
      "detail": "canonical author enum"
    },
    {
      "name": "position.elapsed_s",
      "type": "num",
      "scope": "graph",
      "detail": "seconds since entry"
    },
    {
      "name": "position.peak_mark",
      "type": "num",
      "scope": "graph",
      "detail": "highest option mark seen so far"
    },
    {
      "name": "is_zero_dte",
      "type": "bool",
      "scope": "both",
      "detail": "true when the option expires today"
    },
    {
      "name": "config.port_frac",
      "type": "num",
      "scope": "sizing",
      "detail": "global base portfolio fraction from [sizing]"
    },
    {
      "name": "account.equity",
      "type": "num",
      "scope": "sizing",
      "detail": "account equity at entry time"
    },
    {
      "name": "account.buying_power",
      "type": "num",
      "scope": "sizing",
      "detail": "available buying power at entry time"
    },
    {
      "name": "alert.price",
      "type": "num",
      "scope": "sizing",
      "detail": "parsed alert entry price"
    },
    {
      "name": "alert.age_s",
      "type": "num",
      "scope": "sizing",
      "detail": "seconds from alert post time to sizing evaluation"
    },
    {
      "name": "alert.is_lotto",
      "type": "bool",
      "scope": "sizing",
      "detail": "parsed lotto flag"
    },
    {
      "name": "alert.is_scalp",
      "type": "bool",
      "scope": "both",
      "detail": "parsed scalp flag"
    },
    {
      "name": "factor.underlying.broke_pdh",
      "type": "bool",
      "scope": "both",
      "detail": "underlying broke the prior-day directional extreme"
    },
    {
      "name": "factor.underlying.trend_persist_days",
      "type": "num",
      "scope": "both",
      "detail": "count of consecutive aligned daily closes before entry"
    },
    {
      "name": "factor.market.spy_range_yesterday",
      "type": "bool",
      "scope": "both",
      "detail": "prior complete session's smoothed SPY range regime"
    },
    {
      "name": "factor.market.spy_misaligned",
      "type": "bool",
      "scope": "both",
      "detail": "SPY close is directionally misaligned to its 20 EMA band"
    },
    {
      "name": "factor.option.runup_60m",
      "type": "num",
      "scope": "both",
      "detail": "causal 60-minute intraday run-up from the option 1m tape"
    },
    {
      "name": "factor.option.macd_rel_5m",
      "type": "num",
      "scope": "both",
      "detail": "option 5m MACD(12,26,9) divided by current price"
    },
    {
      "name": "factor.underlying.momentum_15m",
      "type": "num",
      "scope": "both",
      "detail": "pre-entry 15-minute underlying momentum alignment"
    },
    {
      "name": "factor.option.moneyness",
      "type": "num",
      "scope": "both",
      "detail": "signed option moneyness at entry"
    }
  ],
  "functions": [
    {
      "name": "min(a, b)",
      "type": "func",
      "scope": "both",
      "detail": "smaller numeric value"
    },
    {
      "name": "max(a, b)",
      "type": "func",
      "scope": "both",
      "detail": "larger numeric value"
    },
    {
      "name": "ceil(x)",
      "type": "func",
      "scope": "both",
      "detail": "round up to a whole number"
    },
    {
      "name": "floor(x)",
      "type": "func",
      "scope": "both",
      "detail": "round down to a whole number"
    },
    {
      "name": "round(x)",
      "type": "func",
      "scope": "both",
      "detail": "round to nearest whole number"
    },
    {
      "name": "abs(x)",
      "type": "func",
      "scope": "both",
      "detail": "absolute numeric value"
    },
    {
      "name": "ema(series, len, bar)",
      "type": "func",
      "scope": "graph",
      "detail": "live EMA indicator"
    },
    {
      "name": "rsi(series, len, bar)",
      "type": "func",
      "scope": "graph",
      "detail": "live RSI indicator"
    },
    {
      "name": "macd(series, len, bar)",
      "type": "func",
      "scope": "graph",
      "detail": "live MACD histogram; len is signal period"
    }
  ],
  "enums": [
    {
      "name": "OptionKind.Call",
      "type": "enum",
      "scope": "both",
      "detail": "call option"
    },
    {
      "name": "OptionKind.Put",
      "type": "enum",
      "scope": "both",
      "detail": "put option"
    },
    {
      "name": "Author.Enrich",
      "type": "enum",
      "scope": "both",
      "detail": "Enrich author"
    },
    {
      "name": "Author.Demon",
      "type": "enum",
      "scope": "both",
      "detail": "Demon author"
    },
    {
      "name": "Author.JTradez",
      "type": "enum",
      "scope": "both",
      "detail": "J Tradez author"
    },
    {
      "name": "Author.Qiko",
      "type": "enum",
      "scope": "both",
      "detail": "Qiko author"
    },
    {
      "name": "Author.QuantumWave",
      "type": "enum",
      "scope": "both",
      "detail": "Quantum Wave author"
    },
    {
      "name": "Author.Sre",
      "type": "enum",
      "scope": "both",
      "detail": "Stock & Real Estate author"
    }
  ],
  "author_events": [
    {
      "name": "take_profit_signal",
      "type": "mode",
      "scope": "graph",
      "detail": "author posts a profit update"
    },
    {
      "name": "trim",
      "type": "mode",
      "scope": "graph",
      "detail": "author trims part of the position"
    },
    {
      "name": "close",
      "type": "mode",
      "scope": "graph",
      "detail": "author closes the position"
    }
  ],
  "execution_modes": [
    {
      "name": "strat_default",
      "type": "mode",
      "scope": "graph",
      "detail": "use the strategy's configured default execution"
    },
    {
      "name": "chase",
      "type": "mode",
      "scope": "graph",
      "detail": "marketable limit plus sell-chase ladder"
    },
    {
      "name": "market_fallback",
      "type": "mode",
      "scope": "graph",
      "detail": "limit first, then market fallback after the configured window"
    },
    {
      "name": "resting",
      "type": "mode",
      "scope": "graph",
      "detail": "keep a broker-side resting order at the trigger price"
    }
  ]
} as const;
