import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null
  return <p className="text-sm text-destructive">{messages[0]}</p>
}
