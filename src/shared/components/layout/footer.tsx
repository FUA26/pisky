import { ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="border-border/40 border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
          Built with{" "}
          <a href="#" className="font-medium underline underline-offset-4">
            Pisky Boilerplate
          </a>
        </p>
        {children}
      </div>
    </footer>
  );
}
