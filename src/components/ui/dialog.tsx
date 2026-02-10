import React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null)

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  return (
    <DialogContext.Provider value={{ open: !!isOpen, onOpenChange: setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export const DialogTrigger = ({ asChild, children, ...props }: any) => {
    const context = React.useContext(DialogContext)
    const child = asChild ? React.Children.only(children) : children
    
    if (!context) return <>{children}</>

    return React.cloneElement(child as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
            child.props.onClick?.(e)
            context.onOpenChange(true)
        },
        ...props
    })
}

export const DialogContent = ({ className, children, ...props }: any) => {
    const context = React.useContext(DialogContext)
    
    if (!context?.open) return null

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                onClick={() => context.onOpenChange(false)} 
            />
            {/* Content */}
            <div 
                className={cn(
                    "relative z-[1000] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-90 zoom-in-95 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-black/10 dark:bg-white/10 p-1"
                    onClick={() => context.onOpenChange(false)}
                >
                    <X className="h-4 w-4 text-white" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>,
        document.body
    )
}

export const DialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }: any) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

export const DialogDescription = ({ className, ...props }: any) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)