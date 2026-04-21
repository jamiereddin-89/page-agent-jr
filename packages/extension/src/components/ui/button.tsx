import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80 border border-transparent',
				destructive:
					'bg-destructive text-white hover:bg-destructive/80 border border-transparent',
				outline:
					'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
				ghost: 'hover:bg-accent hover:text-accent-foreground border border-transparent',
				link: 'text-primary underline-offset-4 hover:underline border-transparent',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-lg px-6 has-[>svg]:px-4',
				icon: 'size-9 rounded-lg',
				'icon-sm': 'size-8 rounded-lg',
				'icon-lg': 'size-10 rounded-lg',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
