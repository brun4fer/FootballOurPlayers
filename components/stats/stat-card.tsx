import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-[var(--font-heading)] text-2xl text-cyan-200">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">{description}</CardContent>
      ) : null}
    </Card>
  );
}
