export const dynamic = "force-dynamic";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  );
}
