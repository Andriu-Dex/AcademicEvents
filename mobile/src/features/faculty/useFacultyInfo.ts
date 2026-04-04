import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

export type FacultyInfo = {
    title: string;
    acronym: string;
    description: string;
    logo: string;
};

function pickString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string") return value;
        if (typeof value === "number") return String(value);
    }
    return "";
}

async function fetchFacultyInfo(): Promise<FacultyInfo> {
    const response = await apiClient.get<Record<string, unknown>>("/api/facultad-principal");

    return {
        title: pickString(
            response.data?.nombre,
            response.data?.nom_fac,
            "Facultad de Ingenieria en Sistemas, Electronica e Industrial"
        ),
        acronym: pickString(response.data?.acronimo, response.data?.acr_fac, "FISEI"),
        description: pickString(response.data?.descripcion, response.data?.des_fac),
        logo: pickString(response.data?.logo, response.data?.url_log_fac),
    };
}

export function useFacultyInfo() {
    return useQuery({
        queryKey: ["faculty-info"],
        queryFn: fetchFacultyInfo,
        staleTime: 300000,
    });
}
