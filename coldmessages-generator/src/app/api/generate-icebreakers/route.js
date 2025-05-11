import { OpenAI } from "openai"
import { fetchLinkedInProfile } from "../linkedin"
import { fetchLinkedInPosts } from "../linkedin"
import { fetchLinkedInComments } from "../linkedin"
import { fetchLinkedInPostAndComments } from "../linkedin"
import {fetchLinkedInProfileByUsername} from "../linkedin"


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

function createPromptFromProfile(senderProfile, problem, solution, targetProfile) {
  return `
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

    Los datos mas importantes que tener que tener en cuenta para generar los mensajes:
    - Problema que resolves: ${problem}
    - Solución ofrecida: ${solution}
    
    El objetivo es generar mensajes que sean atractivos y relevantes para el perfil objetivo, teniendo en cuenta su industria y necesidades.
    Los icebreakers deben ser breves, naturales, y facilitar una respuesta humana. Devolvé solo los mensajes en formato lista.
  `;
}

function createPromptFromPost(senderProfile, problem, solution, textPost, targetProfile) {
  return `
    Sos un experto en networking profesional. Tu objetivo es generar 3 mensajes tipo *icebreaker* que sirvan como primer contacto para 
    iniciar una conversación en LinkedIn con un posible cliente, haciendo referencia directa a un **post** reciente suyo.

    Los mensajes deben ser personalizados, breves, naturales y sonar humanos. Deben facilitar una respuesta del otro lado y **sí o sí** deben 
    mencionar algún aspecto del post del receptor, ya sea el tema tratado, una opinión que dio, o una pregunta que puede surgir de lo que escribió.

    Tené en cuenta estos datos del emisor para adaptar el tono del mensaje:
    - Nombre del emisor: ${senderProfile.username}
    - Cargo del emisor: ${senderProfile.headline}
    - Resumen profesional del emisor: ${senderProfile.summary}

    Y estos datos del receptor:
    - Nombre del receptor: ${targetProfile.username}
    - Cargo del receptor: ${targetProfile.headline}
    - Resumen profesional del receptor: ${targetProfile.summary}

    Contenido del post del receptor:
    - "${textPost}"

    Y además, estos datos del emisor para alinear el mensaje con su propósito. Son los datos mas importantes a tener en cuenta:
    - Problema que resuelve: ${problem}
    - Solución que ofrece: ${solution}

    Instrucciones clave:
    - Todos los mensajes deben hacer referencia explícita al post anterior.
    - Pueden comenzar felicitando, comentando, o preguntando algo respecto al contenido del post.
    - El mensaje puede sembrar una conversación ligera o una posible conexión profesional relacionada al problema/solución que ofrece el emisor.
    - No repitas la estructura exacta entre los 3 mensajes. Variá estilo y acercamiento.

    Devolvé solo los mensajes como una lista numerada. No agregues introducción ni conclusión.
  `;
}

async function handlePostLink(senderProfile, problem, solution, postUrn) {
  const { postText, username } = await fetchLinkedInPostAndComments(postUrn);
  const targetProfile = await fetchLinkedInProfileByUsername(username)
  const promptToGpt = createPromptFromPost(senderProfile, problem, solution, postText, targetProfile);
  return promptToGpt;
}

async function handleProfileLink(senderProfile, targetProfileUrl, problem, solution) {
  const targetProfile = await fetchLinkedInProfile(targetProfileUrl);

  if (!targetProfile || !targetProfile.username) {
    throw new Error("El perfil objetivo no existe o no se pudo obtener");
  }

  const prompt = createPromptFromProfile(
    senderProfile,
    problem,
    solution,
    targetProfile
  );
  return prompt;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { senderProfileUrl, targetProfileUrl, problem, solution } = body;

    if (!senderProfileUrl || !targetProfileUrl || !problem || !solution) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
      });
    }

    const senderProfile = await fetchLinkedInProfile(senderProfileUrl);

    if (!senderProfile || !senderProfile.username) {
      return new Response(JSON.stringify({ error: "El perfil del remitente no existe o no se pudo obtener" }), {
        status: 400,
      });
    }

    let isProfileUrl = targetProfileUrl.includes("/in/");
    let postUrn = null;
    let prompt = null;

    if (!isProfileUrl) {
      const match = targetProfileUrl.match(/urn:li:activity:(\d+)/);
      if (match) {
        postUrn = match[1];
        prompt = await handlePostLink(senderProfile, problem, solution, postUrn);
      } else {
        return new Response(JSON.stringify({ error: "URL no valida" }), {
          status: 400,
        });
      }
    } else {
      try {
        prompt = await handleProfileLink(senderProfile, targetProfileUrl, problem, solution);
      } catch (error) {
        return new Response(JSON.stringify({ error: "La url del perfil objetivo no existe o no se pudo obtener" }), {
          status: 404,
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const raw = response.choices[0].message.content;
    const messages = raw
      .split(/\n+/)
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+[\).\s]*/, "").trim());

    return Response.json(messages);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
    });
  }
}
