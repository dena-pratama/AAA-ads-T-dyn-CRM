"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineForm } from "@/components/pipelines/pipeline-form";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineDetailTabsProps {
    pipeline: any; // Type safe in page, but any here for flexibility
    clients: any[];
    isSuperAdmin: boolean;
    readOnly: boolean;
}

export function PipelineDetailTabs({ pipeline, clients, isSuperAdmin, readOnly }: PipelineDetailTabsProps) {
    // Default to "leads" tab unless creating new? Actually creating new is handled by /pipelines/new or /pipelines/create page usually.
    // If id exists, we tab.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* Header is managed inside tabs or globally? 
                       PipelineForm has its own header. Let's keep it clean.
                   */}
                </div>
            </div>

            <Tabs defaultValue="leads" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="leads" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Leads Management</CardTitle>
                                <CardDescription>Manage your leads and import data.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={`/pipelines/${pipeline.id}/import`}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Leads
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
                                <p>Lead Data Grid will appear here.</p>
                                <p className="text-sm">(Coming soon in Phase 3)</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <PipelineForm
                        initialData={pipeline}
                        clients={clients}
                        isSuperAdmin={isSuperAdmin}
                        readOnly={readOnly}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
