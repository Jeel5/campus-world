import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3]">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#17141d] via-[#100f12] to-[#131116]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_20%,rgba(244,63,94,0.08),transparent_40%)]" />
      
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-rose-200">
            Loading...
          </div>
          <div className="space-y-2">
            <div className="h-12 w-64 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        
        <Card className="bg-[#15181d] border-white/5 p-20 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-rose-500" />
          <p className="mt-4 text-white/60">Loading posts...</p>
        </Card>
      </div>
    </div>
  )
}
