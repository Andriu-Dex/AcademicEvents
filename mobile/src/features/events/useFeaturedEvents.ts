import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedEvents } from "../../api/featuredEvents";

export function useFeaturedEvents() {
    return useQuery({
        queryKey: ["featured-events"],
        queryFn: fetchFeaturedEvents,
        staleTime: 120000,
    });
}
