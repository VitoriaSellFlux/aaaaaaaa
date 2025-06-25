import { memo } from "react"
import { Card } from "@/components/ui/card"

interface Connector {
  name: string
  icon: any
  color: string
  description: string
  category: string
}

interface AddNodePanelProps {
  x: number
  y: number
  onClose: () => void
  connectors: Connector[]
  onSelect: (connector: Connector) => void
}

function AddNodePanel({ x, y, onClose, connectors, onSelect }: AddNodePanelProps) {
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
          <h3 className="text-lg font-semibold">Adicionar Nó</h3>
          <div className="grid gap-2">
            {connectors.map((connector) => (
              <button
                key={connector.name}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={() => {
                  onSelect(connector)
                  onClose()
                }}
              >
                <div className={`${connector.color} p-2 rounded-lg`}>
                  <connector.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{connector.name}</p>
                  <p className="text-xs text-muted-foreground">{connector.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default memo(AddNodePanel) 