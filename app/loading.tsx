import { Loader2Icon } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2Icon className="h-10 w-10 animate-spin text-gray-500" />
    </div>
  )
}
