import { APP_NAME } from '@/lib/constants'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">Monitor and analyze your MCP servers</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
