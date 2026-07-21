"use client";

// Client-side i18n backed by next-intl. The frontends keep language choice
// in localStorage; pages consume text through this module so translation
// selection stays in the React tree instead of server-side branches.

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";

export type Language = "zh" | "en";
export type Localized<T = string> = Readonly<Record<Language, T>>;

const STORAGE_KEY = "jiedusuo_lang";
const DEFAULT_LANGUAGE: Language = "zh";

function normalize(value: unknown): Language {
    return String(value || "").toLowerCase().startsWith("en") ? "en" : DEFAULT_LANGUAGE;
}

function htmlLang(lang: Language): string {
    return lang === "en" ? "en" : "zh-Hans";
}

export function localeForLanguage(lang: Language): "en-US" | "zh-CN" {
    return lang === "en" ? "en-US" : "zh-CN";
}

function applyDocumentLanguage(lang: Language) {
    if (typeof document === "undefined") return;
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.setAttribute("data-language", lang);
}

function readStored(): Language {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    try {
        return normalize(window.localStorage.getItem(STORAGE_KEY));
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

function persistLanguage(lang: Language) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        /* private mode etc. */
    }
}

export interface LanguageCtx {
    lang: Language;
    setLang: (next: Language) => void;
    toggle: () => void;
}

const Ctx = createContext<LanguageCtx | null>(null);
const EMPTY_MESSAGES = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

    useEffect(() => {
        const next = readStored();
        setLangState(next);
        applyDocumentLanguage(next);

        const onStorage = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) return;
            const stored = normalize(event.newValue);
            applyDocumentLanguage(stored);
            setLangState(stored);
        };

        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const setLang = useCallback((next: Language) => {
        const norm = normalize(next);
        persistLanguage(norm);
        applyDocumentLanguage(norm);
        setLangState(norm);
    }, []);

    const value = useMemo<LanguageCtx>(
        () => ({ lang, setLang, toggle: () => setLang(lang === "en" ? "zh" : "en") }),
        [lang, setLang],
    );

    return (
        <Ctx.Provider value={value}>
            <NextIntlClientProvider locale={localeForLanguage(lang)} messages={EMPTY_MESSAGES}>
                {children}
            </NextIntlClientProvider>
        </Ctx.Provider>
    );
}

export function useLanguage(): LanguageCtx {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useLanguage must be inside <LanguageProvider>");
    return ctx;
}

/** Bind a `{zh, en}` dict to the current language. Resolves on every
 *  render through next-intl's locale subscription. The signature lets
 *  zh be the structural source of truth while en may contain different
 *  string literals with the same runtime shape. */
export function useI18n<T>(dict: {
    readonly zh: T;
    readonly en: unknown;
}): T {
    const lang = normalize(useLocale());
    return ((lang === "en" ? dict.en : dict.zh) ?? dict.zh) as T;
}

export function pickLocalized<T>(value: Localized<T>, lang?: Language): T {
    const selected = lang ?? currentLanguage();
    return value[selected] ?? value[DEFAULT_LANGUAGE];
}

export function currentLanguage(): Language {
    if (typeof document !== "undefined") {
        return normalize(document.documentElement.getAttribute("data-language"));
    }
    return DEFAULT_LANGUAGE;
}

/** Static pick — for code that runs outside React (e.g., format
 *  helpers). Uses the document attribute set on mount. */
export function pickStatic<T>(value: Localized<T>): T {
    return pickLocalized(value);
}
