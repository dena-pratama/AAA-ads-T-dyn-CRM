import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileBarChart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SpendPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Ad Spend</h2>
            </div>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <p className="text-muted-foreground">
                        Track and manage your advertising costs across platforms.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href="/spend/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Import Data
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Spend Data Grid</CardTitle>
                    <CardDescription>
                        Detailed view of daily ad spend, impressions, and clicks.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                        <FileBarChart className="h-10 w-10 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Spend Grid Module</p>
                        <p className="text-sm">Will be implemented in Phase 3</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
