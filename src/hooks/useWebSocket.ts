"use client";

// Stable WebSocket subscriber. Opens one connection per `url`,
// re-establishes with linear backoff, and fans messages out to
// callbacks keyed by `kind`. The backend (axum on the desktop side,
// taiyang on the admin side) sends frames in the shape
// `{ "kind": "...", "payload": { ... } }`.

import { useEffect, useRef } from "react";

export interface WsMessage<T = unknown> {
    kind: string;
    payload: T;
}

export type WsHandlers = {
    /** Catch-all — receives every parsed message. */
    onMessage?: (msg: WsMessage) => void;
    /** Per-kind handler. Receives just the payload. */
    handlers?: Record<string, (payload: unknown) => void>;
    onOpen?: () => void;
    onClose?: () => void;
};

const BACKOFF_MS = 1500;

export function useWebSocket(url: string | null, opts: WsHandlers) {
    const optsRef = useRef(opts);
    optsRef.current = opts;

    useEffect(() => {
        if (!url) return;
        let cancelled = false;
        let ws: WebSocket | null = null;
        let retry: ReturnType<typeof setTimeout> | null = null;

        function connect() {
            if (cancelled) return;
            try {
                ws = new WebSocket(url!);
            } catch {
                schedule();
                return;
            }
            ws.onopen = () => optsRef.current.onOpen?.();
            ws.onclose = () => {
                optsRef.current.onClose?.();
                schedule();
            };
            ws.onerror = () => {
                try {
                    ws?.close();
                } catch {
                    /* nothing */
                }
            };
            ws.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(evt.data) as WsMessage;
                    optsRef.current.onMessage?.(msg);
                    const handler = optsRef.current.handlers?.[msg.kind];
                    handler?.(msg.payload);
                } catch {
                    /* malformed frame — drop */
                }
            };
        }

        function schedule() {
            if (cancelled) return;
            if (retry) clearTimeout(retry);
            retry = setTimeout(connect, BACKOFF_MS);
        }

        connect();
        return () => {
            cancelled = true;
            if (retry) clearTimeout(retry);
            try {
                ws?.close();
            } catch {
                /* nothing */
            }
        };
    }, [url]);
}
