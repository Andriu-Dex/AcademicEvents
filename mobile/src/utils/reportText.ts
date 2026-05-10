export function pickReportText(value: unknown, fallback = "") {
    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    if (typeof value === "boolean") {
        return value ? "Sí" : "No";
    }

    return fallback;
}

export function joinReportText(parts: Array<string | number | null | undefined>, separator = " · ") {
    return parts
        .map((part) => (typeof part === "number" ? String(part) : part?.toString?.().trim() ?? ""))
        .filter((part) => part.length > 0)
        .join(separator);
}
