"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const inputBase =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, fullWidth = true, type = "text", ...props },
    ref
  ) => {
    const control = (
      <input
        ref={ref}
        type={type}
        className={cn(
          inputBase,
          fullWidth && "w-full",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    )

    if (!label && !error) {
      return control
    }

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        {control}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input
