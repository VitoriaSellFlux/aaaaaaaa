"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card } from "@/components/ui/card"
import { Plus, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomNodeData {
  label: string
  icon: any
  color: string // This is a Tailwind background color class e.g., "bg-green-500"
  nodeType:
    | "trigger"
    | "action"
    | "condition"
    | "error"
    | "trigger-placeholder"
    | "another-trigger-placeholder"
    | "add-button"
    | "end-text"
  showAddButton?: boolean
  onAddClick?: () => void
  onConfigClick?: (nodeData: CustomNodeData, nodeId: string) => void
}

function CustomNode({ data, selected, id }: NodeProps<CustomNodeData>) {
  const { label, icon: Icon, color, nodeType, showAddButton, onAddClick } = data

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case "trigger":
        return "Gatilho entrada"
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

  if (nodeType === "trigger-placeholder") {
    return (
      <Card
        className="p-4 min-w-[200px] cursor-pointer bg-primary/10 border-primary/50 border-dashed hover:bg-primary/20 transition-all"
        onClick={() => data.onConfigClick?.(data, id)}
      >
        <div className="flex items-center justify-center gap-3">
          <Plus className="h-4 w-4 text-primary" />
          <p className="font-medium text-sm text-primary">{label}</p>
        </div>
      </Card>
    )
  }

  if (nodeType === "another-trigger-placeholder") {
    return (
      <>
        <Card
          className="p-4 w-[200px] cursor-pointer bg-transparent border-border border-dashed hover:bg-accent transition-all"
          onClick={() => data.onConfigClick?.(data, id)}
        >
          <div className="flex items-center justify-center">
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </Card>
      </>
    )
  }

  if (nodeType === "add-button") {
    const isVisible = data.showAddButton !== false

    // When the button is "hidden", we still render the handles but change their opacity to 0.
    // This makes them invisible but keeps them in the DOM, so React Flow doesn't break the edges.
    // The clickable "+" icon is only rendered when it's supposed to be visible.
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ opacity: isVisible ? 1 : 0 }}
        />
        {isVisible && (
          <div
            className="h-8 w-8 rounded-full bg-card border-2 border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex items-center justify-center custom-node-plus-button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              data.onConfigClick?.()
            }}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ opacity: isVisible ? 1 : 0 }}
        />
      </>
    )
  }

  if (nodeType === "end-text") {
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
        />
        <div className="flex items-center justify-center text-sm text-muted-foreground automation-end-text-visual-indicator">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>A automação é encerrada</span>
        </div>
      </>
    )
  }

  return (
    <>
      {(data.nodeType === "action" || data.nodeType === "condition" || data.nodeType === "error") && (
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
            data.onConfigClick?.(data, id)
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

      {(nodeType === "trigger" || nodeType === "action" || nodeType === "condition" || nodeType === "error") && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ opacity: showAddButton ? 0 : 1 }}
        />
      )}
    </>
  )
}

export default memo(CustomNode) 