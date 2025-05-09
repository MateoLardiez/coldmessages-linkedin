import LinkedInForm from "@/components/linkedin-form"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Generador de Ice Breakers para LinkedIn</h1>
        <p className="text-muted-foreground mb-8">
          Genera mensajes personalizados para conectar con prospectos en LinkedIn
        </p>
        <LinkedInForm />
      </div>
    </main>
  )
}
