import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, ...props }: any) => <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
export const CardContent = ({ className, ...props }: any) => <div className={cn("p-6 pt-0", className)} {...props} />;
export const CardHeader = ({ className, ...props }: any) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
export const CardTitle = ({ className, ...props }: any) => <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
export const CardDescription = ({ className, ...props }: any) => <p className={cn("text-sm text-muted-foreground", className)} {...props} />;