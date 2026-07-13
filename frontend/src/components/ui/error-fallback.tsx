import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {onReset && (
          <Button onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
