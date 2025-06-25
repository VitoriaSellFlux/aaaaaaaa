import { memo } from "react"
import { Card } from "@/components/ui/card"

interface WhatsAppConfigProps {
  nodeId: string | null
  onClose: () => void
}

function WhatsAppConfig({ nodeId, onClose }: WhatsAppConfigProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-[500px] p-6 bg-background">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configurar WhatsApp</h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <textarea
                className="w-full h-32 mt-1 p-2 rounded-md border bg-background resize-none"
                placeholder="Digite sua mensagem..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                onClick={() => {
                  // Handle save
                  onClose()
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default memo(WhatsAppConfig) 