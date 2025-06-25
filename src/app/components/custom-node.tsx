"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomNodeData {
  label: string
  icon: any
  color: string // This is a Tailwind background color class e.g., "bg-green-500"
  nodeType: "trigger" | "action" | "condition" | "error"
  showAddButton?: boolean
  onAddClick?: () => void
  isInitialTrigger?: boolean
  onConfigClick?: (nodeData: CustomNodeData) => void
}

function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const { label, icon: Icon, color, nodeType, showAddButton, onAddClick, isInitialTrigger } = data

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case "trigger":
        return "Gatilho"
      case "action":
        return "Ação"
      case "condition":
        return "Condição"
      case "error":
        return "Tratamento de erro"
      default:
        return "Nó"
    }
  }

  return (
    <>
      {!isInitialTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
        />
      )}

      <div className="flex flex-col items-center">
        <Card
          className={cn(
            "p-4 min-w-[200px] transition-all cursor-pointer bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
            selected ? "ring-2 ring-ring shadow-lg" : "shadow-md hover:shadow-lg",
            nodeType === "error" ? "border-destructive bg-destructive/10 text-destructive-foreground" : "",
          )}
          onClick={(e) => {
            e.stopPropagation()
            data.onConfigClick?.(data)
          }}
        >
          <div className="flex items-center gap-3">
            <div className={cn(color, "p-2 rounded-lg flex items-center justify-center")}>
              <Icon className="h-4 w-4 text-white" /> {/* Assuming icons on colored bg are white */}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{getNodeTypeLabel(nodeType)}</p>
            </div>
          </div>
        </Card>

        {showAddButton && (
          <div className="flex flex-col items-center mt-2">
            <div className="w-0.5 h-4 bg-border"></div>
            <div
              className="h-8 w-8 rounded-full bg-card border-2 border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex items-center justify-center custom-node-plus-button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onAddClick?.()
              }}
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground border-2 border-background"
        style={{ opacity: 0 }}
      />
    </>
  )
}

export default memo(CustomNode)
