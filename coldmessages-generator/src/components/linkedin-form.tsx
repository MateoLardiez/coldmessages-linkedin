"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner" // Cambiado de useToast a toast de sonner

interface ProfileCheckResult {
  url: string
  exists: boolean | null
  checking: boolean
  message?: string
}

export default function LinkedInForm() {
  // Eliminar la línea: const { toast } = useToast()
  const [formData, setFormData] = useState({
    senderProfileUrl: "",
    problem: "",
    solution: "",
    targetProfileUrl: "",
  })
  const [messages, setMessages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para almacenar los resultados de verificación de perfiles
  const [profileCheckResults, setProfileCheckResults] = useState<{
    [key: string]: ProfileCheckResult
  }>({
    senderProfileUrl: { url: "", exists: null, checking: false },
    targetProfileUrl: { url: "", exists: null, checking: false },
  })

  // Eliminamos el botón de verificación de perfiles y su lógica asociada
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.senderProfileUrl || !formData.problem || !formData.solution || !formData.targetProfileUrl) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/generate-icebreakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Ocurrió un error al generar los mensajes");
        setLoading(false);
        return;
      }

      const result = await response.json();
      setMessages(result);
    } catch (err) {
      setError("Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Cambiado para usar sonner
    toast.success("Copiado al portapapeles", {
      description: "El mensaje ha sido copiado",
    })
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="senderProfileUrl">URL de tu perfil de LinkedIn</Label>
            <Input
              id="senderProfileUrl"
              name="senderProfileUrl"
              placeholder="https://linkedin.com/in/tu-perfil"
              value={formData.senderProfileUrl}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="problem">Problema que resuelves</Label>
            <Textarea
              id="problem"
              name="problem"
              placeholder="Describe el problema que resuelves para tus clientes"
              value={formData.problem}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="solution">Solución que ofreces</Label>
            <Textarea
              id="solution"
              name="solution"
              placeholder="Describe la solución que ofreces"
              value={formData.solution}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="targetProfileUrl">URL del perfil destino</Label>
            <Input
              id="targetProfileUrl"
              name="targetProfileUrl"
              placeholder="https://linkedin.com/in/perfil-destino"
              value={formData.targetProfileUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando mensajes...
            </>
          ) : (
            "Generar Ice Breakers"
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Mensajes generados
          </h2>

          {messages.map((message, index) => (
            <Card key={index} className="p-4 relative">
              <div className="prose max-w-none">
                <p>{message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(message)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copiar mensaje</span>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}