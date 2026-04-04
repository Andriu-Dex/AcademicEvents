import { useQuery } from "@tanstack/react-query";
import { fetchPublicEvents } from "../../api/publicEvents";

export function usePublicEvents() {
    return useQuery({
        queryKey: ["public-events"],
        queryFn: fetchPublicEvents,
        staleTime: 120000,
    });
}
