"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Plus } from "lucide-react"

interface AddButtonData {
  parentId: string
}

function AddButton({ data }: NodeProps<AddButtonData>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 dark:!bg-gray-600 border-2 border-white dark:border-gray-900"
      />

      <div className="flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer flex items-center justify-center">
          <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </>
  )
}

export default memo(AddButton)
