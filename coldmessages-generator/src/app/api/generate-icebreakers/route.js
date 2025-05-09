import { OpenAI } from "openai"



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
    try {
      const body = await req.json()
      const { senderProfileUrl, targetProfileUrl, problem, solution } = body
  
      if (!senderProfileUrl || !targetProfileUrl || !problem || !solution) {
        return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
          status: 400,
        })
      }
  
      const prompt = `
        Sos un experto en networking profesional. Tu objetivo es crear cold messages personalizados, para posibles clientes, para mandarle a un 
        perfil de linkedin teniendo en cuenta el problema que resolves y la solución que ofreces. Generá 3 icebreakers para iniciar una conversación 
        con un contacto en LinkedIn. Tené en cuenta los siguientes datos:

        - URL del emisor: ${senderProfileUrl}
        - Problema que resuelve: ${problem}
        - Solución ofrecida: ${solution}
        - Perfil objetivo: ${targetProfileUrl}

        El objetivo es generar mensajes que sean atractivos y relevantes para el perfil objetivo, teniendo en cuenta su industria y necesidades.
        Los icebreakers deben ser breves, naturales, y facilitar una respuesta humana. Devolvé solo los mensajes en formato lista.
        `

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    })

    const raw = response.choices[0].message.content
    const messages = raw
      .split(/\n+/)
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[\).\s]*/, "").trim())

      return Response.json(messages)
    } catch (error) {
      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
      })
    }
  }
  