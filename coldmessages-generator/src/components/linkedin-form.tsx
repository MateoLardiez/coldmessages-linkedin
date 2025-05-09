"use client"

import type React from "react"

import { useState } from "react"
import { generateIceBreakers } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Copy, Loader2, Search, X } from 'lucide-react'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Resetear el resultado de verificación si el usuario cambia la URL
    if (name === "senderProfileUrl" || name === "targetProfileUrl") {
      setProfileCheckResults((prev) => ({
        ...prev,
        [name]: { url: value, exists: null, checking: false },
      }))
    }
  }

  // Función para verificar si un perfil de LinkedIn existe
  const checkProfileExists = async (fieldName: string, url: string): Promise<void> => {
    // Actualizar estado para mostrar que estamos verificando
    setProfileCheckResults((prev) => ({
      ...prev,
      [fieldName]: { url, exists: null, checking: true },
    }))

    try {
      // Simulamos una petición al servidor para verificar la URL
      // En un entorno real, esto sería una llamada a una API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulamos diferentes resultados para demostración
      // En un entorno real, esto dependería de la respuesta de la API
      let exists: boolean
      let message: string | undefined

      if (url.includes("no-existe")) {
        // Para demostración: URLs con "no-existe" se consideran inexistentes
        exists = false
        message = "Este perfil no parece existir"
      } else if (!url.includes("linkedin.com/in/")) {
        // Para demostración: URLs que no siguen el patrón básico de LinkedIn
        exists = false
        message = "Esta URL no parece ser un perfil de LinkedIn válido"
      } else {
        // Para demostración: 80% de probabilidad de que el perfil exista
        exists = Math.random() > 0.2
        message = exists ? "Perfil verificado correctamente" : "No se pudo verificar este perfil"
      }

      // Actualizar el estado con el resultado
      setProfileCheckResults((prev) => ({
        ...prev,
        [fieldName]: { url, exists, checking: false, message },
      }))
    } catch (error) {
      // Manejar errores en la verificación
      setProfileCheckResults((prev) => ({
        ...prev,
        [fieldName]: {
          url,
          exists: null,
          checking: false,
          message: "Error al verificar el perfil",
        },
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Validación básica - solo verificamos que los campos no estén vacíos
    if (!formData.senderProfileUrl || !formData.problem || !formData.solution || !formData.targetProfileUrl) {
      throw new Error("Por favor completa todos los campos")
    }

    try {
        const response = await fetch("/api/generate-icebreakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
    
        const result = await response.json()
        setMessages(result)
      } catch (err) {
        setError("Ocurrió un error al generar los mensajes")
      } finally {
        setLoading(false)
      }

    // try {

    //   const result = await generateIceBreakers(formData)
    //   setMessages(result)
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : "Ocurrió un error al generar los mensajes")
    // } finally {
    //   setLoading(false)
    // }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Cambiado para usar sonner
    toast.success("Copiado al portapapeles", {
      description: "El mensaje ha sido copiado",
    })
  }

  // Función para renderizar el indicador de estado de verificación
  const renderProfileCheckStatus = (fieldName: string) => {
    const result = profileCheckResults[fieldName]

    if (!result || result.exists === null) return null

    if (result.checking) {
      return (
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Verificando...
        </div>
      )
    }

    if (result.exists) {
      return (
        <div className="flex items-center mt-1 text-sm text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          {result.message || "Perfil verificado"}
        </div>
      )
    } else {
      return (
        <div className="flex items-center mt-1 text-sm text-red-500">
          <X className="h-3 w-3 mr-1" />
          {result.message || "Perfil no encontrado"}
        </div>
      )
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="senderProfileUrl">URL de tu perfil de LinkedIn</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="senderProfileUrl"
                  name="senderProfileUrl"
                  placeholder="https://linkedin.com/in/tu-perfil"
                  value={formData.senderProfileUrl}
                  onChange={handleChange}
                />
                {renderProfileCheckStatus("senderProfileUrl")}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!formData.senderProfileUrl || profileCheckResults.senderProfileUrl.checking}
                onClick={() => checkProfileExists("senderProfileUrl", formData.senderProfileUrl)}
              >
                {profileCheckResults.senderProfileUrl.checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
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
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="targetProfileUrl"
                  name="targetProfileUrl"
                  placeholder="https://linkedin.com/in/perfil-destino"
                  value={formData.targetProfileUrl}
                  onChange={handleChange}
                />
                {renderProfileCheckStatus("targetProfileUrl")}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!formData.targetProfileUrl || profileCheckResults.targetProfileUrl.checking}
                onClick={() => checkProfileExists("targetProfileUrl", formData.targetProfileUrl)}
              >
                {profileCheckResults.targetProfileUrl.checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
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