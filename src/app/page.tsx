import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function HomePage() {
  return (
    <main className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Pisky Boilerplate</h1>
          <p className="text-muted-foreground text-lg">
            A personalized Next.js 16+ boilerplate with feature-based architecture
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Phase 1 Complete</CardTitle>
              <CardDescription>Project Foundation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Next.js 16, TypeScript, ESLint, Prettier configured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phase 2 In Progress</CardTitle>
              <CardDescription>Styling System</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Tailwind CSS 4, Shadcn UI, Theme support ready
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Documentation</Button>
        </div>
      </div>
    </main>
  );
}
