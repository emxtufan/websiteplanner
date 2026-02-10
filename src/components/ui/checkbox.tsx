
import React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="relative inline-flex items-center group">
      <input 
        type="checkbox" 
        className="peer sr-only"
        ref={ref} 
        checked={checked}
        onChange={handleChange}
        {...props} 
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Base state
          "bg-background text-transparent transition-colors flex items-center justify-center cursor-pointer",
          // Checked state styles applied via props or peer-checked
          checked ? "bg-primary text-primary-foreground" : "peer-checked:bg-primary peer-checked:text-primary-foreground",
          className
        )}
        onClick={() => {
           // This div is visual only, the label or input handles the click logic mostly.
           // However, if there is no ID/Label, we might need to manually trigger input click in some cases,
           // but wrapping in a label is best practice.
        }}
      >
        <Check className={cn("h-3 w-3", checked ? "opacity-100" : "opacity-0 peer-checked:opacity-100")} />
      </div>
      {/* Overlay label to ensure clicking the box triggers the input */}
      <label htmlFor={props.id} className="absolute inset-0 cursor-pointer" />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
