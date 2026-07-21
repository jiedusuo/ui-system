export interface DslAuthorConstant {
    constant: string;
    label: string;
    detail: string;
    actorId: string;
}

export interface ActorRosterEntry {
    actor_id: string;
    key: string | null;
    label: string;
}

export interface ActorRoster {
    schema_version: 2;
    catalog_rev: number;
    actors: ActorRosterEntry[];
}

export function authorConstantsFromRoster(roster: ActorRoster): DslAuthorConstant[] {
    assertRoster(roster);
    return roster.actors
        .filter((actor): actor is ActorRosterEntry & { key: string } => actor.key != null)
        .map((actor) => ({
            constant: `Author.${actor.key}`,
            label: actor.label,
            detail: `${actor.label} · Author.${actor.key}`,
            actorId: actor.actor_id,
        }))
        .sort((left, right) => left.constant.localeCompare(right.constant));
}

export function resolveAuthorSymbols(authors: string[], roster?: ActorRoster): string[] {
    if (!roster) throw new Error("Author roster unavailable; routing was not resolved");
    const available = authorConstantsFromRoster(roster);
    const byConstant = new Map(
        available.map((author) => [author.constant.toLowerCase(), author.actorId]),
    );
    const actorIds = authors.map((author) => {
        const actorId = byConstant.get(author.toLowerCase());
        if (!actorId) {
            const choices = available.map((entry) => entry.constant).join(", ") || "none";
            throw new Error(`Unknown author symbol ${author}; available authors: ${choices}`);
        }
        return actorId;
    });
    const resolved = [...new Set(actorIds)].sort();
    if (authors.length > 0 && resolved.length === 0) {
        throw new Error("Author routing resolved to no actor_ids");
    }
    return resolved;
}

export function resolveStrategyPresetAuthors<
    T extends {
        strategy: {
            routing?: { authors?: string[]; actor_ids?: string[] } | null;
        };
    },
>(preset: T, roster?: ActorRoster): T {
    const routing = preset.strategy.routing;
    if (!routing) return preset;
    if (routing.authors && routing.actor_ids) {
        throw new Error("routing must contain authors or actor_ids, not both");
    }
    if (!routing.authors) {
        if (routing.actor_ids?.length === 0) throw new Error("Actor routing cannot be empty");
        return preset;
    }
    if (routing.authors.length === 0) {
        throw new Error("Author routing cannot be empty");
    }
    return {
        ...preset,
        strategy: {
            ...preset.strategy,
            routing: { actor_ids: resolveAuthorSymbols(routing.authors, roster) },
        },
    } as T;
}

export async function fetchActorRoster(
    fetcher: typeof fetch = fetch,
    path = "/api/strategies/roster",
): Promise<ActorRoster> {
    let response: Response;
    try {
        response = await fetcher(path);
    } catch (error) {
        throw new Error(`Author roster unavailable: ${errorMessage(error)}`);
    }
    if (!response.ok) {
        throw new Error(`Author roster unavailable: HTTP ${response.status}`);
    }
    try {
        const roster = (await response.json()) as ActorRoster;
        assertRoster(roster);
        return roster;
    } catch (error) {
        throw new Error(`Author roster unavailable: ${errorMessage(error)}`);
    }
}

function assertRoster(roster: ActorRoster): void {
    if (
        roster?.schema_version !== 2 ||
        !Array.isArray(roster.actors) ||
        roster.actors.some(
            (actor) =>
                typeof actor.actor_id !== "string" ||
                typeof actor.label !== "string" ||
                (actor.key !== null &&
                    (typeof actor.key !== "string" ||
                        !/^[a-z][a-z0-9_]{0,31}$/.test(actor.key))),
        )
    ) {
        throw new Error("unsupported roster payload");
    }
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
