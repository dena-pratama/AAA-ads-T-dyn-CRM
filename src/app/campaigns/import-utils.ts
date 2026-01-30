import * as XLSX from "xlsx";

export interface ImportValidationResult {
    isValid: boolean;
    error?: string;
    data?: any[];
    stats?: {
        totalColumns: number;
        matchedColumns: number;
        unknownColumns: number;
    };
}

const ALLOWED_HEADERS = [
    "date", "day", "time", "tanggal",
    "campaign name", "campaign", "campaign_name", "nama campaign",
    "ad set name", "adset",
    "ad name", "ad",
    "platform", "source", "publisher",
    "spend", "amount spent", "cost", "biaya",
    "impressions", "views", "tuch", "tayangan",
    "clicks", "link clicks", "klik", "tautan",
    "leads", "results", "hasil", "konversi",
    "ctr", "cpc", "cpm", "reach"
];

const REQUIRED_HEADERS = ["campaign", "spend"];

// Helper to normalize header string
const normalize = (h: string) => h?.toLowerCase().trim().replace(/_/g, " ").replace(/\./g, "");

export async function parseAndValidateImport(file: File): Promise<ImportValidationResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get headers
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (!jsonData || jsonData.length === 0) {
                    resolve({ isValid: false, error: "File appears to be empty" });
                    return;
                }

                const headers = (jsonData[0] as string[]).filter(h => !!h).map(normalize);
                const rows = XLSX.utils.sheet_to_json(worksheet); // Parse actual data

                // Validation Logic
                let matchedCount = 0;
                let hasCampaign = false;
                let hasSpend = false;

                headers.forEach(h => {
                    const isMatch = ALLOWED_HEADERS.some(allowed => h.includes(allowed));
                    if (isMatch) matchedCount++;

                    if (h.includes("campaign")) hasCampaign = true;
                    if (h.includes("spend") || h.includes("cost") || h.includes("biaya")) hasSpend = true;
                });

                const totalColumns = headers.length;
                const matchRatio = totalColumns > 0 ? matchedCount / totalColumns : 0;
                const unknownColumns = totalColumns - matchedCount;

                // STRICT RULES
                // 1. Must have Campaign and Spend columns (flexible matching)
                if (!hasCampaign) {
                    resolve({ isValid: false, error: "Missing required column: Campaign Name" });
                    return;
                }

                // 2. "Too many columns" logic (User Request)
                // If match ratio < 50% OR unknown columns > 10
                if (matchRatio < 0.4 || unknownColumns > 10) {
                    resolve({
                        isValid: false,
                        error: "Maaf raw data yang kamu input kurang sesuai, tolong rapihkan data nya terlebih dahulu",
                        stats: { totalColumns, matchedColumns: matchedCount, unknownColumns }
                    });
                    return;
                }

                // If passed
                resolve({
                    isValid: true,
                    data: rows,
                    stats: { totalColumns, matchedColumns: matchedCount, unknownColumns }
                });

            } catch (err) {
                console.error(err);
                resolve({ isValid: false, error: "Failed to parse file" });
            }
        };

        reader.onerror = () => resolve({ isValid: false, error: "Failed to read file" });
        reader.readAsArrayBuffer(file);
    });
}
