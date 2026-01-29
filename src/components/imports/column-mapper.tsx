"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ColumnMapperProps {
    headers: string[];
    customFields?: { id: string; name: string; type: string }[];
    onMappingChange: (mapping: Record<string, string>) => void;
}

const SYSTEM_FIELDS = [
    { value: "name", label: "Lead Name (Required)" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "value", label: "Deal Value" },
    { value: "company", label: "Company" },
    { value: "notes", label: "Notes" },
];

export function ColumnMapper({ headers, customFields = [], onMappingChange }: ColumnMapperProps) {
    // Mapping: { [fileHeader]: systemField }
    const [mapping, setMapping] = useState<Record<string, string>>({});

    // Combine fields
    const allFields = [
        ...SYSTEM_FIELDS,
        // Prefix custom fields to distinguish them or just use ID?
        // Let's use ID or name. Name is unique per pipeline usually.
        // Actually, for JSONB storage, we probably want the key to be the field ID or a slug.
        // Let's use the exact name for now or "custom_ID".
        ...customFields.map(f => ({ value: f.id, label: `${f.name} (Custom)` }))
    ];

    // Auto-map based on similar names
    useEffect(() => {
        const initialMapping: Record<string, string> = {};
        headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            const match = allFields.find(field =>
                lowerHeader.includes(field.label.toLowerCase()) ||
                field.label.toLowerCase().includes(lowerHeader)
            );
            if (match) {
                initialMapping[header] = match.value;
            }
        });
        setMapping(initialMapping);
        onMappingChange(initialMapping);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headers, customFields]); // customFields is added to dependencies as allFields depends on it.

    const handleMapChange = (header: string, field: string) => {
        const newMapping = { ...mapping, [header]: field };
        if (field === "ignore") {
            delete newMapping[header];
        }
        setMapping(newMapping);
        onMappingChange(newMapping);
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Column</TableHead>
                        <TableHead>Map To Field</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {headers.map((header) => {
                        const isMapped = !!mapping[header];
                        return (
                            <TableRow key={header} className={isMapped ? "bg-muted/30" : ""}>
                                <TableCell className="font-medium">{header}</TableCell>
                                <TableCell>
                                    <Select
                                        value={mapping[header] || "ignore"}
                                        onValueChange={(val) => handleMapChange(header, val)}
                                    >
                                        <SelectTrigger className="w-full md:w-[250px]">
                                            <SelectValue placeholder="Ignore Column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ignore" className="text-muted-foreground">-- Ignore --</SelectItem>
                                            {allFields.map(f => (
                                                <SelectItem key={f.value} value={f.value}>
                                                    {f.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {isMapped ? (
                                        <span className="text-green-600 text-xs font-bold border border-green-200 bg-green-50 px-2 py-1 rounded">MAPPED</span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Ignored</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
