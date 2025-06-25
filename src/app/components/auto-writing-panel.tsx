"use client"
import { memo, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, X } from "lucide-react"

interface AutoWritingItem {
  id: number
  title: string
  text: string
  preview: string
  category: "padrao" | "personalizado" | string // Allow other categories
}

interface AutoWritingPanelProps {
  show: boolean
  onClose: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
  autoWritings: AutoWritingItem[]
  onApplyWriting: (writing: AutoWritingItem) => void
}

const AutoWritingPanel = memo(function AutoWritingPanel({
  show,
  onClose,
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  autoWritings,
  onApplyWriting,
}: AutoWritingPanelProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (show && searchInputRef.current) {
      onSearchChange("") // Clear search on open
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [show, onSearchChange])

  const filteredAutoWritings = useMemo(() => {
    return autoWritings.filter(
      (writing) =>
        writing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writing.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writing.preview.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [autoWritings, searchTerm])

  if (!show) {
    return null
  }

  return (
    <div className="auto-writing-sidebar fixed right-96 top-16 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 shadow-lg z-40 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-50">Escritas Automáticas</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            ref={searchInputRef}
            placeholder="Pesquisar variáveis..."
            className="pl-10 bg-zinc-800 border-zinc-700 placeholder-zinc-400 text-zinc-50"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="padrao">Padrão</TabsTrigger>
              <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <TabsContent value="todos" className="h-full overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredAutoWritings.map((writing) => (
                  <Card
                    key={writing.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                    onClick={() => onApplyWriting(writing)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-zinc-50 text-sm">{writing.text}</p>
                        <p className="text-xs text-zinc-400">{writing.preview}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="padrao" className="h-full overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredAutoWritings
                  .filter((w) => w.category === "padrao")
                  .map((writing) => (
                    <Card
                      key={writing.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-all border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                      onClick={() => onApplyWriting(writing)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-50 text-sm">{writing.text}</p>
                          <p className="text-xs text-zinc-400">{writing.preview}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="personalizado" className="h-full overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredAutoWritings
                  .filter((w) => w.category === "personalizado")
                  .map((writing) => (
                    <Card
                      key={writing.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-all border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
                      onClick={() => onApplyWriting(writing)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-50 text-sm">{writing.text}</p>
                          <p className="text-xs text-zinc-400">{writing.preview}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
})

export default AutoWritingPanel
