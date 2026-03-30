import * as React from "react";

import { cn } from "@/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-input bg-background text-foreground transition-smooth placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-ring/20 flex min-h-[80px] w-full resize-y rounded-md border px-4 py-3 text-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
