"use client";

import React, { forwardRef, useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { ArrowLeft, User, Share2, DollarSign, CheckCircle, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode; label?: string; style?: React.CSSProperties; isDark?: boolean; isMobile?: boolean }
>(({ className, children, label, style, isDark = true, isMobile = false }, ref) => {
    return (
        <div className="flex flex-col items-center gap-1 md:gap-2 z-10">
            <div
                ref={ref}
                style={style}
                className={cn(
                    "z-10 flex items-center justify-center rounded-full border-2 shadow-[0_0_30px_-5px_var(--glow-color,theme(colors.blue.500/0.5))] transition-all hover:scale-110 hover:shadow-[0_0_50px_-10px_var(--glow-color,theme(colors.blue.500/0.8))]",
                    isMobile ? "h-10 w-10 p-2" : "h-16 w-16 p-3",
                    isDark ? "bg-black/90" : "bg-white/90",
                    className,
                )}
            >
                {children}
            </div>
            {label && (
                <span className={cn(
                    "font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm text-center max-w-[80px] md:max-w-none truncate",
                    isMobile ? "text-xs" : "text-sm",
                    isDark ? "text-gray-300 bg-black/50" : "text-gray-700 bg-white/80"
                )}>
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
    const stageNodeRefs = useMemo(() =>
        stages.map(() => React.createRef<HTMLDivElement>()),
        [stages]
    );
    const [isReady, setIsReady] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getIcon = (name: string, isGoal: boolean) => {
        const lower = name.toLowerCase();
        const iconClass = isMobile ? "h-4 w-4" : "h-6 w-6";
        if (isGoal) return <CheckCircle className={cn(iconClass, "text-green-500")} />;
        if (lower.includes("lead")) return <User className={cn(iconClass, "text-blue-500")} />;
        if (lower.includes("deal") || lower.includes("offer")) return <DollarSign className={cn(iconClass, "text-yellow-500")} />;
        if (lower.includes("contact")) return <Share2 className={cn(iconClass, "text-purple-500")} />;
        return <div className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "bg-muted-foreground/30 rounded-full")} />;
    };

    return (
        <div className={cn(
            "w-full h-screen flex flex-col relative overflow-hidden transition-colors duration-300",
            isDarkMode ? "bg-neutral-950 text-white" : "bg-gray-100 text-gray-900"
        )}>
            {/* Background Effect */}
            <div className={cn(
                "absolute inset-0 z-0",
                isDarkMode ? "bg-black" : "bg-gray-50"
            )}>
                {/* Radial Gradient for focus */}
                <div className={cn(
                    "absolute inset-0",
                    isDarkMode
                        ? "bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.15),rgba(0,0,0,0)_50%)]"
                        : "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),rgba(255,255,255,0)_50%)]"
                )} />
                {/* Grid Pattern */}
                <div className={cn(
                    "absolute inset-0 bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
                    isDarkMode
                        ? "bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]"
                        : "bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]"
                )} />
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 p-4 md:p-6 z-50 flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" asChild className={cn(
                    "h-8 w-8 md:h-10 md:w-10",
                    isDarkMode
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                )}>
                    <Link href="/pipelines">
                        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </Link>
                </Button>
                <div>
                    <h1 className={cn(
                        "font-bold bg-clip-text text-transparent bg-gradient-to-r",
                        isMobile ? "text-lg" : "text-2xl",
                        isDarkMode
                            ? "from-white to-gray-500"
                            : "from-gray-900 to-gray-500"
                    )}>
                        {pipelineName}
                    </h1>
                    <p className={cn(
                        isDarkMode ? "text-gray-400" : "text-gray-600",
                        isMobile ? "text-xs" : "text-sm"
                    )}>
                        Flow Visualization
                    </p>
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-4 md:top-6 right-4 md:right-6 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                        "rounded-full transition-colors h-8 w-8 md:h-10 md:w-10",
                        isDarkMode
                            ? "bg-black/50 border-gray-700 text-white hover:bg-white/10"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    )}
                >
                    {isDarkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>
            </div>

            {/* Flow Diagram */}
            <div
                className="relative flex h-full w-full items-center justify-center p-4 md:p-10"
                ref={containerRef}
            >
                {/* Mobile: Vertical layout, Desktop: Horizontal layout */}
                <div className={cn(
                    "flex items-center justify-center max-w-full overflow-auto",
                    isMobile
                        ? "flex-col gap-6 py-20 px-4"
                        : "flex-row gap-16 pb-12 pt-12 px-10"
                )}>
                    {/* Source Node */}
                    <div className="relative">
                        <Circle
                            ref={inputRef}
                            className={cn(
                                "border-indigo-500 z-20",
                                isDarkMode ? "bg-black" : "bg-white"
                            )}
                            label="Source"
                            isDark={isDarkMode}
                            isMobile={isMobile}
                        >
                            <User className={cn(
                                isMobile ? "h-4 w-4" : "h-6 w-6",
                                isDarkMode ? "text-indigo-400" : "text-indigo-600"
                            )} />
                        </Circle>
                    </div>

                    {/* Stages mapped linearly */}
                    {stages.map((stage, index) => (
                        <div key={stage.id} className="relative z-20">
                            <Circle
                                ref={stageNodeRefs[index]}
                                className={isDarkMode ? "bg-black text-white" : "bg-white text-gray-900"}
                                style={{
                                    borderColor: stage.color || '#3b82f6',
                                    '--glow-color': stage.color || '#3b82f6'
                                } as React.CSSProperties}
                                label={stage.name}
                                isDark={isDarkMode}
                                isMobile={isMobile}
                            >
                                {getIcon(stage.name, stage.isGoal)}
                            </Circle>
                        </div>
                    ))}
                </div>

                {/* Beams - slower duration (4 seconds) */}
                {isReady && stages.length > 0 && stageNodeRefs[0] && (
                    <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={inputRef}
                        toRef={stageNodeRefs[0] as React.RefObject<HTMLElement>}
                        curvature={0}
                        endYOffset={0}
                        duration={4}
                        gradientStartColor="#6366f1"
                        gradientStopColor="#22d3ee"
                        pathWidth={isMobile ? 2 : 3}
                        pathColor={isDarkMode ? "gray" : "#d1d5db"}
                    />
                )}

                {/* Stage to Stage - slower duration */}
                {isReady && stages.map((stage, index) => {
                    if (index < stages.length - 1) {
                        return (
                            <AnimatedBeam
                                key={`beam-${index}`}
                                containerRef={containerRef}
                                fromRef={stageNodeRefs[index] as React.RefObject<HTMLElement>}
                                toRef={stageNodeRefs[index + 1] as React.RefObject<HTMLElement>}
                                curvature={0}
                                duration={4 + index * 0.5}
                                delay={0.3 * (index + 1)}
                                gradientStartColor={stage.color || "#6366f1"}
                                gradientStopColor={stages[index + 1]?.color || "#22d3ee"}
                                pathWidth={isMobile ? 2 : 3}
                                pathColor={isDarkMode ? "gray" : "#d1d5db"}
                            />
                        );
                    }
                    return null;
                })}

            </div>
        </div>
    );
}
