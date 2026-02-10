
import React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"
import Button from "./button"

const AlertDialogContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null)

export const AlertDialog = ({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  return (
    <AlertDialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export const AlertDialogTrigger = ({ asChild, children, className, ...props }: any) => {
  const context = React.useContext(AlertDialogContext)
  const child = asChild ? React.Children.only(children) : children
  
  if (!context) return <>{children}</>

  return React.cloneElement(child as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e)
        context.setOpen(true)
    },
    ...props
  })
}

export const AlertDialogContent = ({ className, children, ...props }: any) => {
    const context = React.useContext(AlertDialogContext)
    
    // Fix: Do not render anything if closed
    if (!context?.open) return null

    // Render via Portal to ensure z-index works correctly over the entire app
    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" 
                onClick={() => context.setOpen(false)} 
            />
            {/* Content */}
            <div 
                className={cn("relative z-[1000] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg animate-in fade-in-90 zoom-in-95 sm:rounded-lg md:w-full", className)} 
                {...props}
            >
                {children}
            </div>
        </div>,
        document.body
    )
}

export const AlertDialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

export const AlertDialogFooter = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

export const AlertDialogTitle = ({ className, ...props }: any) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
)

export const AlertDialogDescription = ({ className, ...props }: any) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

export const AlertDialogAction = ({ className, onClick, ...props }: any) => {
    const context = React.useContext(AlertDialogContext)
    return (
        <Button 
            className={cn(className)} 
            onClick={(e: any) => {
                onClick?.(e)
                context?.setOpen(false)
            }} 
            {...props} 
        />
    )
}

export const AlertDialogCancel = ({ className, onClick, ...props }: any) => {
    const context = React.useContext(AlertDialogContext)
    return (
        <Button 
            variant="outline" 
            className={cn("mt-2 sm:mt-0", className)} 
            onClick={(e: any) => {
                onClick?.(e)
                context?.setOpen(false)
            }} 
            {...props} 
        />
    )
}
