"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from "react"
import {
  Search,
  ArrowLeft,
  MessageSquare,
  Mail,
  Smartphone,
  Zap,
  Database,
  Webhook,
  Code,
  BarChart3,
  Phone,
  Timer,
  Tag,
  CheckCircle,
  XCircle,
  StickyNote,
  Copy,
  Users,
  X,
  Plus,
  MousePointer,
  Hand,
  RotateCcw,
  Minus,
  Pencil,
  RefreshCw,
  ListChecks,
  HelpCircle,
  Trash2,
  Map,
  Grid3x3,
  Download,
  CalendarIcon as LucideCalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import CustomNode from "./components/custom-node"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Lazy load components
const AddNodePanel = lazy(() => import("./components/add-node-panel"))
const WhatsAppConfig = lazy(() => import("./components/whatsapp-config"))
const AutoWritingPanel = lazy(() => import("./components/auto-writing-panel"))

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// Static data defined outside the component
const staticConnectors = [
  {
    category: "Canais",
    shortName: "Canais",
    icon: MessageSquare,
    description: "Por onde você se comunica",
    items: [
      { name: "WhatsApp", icon: MessageSquare, color: "bg-green-500", description: "Mensagens WhatsApp" },
      { name: "WhatsApp Oficial", icon: MessageSquare, color: "bg-green-600", description: "API Oficial WhatsApp" },
      { name: "SMS", icon: Smartphone, color: "bg-gray-500", description: "Mensagens SMS" },
      { name: "Email", icon: Mail, color: "bg-red-500", description: "Email Marketing" },
      { name: "Performance", icon: Mail, color: "bg-orange-500", description: "Email com performance otimizada" },
      { name: "Torpedo de Voz", icon: Phone, color: "bg-purple-500", description: "Mensagens de voz" },
    ],
  },
  {
    category: "Ações",
    shortName: "Ações",
    icon: Tag,
    description: "O que você faz com os contatos",
    items: [
      { name: "Tag", icon: Tag, color: "bg-yellow-600", description: "Marcação de contatos" },
      { name: "Tag Add", icon: Tag, color: "bg-green-700", description: "Adicionar tags" },
      { name: "Tag Remove", icon: Tag, color: "bg-red-700", description: "Remover tags" },
      { name: "Nota", icon: StickyNote, color: "bg-amber-500", description: "Anotações e lembretes" },
      { name: "Clonar", icon: Copy, color: "bg-gray-700", description: "Duplicar elementos" },
      { name: "Email Aberto", icon: Mail, color: "bg-gray-700", description: "Detectar abertura de email" },
      { name: "Marketing", icon: BarChart3, color: "bg-gray-600", description: "Métricas de marketing" },
      { name: "Pixel", icon: Code, color: "bg-pink-500", description: "Tracking de eventos" },
      { name: "CRM", icon: Users, color: "bg-indigo-600", description: "Gestão de relacionamento" },
    ],
  },
  {
    category: "Controles",
    shortName: "Controles",
    icon: Zap,
    description: "Como você gerencia o fluxo",
    items: [
      { name: "Condições", icon: Database, color: "bg-indigo-500", description: "Lógica condicional" },
      { name: "Timer", icon: Timer, color: "bg-gray-600", description: "Atrasos e agendamentos" },
      { name: "Aquecimento", icon: Zap, color: "bg-purple-600", description: "Preparação de conta" },
      { name: "Webhook", icon: Webhook, color: "bg-gray-500", description: "Integrações HTTP" },
      { name: "Sucesso", icon: CheckCircle, color: "bg-green-600", description: "Condição de sucesso" },
      { name: "Falha", icon: XCircle, color: "bg-red-600", description: "Tratamento de erro" },
      { name: "Avançado", icon: BarChart3, color: "bg-purple-700", description: "Análises avançadas" },
    ],
  },
]

const staticAllConnectors = staticConnectors.flatMap((category) =>
  category.items.map((item) => ({ ...item, category: category.category })),
)

const staticStandardAutoWritings = [
  { id: 1, title: "Nome", text: "{{nome}}", preview: "Insere o nome do lead", category: "padrao" },
  { id: 2, title: "Sobrenome", text: "{{sobrenome}}", preview: "Insere o sobrenome do lead", category: "padrao" },
]
const staticCustomAutoWritings = [
  { id: 7, title: "Teste Lead", text: "{{teste.lead}}", preview: "Campo de teste do lead", category: "personalizado" },
]
const staticAutoWritings = [...staticStandardAutoWritings, ...staticCustomAutoWritings]

interface AddNodePanelState {
  show: boolean
  x: number
  y: number
  parentNodeId: string | null
}

function MarketingAutomationFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [addNodePanelState, setAddNodePanelState] = useState<AddNodePanelState>({
    show: false,
    x: 0,
    y: 0,
    parentNodeId: null,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autoWritingSearchRef = useRef<HTMLInputElement>(null)
  const [campaignActive, setCampaignActive] = useState(true)
  const [activeAutoWritingTab, setActiveAutoWritingTab] = useState("todos")
  const [isMinimapVisible, setIsMinimapVisible] = useState(false)
  const [interactionMode, setInteractionMode] = useState<"select" | "move">("select")
  const [isGridVisible, setIsGridVisible] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)

  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedNodesIds, setSelectedNodesIds] = useState<string[]>([])
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, nodeId: "" })
  const [showEventsModal, setShowEventsModal] = useState(false)
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)
  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showActionHistoryModal, setShowActionHistoryModal] = useState(false)

  const reactFlowInstance = useReactFlow()
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null)
  const addNodePanelRef = useRef<HTMLDivElement>(null)

  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false)
  const [showAutoWritingPanel, setShowAutoWritingPanel] = useState(false) // Changed from showAutoWriting
  const [autoWritingSearch, setAutoWritingSearch] = useState("")
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)
  const [messageBlocks, setMessageBlocks] = useState([
    { id: Date.now(), type: "text", content: "", placeholder: "Digite aqui..." },
  ])
  const [scheduleDateLimit, setScheduleDateLimit] = useState(false)
  const [scheduleTimeInterval, setScheduleTimeInterval] = useState(false)
  const [stageName, setStageName] = useState("whatsapp")
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined)
  const [showMessagePreview, setShowMessagePreview] = useState(false)

  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false)
  const [campaignName, setCampaignName] = useState("Fork2 of Novo Fluxo")
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined)

  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false)
  const [editingCampaignName, setEditingCampaignName] = useState(campaignName)

  const handleSaveCampaignName = () => {
    setCampaignName(editingCampaignName.trim() || "Fork2 of Novo Fluxo")
    setIsEditingCampaignName(false)
  }

  const handleNodeConfig = useCallback((nodeData: any) => {
    setSelectedNodeData(nodeData)
    if (nodeData.label === "WhatsApp" || nodeData.label === "WhatsApp Oficial") {
      setShowWhatsAppConfig(true)
    }
  }, [])

  const handleAddButtonClick = useCallback(
    (nodeId: string) => {
      const node = reactFlowInstance.getNode(nodeId)
      if (!node || !reactFlowWrapperRef.current) return
      const panelWidth = 400
      const panelHeight = 380
      const plusButtonHeight = 32
      const connectorLineHeight = 16
      const verticalOffset = plusButtonHeight + connectorLineHeight + 40
      const nodeScreenPosition = reactFlowInstance.flowToScreenPosition({
        x: node.position.x + (node.width || 200) / 2,
        y: node.position.y + (node.height || 70) + verticalOffset,
      })
      const reactFlowBounds = reactFlowWrapperRef.current.getBoundingClientRect()
      let panelX = nodeScreenPosition.x - panelWidth / 2
      let panelY = nodeScreenPosition.y
      if (panelX < 10) panelX = 10
      if (panelX + panelWidth > reactFlowBounds.width - 10) panelX = reactFlowBounds.width - 10 - panelWidth
      if (panelY < 10) panelY = 10
      if (panelY + panelHeight > reactFlowBounds.height - 10) panelY = reactFlowBounds.height - 10 - panelHeight
      setSearchTerm("")
      setAddNodePanelState({ show: true, x: panelX, y: panelY, parentNodeId: nodeId })
    },
    [reactFlowInstance],
  )

  useEffect(() => {
    if (nodes.length === 0 && reactFlowInstance) {
      // Ensure reactFlowInstance is available
      const initialNodeId = "trigger-1"
      const initialNode: Node = {
        id: initialNodeId,
        type: "custom",
        position: { x: 400, y: 100 },
        data: {
          label: "Gatilho Inicial",
          icon: Zap,
          color: "bg-yellow-500",
          nodeType: "trigger",
          showAddButton: true,
          onAddClick: () => handleAddButtonClick(initialNodeId),
          onConfigClick: handleNodeConfig,
          isInitialTrigger: true,
        },
      }
      setNodes([initialNode])
    }
  }, [nodes.length, setNodes, handleAddButtonClick, handleNodeConfig, reactFlowInstance])

  useEffect(() => {
    const root = document.documentElement
    if (isLightMode) {
      root.classList.remove("dark")
      // If you have a specific light theme class, add it here.
      // Otherwise, removing 'dark' might be enough if your base styles are light.
    } else {
      root.classList.add("dark")
    }
  }, [isLightMode])

  const applyAutoWriting = useCallback(
    (writing: { text: string }) => {
      const lastTextBlockIndex = messageBlocks
        .map((block, index) => (block.type === "text" ? index : -1))
        .filter((i) => i !== -1)
        .pop()
      if (lastTextBlockIndex !== undefined) {
        setMessageBlocks((prevBlocks) => {
          const newBlocks = [...prevBlocks]
          newBlocks[lastTextBlockIndex].content += writing.text
          return newBlocks
        })
      }
      setShowAutoWritingPanel(false)
    },
    [messageBlocks],
  )

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isSelectMode) {
        event.stopPropagation()
        setSelectedNodesIds((prev) => {
          if (prev.includes(node.id)) {
            return prev.filter((id) => id !== node.id)
          } else {
            return [...prev, node.id]
          }
        })
      }
    },
    [isSelectMode],
  )

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isSelectMode && selectedNodesIds.includes(node.id)) {
        event.preventDefault()
        setContextMenu({
          show: true,
          x: event.clientX,
          y: event.clientY,
          nodeId: node.id,
        })
      }
    },
    [isSelectMode, selectedNodesIds],
  )

  useEffect(() => {
    const handleClickOutside = () => setContextMenu((prev) => ({ ...prev, show: false }))
    if (contextMenu.show) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu.show])

  const handleCopyNodes = useCallback(() => {
    const nodesToCopy = nodes.filter((node) => selectedNodesIds.includes(node.id))
    console.log("Copying nodes:", nodesToCopy)
    setContextMenu((prev) => ({ ...prev, show: false }))
  }, [nodes, selectedNodesIds])

  const handleDeleteNodes = useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => !selectedNodesIds.includes(node.id)))
    setEdges((prevEdges) =>
      prevEdges.filter((edge) => !selectedNodesIds.includes(edge.source) && !selectedNodesIds.includes(edge.target)),
    )
    setSelectedNodesIds([])
    setContextMenu((prev) => ({ ...prev, show: false }))
  }, [selectedNodesIds, setNodes, setEdges])

  useEffect(() => {
    if (!isSelectMode) setSelectedNodesIds([])
  }, [isSelectMode])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: campaignActive,
            style: {
              stroke: campaignActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              strokeWidth: 2,
              strokeDasharray: campaignActive ? "5,5" : "0",
            },
          },
          eds,
        ),
      ),
    [setEdges, campaignActive],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const reactFlowWrapper = reactFlowWrapperRef.current
      if (!reactFlowWrapper || !reactFlowInstance) return
      const reactFlowBounds = reactFlowWrapper.getBoundingClientRect()
      const nodeData = JSON.parse(event.dataTransfer.getData("application/reactflow"))
      if (!nodeData) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNodeId = `node-${Date.now()}`
      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        position,
        data: {
          label: nodeData.name,
          icon: nodeData.icon,
          color: nodeData.color,
          nodeType: "action",
          showAddButton: true,
          onAddClick: () => handleAddButtonClick(newNodeId),
          onConfigClick: handleNodeConfig,
        },
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes, handleAddButtonClick, handleNodeConfig],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const addNodeFromDialog = useCallback(
    (item: any) => {
      if (!addNodePanelState.parentNodeId) return
      const parentNode = nodes.find((n) => n.id === addNodePanelState.parentNodeId)
      if (!parentNode) return
      const newNodeId = `node-${Date.now()}`
      const newPosition = { x: parentNode.position.x, y: parentNode.position.y + 180 }
      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        position: newPosition,
        data: {
          label: item.name,
          icon: item.icon,
          color: item.color,
          nodeType: "action",
          showAddButton: true,
          onAddClick: () => handleAddButtonClick(newNodeId),
          onConfigClick: handleNodeConfig,
        },
      }
      setNodes((nds) =>
        nds
          .map((n) =>
            n.id === addNodePanelState.parentNodeId ? { ...n, data: { ...n.data, showAddButton: false } } : n,
          )
          .concat(newNode),
      )
      const newEdge: Edge = {
        id: `e-${addNodePanelState.parentNodeId}-${newNodeId}`,
        source: addNodePanelState.parentNodeId,
        target: newNodeId,
        type: "smoothstep",
        animated: campaignActive,
        style: {
          stroke: campaignActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          strokeWidth: 2,
          strokeDasharray: campaignActive ? "5,5" : "0",
        },
      }
      setEdges((eds) => [...eds, newEdge])
      setAddNodePanelState((prev) => ({ ...prev, show: false, parentNodeId: newNodeId }))
    },
    [addNodePanelState.parentNodeId, nodes, campaignActive, setNodes, setEdges, handleAddButtonClick, handleNodeConfig],
  )

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: campaignActive,
        style: {
          ...edge.style,
          stroke: campaignActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          strokeDasharray: campaignActive ? "5,5" : "0",
        },
      })),
    )
  }, [campaignActive, setEdges])

  const styledNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        border: isSelectMode && selectedNodesIds.includes(node.id) ? "2px solid #6b7280" : undefined,
      },
    }))
  }, [nodes, isSelectMode, selectedNodesIds])

  const handleCloseAddNodePanel = useCallback(() => {
    setAddNodePanelState((prev) => ({ ...prev, show: false }))
  }, [])

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleCloseWhatsAppConfig = useCallback(() => {
    setShowWhatsAppConfig(false)
  }, [])

  const handleShowAutoWritingPanel = useCallback(() => {
    setShowAutoWritingPanel(true)
  }, [])

  const handleCloseAutoWritingPanel = useCallback(() => {
    setShowAutoWritingPanel(false)
  }, [])

  const handleAutoWritingSearchChange = useCallback((term: string) => {
    setAutoWritingSearch(term)
  }, [])

  const handleActiveAutoWritingTabChange = useCallback((tab: string) => {
    setActiveAutoWritingTab(tab)
  }, [])

  const handleShowMessagePreview = useCallback(() => {
    setShowMessagePreview(true)
  }, [])

  const filteredConnectorsBySearch = (categoryItems: any[]) =>
    categoryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const filteredAllConnectors = staticAllConnectors.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const handleClickOutsideAutoWriting = (event: MouseEvent) => {
      if (showAutoWritingPanel && !(event.target as HTMLElement).closest(".auto-writing-sidebar")) {
        setShowAutoWritingPanel(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutsideAutoWriting)
    return () => document.removeEventListener("mousedown", handleClickOutsideAutoWriting)
  }, [showAutoWritingPanel])

  const eventsSearchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showEventsModal && eventsSearchInputRef.current) {
      setTimeout(() => eventsSearchInputRef.current?.focus(), 100)
    }
  }, [showEventsModal])

  const handleShowActionHistory = useCallback(() => {
    setShowActionHistoryModal(true)
  }, [])

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between py-1 px-4 flex-shrink-0 bg-[rgba(17,17,17,1)]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isEditingCampaignName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingCampaignName}
                onChange={(e) => setEditingCampaignName(e.target.value)}
                className="font-semibold text-lg text-foreground bg-zinc-800 border border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
                style={{ width: `${Math.max(editingCampaignName.length * 0.6, 10)}ch` }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveCampaignName()
                  }
                  if (e.key === "Escape") {
                    setIsEditingCampaignName(false)
                    setEditingCampaignName(campaignName)
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleSaveCampaignName}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors font-medium"
              >
                Salvar
              </button>
            </div>
          ) : (
            <h1
              className="font-semibold text-lg text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
              onClick={() => {
                setIsEditingCampaignName(true)
                setEditingCampaignName(campaignName)
              }}
              title="Clique para renomear"
            >
              {campaignName}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="campaign-toggle"
              className={`text-sm font-medium ${campaignActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
            >
              {campaignActive ? "Ativo" : "Pausado"}
            </label>
            <Switch id="campaign-toggle" checked={campaignActive} onCheckedChange={setCampaignActive} />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setShowEditCampaignModal(true)}
            >
              <Pencil className="w-4 h-4 mr-1.5" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setIsLightMode((prev) => !prev)}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Recarregar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setShowEventsModal(true)}
            >
              <ListChecks className="w-4 h-4 mr-1.5" /> Eventos
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Ajuda
            </Button>
          </div>
        </div>
      </header>

      <main ref={reactFlowWrapperRef} className="flex-1 relative">
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onNodeClick={handleNodeClick}
          onNodeContextMenu={handleNodeContextMenu}
          nodeTypes={nodeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={4}
          className="bg-[rgba(17,17,17,1)]"
          nodesDraggable={interactionMode === "move"}
          nodesConnectable={interactionMode === "select" && !isSelectMode}
          elementsSelectable={interactionMode === "select"}
        >
          {isGridVisible && (
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="text-muted-foreground/30" />
          )}
          {isMinimapVisible && (
            <MiniMap
              className="!bg-card !border !border-border rounded-lg shadow-sm"
              nodeColor={(node: Node) => node.data.color?.replace("bg-", "#") || "hsl(var(--muted-foreground))"}
              nodeStrokeColor={"hsl(var(--border))"}
              nodeClassName="!rounded-sm"
              maskColor="hsla(var(--background) / 0.6)"
            />
          )}
        </ReactFlow>

        <Suspense fallback={<div>Carregando Painel...</div>}>
          <AddNodePanel
            show={addNodePanelState.show}
            x={addNodePanelState.x}
            y={addNodePanelState.y}
            searchTerm={searchTerm}
            onSearchChange={handleSearchTermChange}
            onClose={handleCloseAddNodePanel}
            onAddNode={addNodeFromDialog}
            connectors={staticConnectors}
            allConnectors={staticAllConnectors}
          />
        </Suspense>

        {/* Custom Controls Bar */}
        <div className="fixed bottom-4 left-4 flex flex-col space-y-1 text-card-foreground border border-border rounded-lg p-1 shadow-md z-10 bg-[rgba(17,17,17,1)]">
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10",
              isSelectMode ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-700 text-gray-300 hover:bg-gray-600",
            )}
            onClick={() => setIsSelectMode(!isSelectMode)}
            title="Modo Seleção"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInteractionMode("move")}
            className={cn(
              interactionMode === "move"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            title="Mover Canvas (H)"
          >
            <Hand className="w-4 h-4" />
          </Button>
          <div className="h-px bg-border my-1"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reactFlowInstance?.fitView()}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Ajustar à Tela (F)"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reactFlowInstance?.zoomIn()}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Aproximar Zoom (+)"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reactFlowInstance?.zoomOut()}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Afastar Zoom (-)"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="h-px bg-border my-1"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimapVisible(!isMinimapVisible)}
            className={cn(
              isMinimapVisible
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            title={isMinimapVisible ? "Ocultar Mini Mapa" : "Mostrar Mini Mapa"}
          >
            <Map className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsGridVisible(!isGridVisible)}
            className={cn(
              isGridVisible
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            title={isGridVisible ? "Ocultar Grade" : "Mostrar Grade"}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Context Menu */}
        {contextMenu.show && (
          <div
            className="fixed bg-card border border-border rounded-lg shadow-lg z-50 py-1 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyNodes}
              className="w-full justify-start px-3 py-2 h-auto text-left hover:bg-accent"
            >
              <Copy className="w-4 h-4 mr-2" /> Copiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteNodes}
              className="w-full justify-start px-3 py-2 h-auto text-left hover:bg-accent text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Deletar
            </Button>
          </div>
        )}
      </main>

      <Suspense fallback={<div>Carregando Configurações...</div>}>
        <WhatsAppConfig
          show={showWhatsAppConfig}
          onClose={handleCloseWhatsAppConfig}
          messageBlocks={messageBlocks}
          setMessageBlocks={setMessageBlocks}
          scheduleDateLimit={scheduleDateLimit}
          setScheduleDateLimit={setScheduleDateLimit}
          scheduleTimeInterval={scheduleTimeInterval}
          setScheduleTimeInterval={setScheduleTimeInterval}
          stageName={stageName}
          setStageName={setStageName}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          onShowAutoWriting={handleShowAutoWritingPanel}
          onShowMessagePreview={handleShowMessagePreview}
          onShowActionHistory={handleShowActionHistory}
        />
        <AutoWritingPanel
          show={showAutoWritingPanel}
          onClose={handleCloseAutoWritingPanel}
          searchTerm={autoWritingSearch}
          onSearchChange={handleAutoWritingSearchChange}
          activeTab={activeAutoWritingTab}
          onTabChange={handleActiveAutoWritingTabChange}
          autoWritings={staticAutoWritings}
          onApplyWriting={applyAutoWriting}
        />
      </Suspense>

      {/* Message Preview Panel - Inline for now, can be extracted later */}
      {showMessagePreview && (
        <div
          className="fixed right-0 top-16 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 shadow-lg z-60 flex flex-col animate-in slide-in-from-right duration-300"
          style={{ right: showAutoWritingPanel ? "320px" : showWhatsAppConfig ? "480px" : "0" }}
        >
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-50">Preview da Mensagem</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMessagePreview(false)}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-zinc-800 rounded-lg p-4 min-h-96">
              <div className="flex flex-col items-end space-y-3">
                {messageBlocks.map((block, index) => (
                  <div key={block.id} className="bg-green-500 rounded-lg p-3 text-white max-w-xs relative">
                    {block.type === "text" ? (
                      block.content ? (
                        <div className="text-sm whitespace-pre-wrap">{block.content}</div>
                      ) : (
                        <div className="text-sm text-green-100 italic">Texto vazio</div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        <span>Arquivo anexado</span>
                      </div>
                    )}
                    <div className="text-xs text-green-100 mt-2 text-right">
                      {new Date(Date.now() + index * 1000).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                      <div className="w-0 h-0 border-l-8 border-l-green-500 border-t-8 border-t-transparent"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal - Inline for now */}
      {showEditCampaignModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Editar Campanha</h2>
                <p className="text-xs text-muted-foreground mt-0">ID - 379</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowEditCampaignModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-muted-foreground">
                  Nome da campanha
                </label>
                <Input
                  type="text"
                  id="campaignName"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="selectedFolder" className="block text-sm font-medium text-muted-foreground">
                  Pasta da campanha
                </label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder1">Folder 1</SelectItem>
                    <SelectItem value="folder2">Folder 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Code className="w-4 h-4" />
                COPIAR CÓDIGO
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Copy className="w-4 h-4" />
                Duplicar
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Database className="w-4 h-4" />
                Arquivar
              </Button>
            </div>
            <div className="flex items-center justify-between mt-7">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-transparent hover:text-white/80"
                  onClick={() => setShowEditCampaignModal(false)}
                >
                  CANCELAR
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-transparent hover:text-white/80 border-white border"
                >
                  EXCLUIR
                </Button>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowEditCampaignModal(false)}>
                SALVAR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Events Modal & Event Details Modal - Inline for now */}
      {showEventsModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Eventos da Automação</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEventsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por lead, email ou telefone..."
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar XLSX
                  </Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      // Clear all filters logic would go here
                      setSelectedDate(undefined)
                      console.log("Filtros limpos")
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <Select>
                    <SelectTrigger className="h-9 bg-muted/30 border-border">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>Todos
                        </div>
                      </SelectItem>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>Info
                        </div>
                      </SelectItem>
                      <SelectItem value="sucesso">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>Sucesso
                        </div>
                      </SelectItem>
                      <SelectItem value="aguardando">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>Aguardando
                        </div>
                      </SelectItem>
                      <SelectItem value="falha">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>Falha
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
                  <Select>
                    <SelectTrigger className="h-9 bg-muted/30 border-border">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>Todos
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          WhatsApp
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp-oficial">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          WhatsApp Oficial
                        </div>
                      </SelectItem>
                      <SelectItem value="ligacao">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          Ligação
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-purple-500" />
                          SMS
                        </div>
                      </SelectItem>
                      <SelectItem value="ligacao-provedor">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Ligação Provedor
                        </div>
                      </SelectItem>
                      <SelectItem value="sms-provedor">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-purple-600" />
                          SMS Provedor
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-red-500" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="optin">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-500" />
                          Opt-in
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Dispositivo</label>
                  <Select>
                    <SelectTrigger className="h-9 bg-muted/30 border-border">
                      <SelectValue placeholder="Todos dispositivos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos dispositivos</SelectItem>
                      <SelectItem value="device-1">Dispositivo Principal</SelectItem>
                      <SelectItem value="device-2">Dispositivo 2</SelectItem>
                      <SelectItem value="device-3">Dispositivo 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Data do Evento</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start text-left font-normal bg-muted/30 border-border hover:bg-muted/50",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <LucideCalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Fuso Horário</label>
                  <Select>
                    <SelectTrigger className="h-9 bg-muted/30 border-border">
                      <SelectValue placeholder="UTC-3 (Brasília)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-3">UTC-3 (Brasília)</SelectItem>
                      <SelectItem value="utc-0">UTC+0 (Londres)</SelectItem>
                      <SelectItem value="utc-5">UTC-5 (Nova York)</SelectItem>
                      <SelectItem value="utc+1">UTC+1 (Paris)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-t-lg border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Lead</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Tipo</div>
                <div className="col-span-2">Tempo</div>
                <div className="col-span-2">Contato</div>
                <div className="col-span-1">Ações</div>
              </div>
              <div className="space-y-0">
                {[
                  {
                    id: 1,
                    lead: "João Silva",
                    email: "joao@email.com",
                    whatsapp: "+55 11 99999-9999",
                    status: "Sucesso",
                    type: "WhatsApp",
                    details: "Mensagem WhatsApp enviada com sucesso.",
                    timestamp: "14:30",
                    duration: "2.3s",
                  },
                  {
                    id: 2,
                    lead: "Maria Santos",
                    email: "maria@email.com",
                    whatsapp: "+55 11 88888-8888",
                    status: "Aguardando",
                    type: "Timer",
                    details: "Aguardando disparo do timer programado.",
                    timestamp: "14:25",
                    duration: "45.2s",
                  },
                  {
                    id: 3,
                    lead: "Pedro Costa",
                    email: "pedro@email.com",
                    whatsapp: "+55 11 77777-7777",
                    status: "Falha",
                    type: "WhatsApp",
                    details: "Falha ao enviar mensagem WhatsApp: Número inválido.",
                    timestamp: "14:20",
                    duration: "1.1s",
                  },
                  {
                    id: 4,
                    lead: "Ana Oliveira",
                    email: "ana@email.com",
                    whatsapp: "+55 11 66666-6666",
                    status: "Sucesso",
                    type: "Email",
                    details: "Email de boas-vindas enviado.",
                    timestamp: "14:15",
                    duration: "3.7s",
                  },
                ].map((execution, index) => (
                  <div
                    key={execution.id}
                    className={`grid grid-cols-12 gap-4 p-3 border-b border-border hover:bg-muted/30 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                  >
                    <div className="col-span-3">
                      <p className="font-medium text-foreground text-sm">{execution.lead}</p>
                      <p className="text-xs text-muted-foreground">{execution.email}</p>
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${execution.status === "Sucesso" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : execution.status === "Aguardando" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : execution.status === "Falha" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        {execution.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        {execution.type === "WhatsApp" && (
                          <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {execution.type === "WhatsApp Oficial" && (
                          <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        {execution.type === "Ligação" && <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        {execution.type === "SMS" && <Smartphone className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                        {execution.type === "Ligação Provedor" && (
                          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        {execution.type === "SMS Provedor" && (
                          <Smartphone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        )}
                        {execution.type === "Email" && <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        {execution.type === "Opt-in" && <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                        {execution.type === "Timer" && <Timer className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                        <p className="text-sm text-foreground truncate">{execution.type}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-foreground">{execution.timestamp}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">{execution.whatsapp}</p>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-primary/10 dark:hover:bg-primary/20"
                          onClick={() => {
                            setSelectedEventDetails(execution)
                            setShowEventDetailsModal(true)
                          }}
                          title="Ver mais detalhes"
                        >
                          <Plus className="h-3 w-3 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                          onClick={() => console.log("Reenviando para:", execution.lead)}
                          title="Reenviar"
                        >
                          <RefreshCw className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showEventDetailsModal && selectedEventDetails && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[9999] flex items-center justify-center">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detalhes do Evento</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowEventDetailsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lead</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.lead}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.whatsapp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Evento</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Horário</label>
                  <p className="text-sm text-foreground">{selectedEventDetails.timestamp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dispositivo</label>
                  <p className="text-sm text-foreground">Dispositivo Principal</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID da Tentativa</label>
                  <p className="text-sm text-foreground">msg_{selectedEventDetails.id}_2024</p>
                </div>
              </div>
              {selectedEventDetails.status === "Falha" && (
                <div className="border-t border-border pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Detalhes do Erro</label>
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Falha ao enviar mensagem: Número não encontrado ou bloqueado
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">Código de erro: WA_404_NOT_FOUND</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowEventDetailsModal(false)}>
                Fechar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  console.log("Reenviando para:", selectedEventDetails.lead)
                  setShowEventDetailsModal(false)
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reenviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MarketingAutomationPage() {
  // Renamed component
  return (
    <ReactFlowProvider>
      <MarketingAutomationFlow />
    </ReactFlowProvider>
  )
}
