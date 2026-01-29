"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { ColumnMapper } from "@/components/imports/column-mapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import * as XLSX from "xlsx";

const SPEND_FIELDS = [
    { id: "date", name: "Date (Required)", type: "date" },
    { id: "campaign", name: "Campaign Name (Required)", type: "text" },
    { id: "platform", name: "Platform (e.g. Meta, Google)", type: "text" },
    { id: "spend", name: "Amount Spent (Required)", type: "number" },
    { id: "impressions", name: "Impressions", type: "number" },
    { id: "clicks", name: "Clicks", type: "number" },
];

export default function ImportSpendPage() {
    const router = useRouter();
    const [step, setStep] = useState<"upload" | "config" | "map" | "preview">("upload");
    const [file, setFile] = useState<File | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [workbook, setWorkbook] = useState<any | null>(null);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("");

    const [headers, setHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<unknown[][]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // File Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

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

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const wb = XLSX.read(data, { type: "binary" });
            setWorkbook(wb);
            setSheetNames(wb.SheetNames);
            if (wb.SheetNames.length > 0) {
                const first = wb.SheetNames[0];
                if (first) setSelectedSheet(first);
            }
            setStep("config");
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleConfigSubmit = () => {
        if (!workbook || !selectedSheet) return;

        const sheet = workbook.Sheets[selectedSheet];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        if (jsonData.length > 0) {
            const headerRow = jsonData[0];
            if (Array.isArray(headerRow)) {
                setHeaders(headerRow as string[]);
                // Preview next 5 rows
                const previewRows = jsonData.slice(1, 6) as unknown[][];
                setPreviewData(previewRows);

                // Pre-fill platform mapping if selected
                // This is where "templates" would go
                setStep("map");
            }
        }
    };

    const getMappedPreview = () => {
        return previewData.map(row => {
            const mappedRow: Record<string, unknown> = {};
            Object.entries(mapping).forEach(([header, field]) => {
                const headerIndex = headers.indexOf(header);
                if (headerIndex !== -1 && Array.isArray(row)) {
                    mappedRow[field] = row[headerIndex];
                }
            });
            // Auto-inject platform if not mapped but selected in config
            if (selectedPlatform && !mappedRow["platform"]) {
                mappedRow["platform"] = selectedPlatform;
            }
            return mappedRow;
        });
    };

    const handleImport = async () => {
        if (!file) return;

        if (!mapping['date'] || !mapping['campaign'] || !mapping['spend']) {
            alert("Please map at least Date, Campaign, and Spend.");
            return;
        }

        setIsLoading(true);
        // Simulate API call for now
        setTimeout(() => {
            setIsLoading(false);
            alert("Spend data imported successfully!");
            router.push("/spend");
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-muted/10 p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/spend">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Ad Spend</h1>
                    <p className="text-muted-foreground">Bulk import cost data from Meta, Google, or TikTok</p>
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === "upload" && (
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="flex flex-col items-center gap-4 p-10 border-2 border-dashed rounded-xl bg-card hover:bg-muted/50 transition-colors w-full max-w-xl text-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Upload Spend Report</h3>
                            <p className="text-sm text-muted-foreground">
                                Support .xlsx (multi-sheet) or .csv
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

            {/* Step 2: Config (Sheet & Platform) */}
            {step === "config" && (
                <div className="grid gap-6 max-w-2xl mx-auto w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Select the sheet and platform for this data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Sheet Selection */}
                            <div className="space-y-2">
                                <Label>Select Sheet</Label>
                                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a sheet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sheetNames.map(name => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Platform Selection */}
                            <div className="space-y-4">
                                <Label>Ad Platform</Label>
                                <RadioGroup value={selectedPlatform} onValueChange={setSelectedPlatform} className="grid grid-cols-3 gap-4">
                                    {["Meta", "Google", "TikTok"].map((platform) => (
                                        <div key={platform}>
                                            <RadioGroupItem value={platform} id={platform} className="peer sr-only" />
                                            <Label
                                                htmlFor={platform}
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                {platform}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
                                <Button onClick={handleConfigSubmit}>Next: Map Columns</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 3: Mapping */}
            {step === "map" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Map Columns</CardTitle>
                            <CardDescription>Map file headers to system metrics.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md mb-4 flex gap-4">
                                <div><FileSpreadsheet className="inline mr-2 h-4 w-4" /> File: <span className="font-medium text-foreground">{file?.name}</span></div>
                                <div>Sheet: <span className="font-medium text-foreground">{selectedSheet}</span></div>
                                <div>Platform: <span className="font-medium text-foreground">{selectedPlatform || "Custom"}</span></div>
                            </div>

                            <ColumnMapper
                                headers={headers}
                                customFields={SPEND_FIELDS}
                                onMappingChange={setMapping}
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setStep("config")}>Back</Button>
                                <Button onClick={() => setStep("preview")} disabled={Object.keys(mapping).length === 0}>Next: Preview</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 4: Preview */}
            {step === "preview" && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview Data</CardTitle>
                            <CardDescription>
                                Verify data types. {selectedPlatform && `Platform "${selectedPlatform}" will be applied to all rows.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.values(mapping).map((field, i) => (
                                                <TableHead key={i} className="capitalize">{SPEND_FIELDS.find(f => f.id === field)?.name || field}</TableHead>
                                            ))}
                                            {/* Show implicit platform column if selected */}
                                            {selectedPlatform && !Object.values(mapping).includes("platform") && (
                                                <TableHead>Platform (Auto)</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {getMappedPreview().map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(mapping).map((field, j) => (
                                                    <TableCell key={j}>{String(row[field] ?? "")}</TableCell>
                                                ))}
                                                {selectedPlatform && !Object.values(mapping).includes("platform") && (
                                                    <TableCell>{selectedPlatform}</TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
                                <Button onClick={handleImport} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Import Spend
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
