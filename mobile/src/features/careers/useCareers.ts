import { useQuery } from "@tanstack/react-query";
import { fetchCareers } from "../../api/careers";

export function useCareers() {
    return useQuery({
        queryKey: ["careers"],
        queryFn: fetchCareers,
        staleTime: 300000,
    });
}
