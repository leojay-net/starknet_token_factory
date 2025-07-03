import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stark-orange)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105",
    {
        variants: {
            variant: {
                default: "bg-[var(--stark-orange)] text-white hover:bg-[var(--stark-orange-dark)] shadow-lg hover:shadow-xl",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
                outline:
                    "border-2 border-[var(--stark-orange)]/30 bg-transparent text-[var(--stark-orange)] hover:bg-[var(--stark-orange)] hover:text-white",
                secondary:
                    "bg-[var(--stark-purple)] text-white hover:bg-[var(--stark-purple-dark)] shadow-lg hover:shadow-xl",
                ghost: "text-[var(--foreground)] hover:bg-[var(--stark-orange)]/10 hover:text-[var(--stark-orange)]",
                link: "text-[var(--stark-orange)] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={`${buttonVariants({ variant, size })} ${className || ''}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
