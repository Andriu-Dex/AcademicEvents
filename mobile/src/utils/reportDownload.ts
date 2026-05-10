import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiClient } from "../api/client";

type PdfRequestConfig = Readonly<{
    endpoint: string;
    fileName: string;
    method?: "get" | "post";
    params?: Record<string, unknown>;
    data?: unknown;
    mimeType?: string;
}>;

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCodePoint(...chunk);
    }

    return btoa(binary);
}

export async function downloadReportPdf({
    endpoint,
    fileName,
    method = "post",
    params,
    data,
    mimeType = "application/pdf",
}: PdfRequestConfig) {
    const response = await apiClient.request<ArrayBuffer>({
        url: endpoint,
        method,
        params,
        data,
        responseType: "arraybuffer",
    });

    const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

    if (!cacheDirectory) {
        throw new Error("No se encontró una carpeta temporal disponible para guardar el archivo.");
    }

    const fileUri = `${cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, arrayBufferToBase64(response.data), {
        encoding: "base64",
    });

    if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Compartir no disponible", "El dispositivo no permite compartir el archivo PDF en este momento.");
        return fileUri;
    }

    await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: fileName,
        UTI: "com.adobe.pdf",
    });

    return fileUri;
}
