"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { ColumnMapper } from "@/components/imports/column-mapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import * as XLSX from "xlsx";

interface CustomField {
    id: string;
    name: string;
    type: string;
}

interface PipelineData {
    id: string;
    name: string;
    customFields: CustomField[];
}

export default function ImportLeadsPage() {
    const params = useParams();
    const router = useRouter();
    // const { toast } = useToast();
    const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<unknown[][]>([]); // Array of arrays
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [pipeline, setPipeline] = useState<PipelineData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Pipeline Details to get Custom Fields
    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const res = await fetch(`/api/pipelines/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPipeline(data);
                }
            } catch (error) {
                console.error("Failed to fetch pipeline", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPipeline();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // File Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Basic validation
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv"
        ];
        if (!validTypes.includes(selectedFile.type)) {
            alert("Invalid File Type. Please upload .xlsx or .csv files only.");
            return;
        }

        setFile(selectedFile);
        parseFile(selectedFile);
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Parse headers and minimal data for preview
            const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
            if (jsonData.length > 0) {
                const headerRow = jsonData[0];
                if (Array.isArray(headerRow)) {
                    setHeaders(headerRow as string[]);
                    // Get next 5 rows for preview
                    const previewRows = jsonData.slice(1, 6) as unknown[][];
                    setPreviewData(previewRows);
                    setStep("map");
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    // Helper to get mapped data for preview
    const getMappedPreview = () => {
        return previewData.map(row => {
            const mappedRow: Record<string, unknown> = {};
            Object.entries(mapping).forEach(([header, field]) => {
                // Find index of header
                const headerIndex = headers.indexOf(header);
                if (headerIndex !== -1 && Array.isArray(row)) {
                    mappedRow[field] = row[headerIndex];
                }
            });
            return mappedRow;
        });
    };

    const handleImport = async () => {
        // Prepare data payload
        // toast({ title: "Importing...", description: "Sending data to server" });
        alert("Importing... (API not connected yet)");
        // TODO: Implement API call
        // For now simulate success
        setTimeout(() => {
            // toast({ title: "Success", description: "Leads imported successfully" });
            alert("Leads imported successfully!");
            router.push(`/pipelines/${params.id}`);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full bg-muted/10 p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/pipelines/${params.id}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Leads</h1>
                    <p className="text-muted-foreground">Bulk import leads from Excel or CSV</p>
                </div>
            </div>

            {step === "upload" && (
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="flex flex-col items-center gap-4 p-10 border-2 border-dashed rounded-xl bg-card hover:bg-muted/50 transition-colors w-full max-w-xl text-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Upload your file</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop or click to upload. Support .xlsx, .csv
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileUpload}
                        />
                        <Button asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                Select File
                            </label>
                        </Button>
                    </div>
                </div>
            )}

            {step === "map" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Map Columns</CardTitle>
                            <CardDescription>Match your file columns to CRM fields</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md mb-4">
                                <FileSpreadsheet className="inline mr-2 h-4 w-4" />
                                File: <span className="font-medium text-foreground">{file?.name}</span>
                            </div>

                            <ColumnMapper
                                headers={headers}
                                customFields={pipeline?.customFields || []}
                                onMappingChange={setMapping}
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                                <Button onClick={() => setStep("preview")} disabled={Object.keys(mapping).length === 0}>Next: Preview</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === "preview" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview Data</CardTitle>
                            <CardDescription>Review the data before importing. Only mapped columns are shown.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.values(mapping).map((field, i) => (
                                                <TableHead key={i} className="capitalize">{field}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
// ...
                                    <TableBody>
                                        {getMappedPreview().map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(mapping).map((field, j) => (
                                                    <TableCell key={j}>{String(row[field] ?? "")}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
// ...
                                </Table>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
                                <Button onClick={handleImport}>Start Import</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
