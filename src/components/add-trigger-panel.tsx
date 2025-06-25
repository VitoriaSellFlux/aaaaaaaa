import { memo } from "react"
import { Card } from "@/components/ui/card"

interface Trigger {
  name: string
  icon: any
  color: string
  description: string
  category: string
}

interface AddTriggerPanelProps {
  x: number
  y: number
  onClose: () => void
  triggers: Trigger[]
  onSelect: (trigger: Trigger) => void
}

function AddTriggerPanel({ x, y, onClose, triggers, onSelect }: AddTriggerPanelProps) {
  return (
    <div
      className="fixed z-50"
      style={{
        left: x,
        top: y,
      }}
    >
      <Card className="w-[300px] p-4 bg-background">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Adicionar Gatilho</h3>
          <div className="grid gap-2">
            {triggers.map((trigger) => (
              <button
                key={trigger.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={() => {
                  onSelect(trigger)
                  onClose()
                }}
              >
                <div className={`${trigger.color} p-2 rounded-lg`}>
                  <trigger.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{trigger.name}</p>
                  <p className="text-xs text-muted-foreground">{trigger.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default memo(AddTriggerPanel) 