"use server"

export async function generateIceBreakers(formData) {
  // Simulamos un retraso para mostrar el estado de carga
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // En un caso real, aquí se conectaría con una API de IA para generar los mensajes
  // Por ahora, generamos mensajes de ejemplo basados en los datos proporcionados

  const { problem, solution } = formData

  // Simulamos 3 mensajes diferentes
  return [
    `Hola! Noté que estás en el sector y me preguntaba si has enfrentado el problema de ${problem}. Desarrollamos una solución que ${solution}. ¿Te interesaría saber más?`,

    `Me llamó la atención tu perfil profesional. Muchas empresas del sector están lidiando con ${problem} y hemos creado una forma de ${solution}. ¿Has considerado un enfoque similar?`,

    `Conectando con profesionales que podrían beneficiarse de nuestra solución para ${problem}. Básicamente, ayudamos a nuestros clientes a ${solution}. ¿Te gustaría conversar sobre esto?`,
  ]
}
