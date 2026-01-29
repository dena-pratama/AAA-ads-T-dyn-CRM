"use client";

import React, { forwardRef, useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { ArrowLeft, User, Share2, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode; label?: string; style?: React.CSSProperties }
>(({ className, children, label, style }, ref) => {
    return (
        <div className="flex flex-col items-center gap-2 z-10">
            <div
                ref={ref}
                style={style}
                className={cn(
                    "z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-black/90 p-3 shadow-[0_0_30px_-5px_var(--glow-color,theme(colors.blue.500/0.5))] transition-all hover:scale-110 hover:shadow-[0_0_50px_-10px_var(--glow-color,theme(colors.blue.500/0.8))]",
                    className,
                )}
            >
                {children}
            </div>
            {label && (
                <span className="text-sm font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {label}
                </span>
            )}
        </div>
    );
});

Circle.displayName = "Circle";

interface Stage {
    id: string;
    name: string;
    color: string;
    isGoal: boolean;
}

interface PipelineFlowProps {
    pipelineName: string;
    stages: Stage[];
}

export function PipelineFlow({ pipelineName, stages }: PipelineFlowProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    // Create stable ref objects for each stage
    // Create stable ref objects for each stage
    const stageNodeRefs = useMemo(() =>
        stages.map(() => React.createRef<HTMLDivElement>()),
        [stages]
    );
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Delay setting isReady to ensure refs are fully populated and layout is settled
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const getIcon = (name: string, isGoal: boolean) => {
        const lower = name.toLowerCase();
        if (isGoal) return <CheckCircle className="h-6 w-6 text-green-500" />;
        if (lower.includes("lead")) return <User className="h-6 w-6 text-blue-500" />;
        if (lower.includes("deal") || lower.includes("offer")) return <DollarSign className="h-6 w-6 text-yellow-500" />;
        if (lower.includes("contact")) return <Share2 className="h-6 w-6 text-purple-500" />;
        return <div className="h-4 w-4 bg-muted-foreground/30 rounded-full" />;
    };

    return (
        <div className="w-full h-screen bg-neutral-950 flex flex-col relative overflow-hidden text-foreground">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Radial Gradient for focus */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.15),rgba(0,0,0,0)_50%)]" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 p-6 z-50 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 hover:text-white">
                    <Link href="/pipelines">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        {pipelineName}
                    </h1>
                    <p className="text-sm text-gray-400">Flow Visualization</p>
                </div>
            </div>

            {/* Flow Diagram */}
            <div
                className="relative flex h-full w-full items-center justify-center p-10"
                ref={containerRef}
            >
                <div className="flex flex-row items-center justify-center gap-16 max-w-full overflow-x-auto pb-12 pt-12 px-10">
                    {/* Source Node */}
                    <div className="relative">
                        <Circle ref={inputRef} className="border-indigo-500 text-white z-20 bg-black" label="Source">
                            <User className="h-6 w-6 text-indigo-400" />
                        </Circle>
                    </div>

                    {/* Stages mapped linearly */}
                    {stages.map((stage, index) => (
                        <div key={stage.id} className="relative z-20">
                            <Circle
                                ref={stageNodeRefs[index]}
                                className="bg-black text-white"
                                style={{
                                    borderColor: stage.color || '#3b82f6',
                                    '--glow-color': stage.color || '#3b82f6'
                                } as React.CSSProperties}
                                label={stage.name}
                            >
                                {getIcon(stage.name, stage.isGoal)}
                            </Circle>
                        </div>
                    ))}
                </div>

                {/* Beams */}
                {/* Render beams only when component is ready (refs are populated) */}
                {isReady && stages.length > 0 && stageNodeRefs[0] && (
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={inputRef}
                        toRef={stageNodeRefs[0] as React.RefObject<HTMLElement>}
                        curvature={0}
                        endYOffset={0}
                    />
                )}

                {/* Stage to Stage */}
                {isReady && stages.map((_, index) => {
                    if (index < stages.length - 1) {
                        return (
                            <AnimatedBeam
                                key={`beam-${index}`}
                                containerRef={containerRef}
                                fromRef={stageNodeRefs[index] as React.RefObject<HTMLElement>}
                                toRef={stageNodeRefs[index + 1] as React.RefObject<HTMLElement>}
                                curvature={0} // Straight line
                            />
                        );
                    }
                    return null;
                })}

            </div>
        </div>
    );
}
