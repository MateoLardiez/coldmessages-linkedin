import { OpenAI } from "openai"
import { fetchLinkedInProfile } from "../linkedin"
import { fetchLinkedInPosts } from "../linkedin"
import { fetchLinkedInComments } from "../linkedin"


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function generateIcebreakerFromPostsAndComments(targetProfilePostsTexts, targetProfileCommentsTexts, problem, solution) {
  const prompt = `
    Sos un experto en networking profesional. Tu objetivo es analizar publicaciones y comentarios de un perfil de LinkedIn para identificar 
    contenido relevante que pueda ser utilizado para generar un icebreaker. El icebreaker debe estar relacionado con el problema que resuelvo 
    y la solución que ofrezco. Si no encuentras contenido relevante, no generes ningún mensaje.

    Tené en cuenta los siguientes datos:
    - Problema que resuelvo: ${problem}
    - Solución ofrecida: ${solution}

    Aquí tienes las publicaciones recientes del perfil objetivo, separadas por " | ":
    - Publicaciones recientes: ${targetProfilePostsTexts.join(" | ")}

    Y aquí tienes los comentarios recientes del perfil objetivo, separados por " | ":
    - Comentarios recientes: ${targetProfileCommentsTexts.join(" | ")}

    Si encuentras contenido relevante en las publicaciones o comentarios, genera un único icebreaker breve y natural que facilite una respuesta humana. 
    Si no encuentras contenido relevante, responde con "Ningún contenido relevante encontrado".
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  const raw = response.choices[0].message.content.trim();
  return raw === "Ningún contenido relevante encontrado" ? null : raw;
}


export async function POST(req) {
    try {
      const body = await req.json()
      const { senderProfileUrl, targetProfileUrl, problem, solution } = body
  
      if (!senderProfileUrl || !targetProfileUrl || !problem || !solution) {
        return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
          status: 400,
        })
      }
  

      const senderProfile = await fetchLinkedInProfile(senderProfileUrl)
      const targetProfile = await fetchLinkedInProfile(targetProfileUrl)
      const targetProfilePostsTexts = await fetchLinkedInPosts(targetProfile.username)
      //const targetProfileCommentsTexts = await fetchLinkedInComments(targetProfile.username)

      const prompt = `
        Sos un experto en networking profesional. Tu objetivo es crear cold messages personalizados, para posibles clientes, para mandarle a un 
        perfil de linkedin teniendo en cuenta el problema que resolves y la solución que ofreces. Generá 3 icebreakers para iniciar una conversación 
        con un contacto en LinkedIn. 

        Tené en cuenta los siguientes datos del emisor para poder personalizar el mensaje a su estilo y tono de voz:
        - Nombre y Apellido del emisor: ${senderProfile.username}
        - Cargo del emisor: ${senderProfile.headline}
        - Resumen del emisor: ${senderProfile.summary}
        
        Tambien tene en cuenta los siguientes datos del receptor para poder personalizar el mensaje a su estilo y tono de voz:
        - Nombre y Apellido del receptor: ${targetProfile.username}
        - Cargo del receptor: ${targetProfile.headline}
        - Resumen del receptor: ${targetProfile.summary}

        Además, considera las publicaciones recientes del receptor para generar mensajes más relevantes. Te envio el texto de las publicaciones
        separadas por " | " para que puedas analizarlas y generar mensajes personalizados. Si es que ves un txto de una publicacion que puede ser
        utilizado para generar un mensaje, hace referencia al mimso.
        - Publicaciones recientes: ${targetProfilePostsTexts.join(" | ")}

        Y los datos mas importantes que tener que tener en cuenta para generar los mensajes:
        - Problema que resolves: ${problem}
        - Solución ofrecida: ${solution}
        
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
  