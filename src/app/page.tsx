import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Simple Header - Attio style */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-5xl mx-auto px-6 items-center justify-between">
          <a href="/" className="font-semibold">Pisky</a>
          <ThemeToggle />
        </div>
      </header>

      <main className="min-h-[calc(100vh-3.5rem)]">
        {/* Hero Section - Attio inspired ultra-minimal */}
        <section className="container max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl space-y-8">
            <Badge variant="secondary" className="text-xs">
              Design System v1.0
            </Badge>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              Pisky Design System
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              An Attio-inspired UI component library. Ultra-clean, typography-driven, and production-ready.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button size="lg" asChild>
                <a href="/ref">View Reference</a>
              </Button>
              <Button variant="outline" size="lg">View Components</Button>
            </div>
          </div>
        </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Components Section */}
      <section className="container max-w-5xl mx-auto px-6 py-24 space-y-16">

        {/* Buttons */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Buttons</h2>
            <p className="text-muted-foreground text-lg">
              Interactive elements with clean variants and smooth transitions.
            </p>
          </div>
          <Card>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">Variants</Label>
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">Sizes</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">States</Label>
                <div className="flex flex-wrap gap-3">
                  <Button>Active</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Elements */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Forms</h2>
            <p className="text-muted-foreground text-lg">
              Clean input components with minimal focus states.
            </p>
          </div>
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="input-example">Input</Label>
                <Input id="input-example" placeholder="Enter your text..." />
              </div>
              <div className="space-y-3">
                <Label htmlFor="input-disabled">Disabled</Label>
                <Input id="input-disabled" placeholder="Disabled input" disabled />
              </div>
              <div className="space-y-3">
                <Label htmlFor="textarea-example">Textarea</Label>
                <Textarea
                  id="textarea-example"
                  placeholder="Enter your message..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Badges</h2>
            <p className="text-muted-foreground text-lg">
              Small status and label components.
            </p>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Cards</h2>
            <p className="text-muted-foreground text-lg">
              Versatile containers with minimal styling.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simple Card</CardTitle>
                <CardDescription>
                  Minimal styling with clean borders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Clean cards with minimal shadows and generous whitespace.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">With Badge</CardTitle>
                  <Badge variant="success">Active</Badge>
                </div>
                <CardDescription>Status indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards can include badges to show status information.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="default" size="sm">Save</Button>
                <Button variant="ghost" size="sm">Cancel</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interactive</CardTitle>
                <CardDescription>Flexible layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Versatile containers for any content type.
                </p>
              </CardContent>
              <CardFooter>
                <Input placeholder="Quick input..." />
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Features Section */}
      <section className="container max-w-5xl mx-auto px-6 py-24">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Design Principles</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              What makes this design system unique.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Ultra-Clean</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Minimal borders, subtle shadows, and generous whitespace create a refined, professional aesthetic.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Typography-Driven</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Inter font family with optimized metrics for excellent readability and visual hierarchy.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Accessible</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                WCAG AA compliant with proper focus states, contrast ratios, and keyboard navigation.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Smooth Transitions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Purposeful animations with 150ms timing for a polished, responsive feel.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Dark Mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built-in dark mode support with carefully optimized colors for both themes.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Production Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built on Radix UI primitives with full TypeScript support and comprehensive variants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Built with Next.js 16, Tailwind CSS 4, and Radix UI
            </p>
            <p className="text-sm text-muted-foreground">
              Inspired by Attio
            </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
