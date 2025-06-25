"use client"

import type React from "react"
import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, BookOpen, Timer, HelpCircle, MessageSquare } from "lucide-react"

interface MessageBlock {
  id: number
  type: "text" | "file"
  content: string
  placeholder: string
}

interface WhatsAppConfigProps {
  show: boolean
  onClose: () => void
  messageBlocks: MessageBlock[]
  setMessageBlocks: React.Dispatch<React.SetStateAction<MessageBlock[]>>
  scheduleDateLimit: boolean
  setScheduleDateLimit: (value: boolean) => void
  scheduleTimeInterval: boolean
  setScheduleTimeInterval: (value: boolean) => void
  stageName: string
  setStageName: (name: string) => void
  selectedDevice: string | undefined
  setSelectedDevice: (device: string | undefined) => void
  onShowAutoWriting: () => void
  onShowMessagePreview: () => void
  onShowActionHistory: () => void
}

const WhatsAppConfig = memo(function WhatsAppConfig({
  show,
  onClose,
  messageBlocks,
  setMessageBlocks,
  scheduleDateLimit,
  setScheduleDateLimit,
  scheduleTimeInterval,
  setScheduleTimeInterval,
  stageName,
  setStageName,
  selectedDevice,
  setSelectedDevice,
  onShowAutoWriting,
  onShowMessagePreview,
  onShowActionHistory,
}: WhatsAppConfigProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState(stageName)

  const handleSaveTitle = () => {
    setStageName(editingTitle.trim() || "Enviar mensagem WhatsApp")
    setIsEditingTitle(false)
  }

  if (!show) {
    return null
  }

  const handleAddBlock = (type: "text" | "file") => {
    const newBlock = {
      id: Date.now(),
      type,
      content: "",
      placeholder: type === "text" ? "Digite aqui..." : "Anexar arquivo...",
    }
    setMessageBlocks((prevBlocks) => [...prevBlocks, newBlock])
  }

  const handleRemoveBlock = (index: number) => {
    setMessageBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index))
  }

  const handleContentChange = (index: number, content: string, target: HTMLTextAreaElement | null) => {
    setMessageBlocks((prevBlocks) => prevBlocks.map((block, i) => (i === index ? { ...block, content } : block)))
    if (target) {
      target.style.height = "auto"
      target.style.height = `${Math.max(40, target.scrollHeight)}px`
    }
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 w-[480px] bg-zinc-900 text-zinc-50 border-l border-zinc-800 shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-green-500" />
            </div>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="font-semibold text-zinc-50 text-sm bg-zinc-800 border border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveTitle()
                      }
                      if (e.key === "Escape") {
                        setIsEditingTitle(false)
                        setEditingTitle(stageName)
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <h3
                  className="font-semibold text-zinc-50 text-sm cursor-pointer hover:text-zinc-200 transition-colors"
                  onClick={() => {
                    setIsEditingTitle(true)
                    setEditingTitle(stageName)
                  }}
                  title="Clique para renomear"
                >
                  {stageName || "Enviar mensagem WhatsApp"}
                </h3>
              )}
              <p className="text-xs text-zinc-400">Configure a mensagem e opções de envio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <>
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #52525b;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #71717a;
          }
        `}</style>
        <div
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#52525b transparent" }}
        >
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-zinc-200">Mensagem</h4>
                <div className="flex gap-2">
                  <button
                    onClick={onShowMessagePreview}
                    className="p-2 rounded-md text-white hover:text-white hover:bg-zinc-800"
                    title="Visualizar mensagem"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-md text-white hover:text-white hover:bg-zinc-800"
                    title="Testar automação"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-lg">
                <div className="space-y-3">
                  {messageBlocks.map((block, index) => (
                    <div key={block.id} className="relative">
                      {block.type === "text" ? (
                        <div className="relative">
                          <textarea
                            className="w-full min-h-[2.5rem] bg-zinc-800 border border-zinc-700 rounded-lg p-3 pr-12 text-sm text-zinc-50 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
                            placeholder={block.placeholder}
                            value={block.content}
                            onChange={(e) => handleContentChange(index, e.target.value, e.target)}
                            style={{ height: "auto", minHeight: "2.5rem" }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = "auto"
                              target.style.height = `${Math.max(40, target.scrollHeight)}px`
                            }}
                          />
                          <button
                            onClick={onShowAutoWriting}
                            className="absolute top-2 right-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
                            title="Escritas Automáticas"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 right-2 text-xs text-zinc-400">
                            {block.content.length}/500
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-full h-32 bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:border-zinc-500 transition-colors cursor-pointer">
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-sm">Anexar arquivo...</span>
                          </div>
                        </div>
                      )}
                      {messageBlocks.length > 1 && (
                        <button
                          onClick={() => handleRemoveBlock(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors z-10"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => handleAddBlock("text")}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Texto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddBlock("file")}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Arquivo
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-zinc-800/60 border border-zinc-700/70 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-sm font-medium text-primary">Agendar data e hora limite?</h4>
                </div>
                <button
                  onClick={() => setScheduleDateLimit(!scheduleDateLimit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${scheduleDateLimit ? "bg-primary" : "bg-zinc-600"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scheduleDateLimit ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <p className="text-sm text-zinc-300">
                A etapa vai enviar as mensagens aos leads até uma data e hora determinada.
              </p>
            </div>

            <div className="space-y-2 p-3 bg-zinc-800/60 border border-zinc-700/70 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-sm font-medium text-primary">Agendar um intervalo de tempo?</h4>
                </div>
                <button
                  onClick={() => setScheduleTimeInterval(!scheduleTimeInterval)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${scheduleTimeInterval ? "bg-primary" : "bg-zinc-600"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scheduleTimeInterval ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <p className="text-sm text-zinc-300">
                A etapa vai enviar as mensagens aos leads somente no intervalo de tempo definido abaixo.
              </p>
            </div>

            <div className="space-y-3 p-3 bg-zinc-800/60 border border-zinc-700/70 rounded-lg">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="exclusive-device" className="block text-sm font-medium text-zinc-300">
                    Dispositivo exclusivo
                  </label>
                  <p className="text-xs text-zinc-400">
                    O dispositivo selecionado enviará todas as mensagens desta automação, mesmo com múltiplos
                    dispositivos conectados ao projeto.
                  </p>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger id="exclusive-device" className="w-full bg-zinc-700 border-zinc-600 text-zinc-50">
                      <SelectValue placeholder="Selecione um dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="device-1">Dispositivo 1 (Principal)</SelectItem>
                      <SelectItem value="device-2">Dispositivo 2</SelectItem>
                      <SelectItem value="device-3">Outro Dispositivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-4">
              <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Precisa de ajuda?
              </button>
            </div>
          </div>
        </div>
      </>

      <div className="p-3 border-t border-zinc-800 bg-zinc-800/50">
        <div className="flex gap-3 justify-end items-center">
          <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
            Excluir
          </Button>
          <Button variant="outline" onClick={onClose} className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
            Cancelar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Salvar</Button>
        </div>
      </div>
    </div>
  )
})

export default WhatsAppConfig
