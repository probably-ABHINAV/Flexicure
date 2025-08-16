export const metadata = {
  title: "Status – Flexicure",
  description: "Platform status and uptime.",
}

export default function StatusPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Status</h1>
      <p className="mt-2 text-muted-foreground">
        All systems operational. Health check endpoint:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">/api/health</code>
      </p>
    </div>
  )
}
