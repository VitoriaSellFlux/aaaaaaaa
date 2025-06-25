"use client"
import { memo, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectorItem {
  name: string
  icon: LucideIcon
  color: string
  description: string
  category: string
}

interface ConnectorCategory {
  category: string
  shortName: string
  icon: LucideIcon
  description: string
  items: Omit<ConnectorItem, "category">[]
}

interface AddNodePanelProps {
  show: boolean
  x: number
  y: number
  searchTerm: string
  onSearchChange: (term: string) => void
  onClose: () => void
  onAddNode: (item: ConnectorItem) => void
  connectors: ConnectorCategory[]
  allConnectors: ConnectorItem[]
}

const AddNodePanel = memo(function AddNodePanel({
  show,
  x,
  y,
  searchTerm,
  onSearchChange,
  onClose,
  onAddNode,
  connectors,
  allConnectors,
}: AddNodePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (show && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [show])

  useEffect(() => {
    const handleClickOutsidePanel = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".custom-node-plus-button") &&
        show
      ) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutsidePanel)
    } else {
      document.removeEventListener("mousedown", handleClickOutsidePanel)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsidePanel)
    }
  }, [show, onClose])

  const filteredConnectorsByCategory = useMemo(() => {
    return (categoryItems: Omit<ConnectorItem, "category">[]) =>
      categoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
  }, [searchTerm])

  const filteredAllConnectorsMemo = useMemo(() => {
    return allConnectors.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [allConnectors, searchTerm])

  if (!show) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className="fixed bg-background/95 backdrop-blur-md text-foreground shadow-2xl z-20 flex flex-col"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: "400px",
        maxHeight: "380px",
        borderRadius: "12px",
        border: "1px solid hsl(var(--border) / 0.2)",
      }}
    >
      <div className="p-4 bg-gradient-to-r from-background/80 to-muted/20 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground text-base">Adicionar Conector</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-muted/50 rounded-full"
            onClick={onClose}
            aria-label="Fechar painel"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Pesquisar conectores..."
            className="pl-10 pr-4 h-10 bg-muted/30 border-0 placeholder:text-muted-foreground text-foreground w-full rounded-lg shadow-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 transition-all"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pb-4">
          <Tabs defaultValue="Todos" className="flex flex-col h-full">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1 gap-1 bg-muted/30 rounded-lg mb-3 border-0">
              <TabsTrigger
                value="Todos"
                className="flex items-center justify-center py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-muted-foreground text-xs h-8 rounded-md transition-all border-0 font-medium"
              >
                <span>Todos</span>
              </TabsTrigger>
              {connectors.map((category) => (
                <TabsTrigger
                  key={category.category}
                  value={category.category}
                  className="flex items-center justify-center py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-muted-foreground text-xs h-8 rounded-md transition-all border-0 font-medium"
                >
                  <span>{category.shortName}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div
              className="flex-1 overflow-y-auto max-h-[240px]"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#71717a #27272a" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar { width: 6px; }
                div::-webkit-scrollbar-track { background: #27272a; border-radius: 3px; }
                div::-webkit-scrollbar-thumb { background: #71717a; border-radius: 3px; }
                div::-webkit-scrollbar-thumb:hover { background: #52525b; }
              `}</style>
              <TabsContent value="Todos" className="h-full p-0 mt-0 pr-2">
                <div className="grid grid-cols-3 gap-3">
                  {filteredAllConnectorsMemo.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="p-2 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 hover:bg-muted/50 bg-muted/20 min-h-[50px] flex flex-col items-center justify-center text-center group rounded-lg backdrop-blur-sm"
                      onClick={() => onAddNode(item)}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            item.color,
                            "p-2 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md w-8 h-8",
                          )}
                        >
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <p className="font-medium text-foreground text-xs truncate leading-tight">{item.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              {connectors.map((category) => (
                <TabsContent key={category.category} value={category.category} className="h-full p-0 mt-0 pr-2">
                  <div className="grid grid-cols-3 gap-3">
                    {filteredConnectorsByCategory(category.items).map((item) => (
                      <div
                        key={item.name}
                        className="p-2 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 hover:bg-muted/50 bg-muted/20 min-h-[50px] flex flex-col items-center justify-center text-center group rounded-lg backdrop-blur-sm"
                        onClick={() => onAddNode(item as ConnectorItem)}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div
                            className={cn(
                              item.color,
                              "p-2 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md w-8 h-8",
                            )}
                          >
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 w-full">
                            <p className="font-medium text-foreground text-xs truncate leading-tight">{item.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
})

export default AddNodePanel
