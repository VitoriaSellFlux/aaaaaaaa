import { memo } from "react"
import { Card } from "@/components/ui/card"

interface AutoWriting {
  id: number
  title: string
  text: string
  preview: string
  category: string
}

interface AutoWritingPanelProps {
  nodeId: string | null
  onClose: () => void
  autoWritings: AutoWriting[]
}

function AutoWritingPanel({ nodeId, onClose, autoWritings }: AutoWritingPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-[500px] p-6 bg-background">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Texto Automático</h3>
          <div className="grid gap-4">
            {autoWritings.map((writing) => (
              <button
                key={writing.id}
                className="flex flex-col gap-1 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                onClick={() => {
                  // Handle selection
                  onClose()
                }}
              >
                <p className="font-medium text-sm">{writing.title}</p>
                <p className="text-xs text-muted-foreground">{writing.preview}</p>
                <p className="text-xs font-mono bg-accent/50 p-1 rounded mt-1">{writing.text}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default memo(AutoWritingPanel) 