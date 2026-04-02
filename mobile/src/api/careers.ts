import { apiClient } from "./client";

type CareerResponse = {
    id: string;
    nombre: string;
    descripcion: string;
    modalidad: string;
    duracion: string;
};

export async function fetchCareers() {
    const response = await apiClient.get<CareerResponse[]>("/api/carreras");
    return response.data;
}
