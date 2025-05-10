# coldmessages-linkedin
Applicacion fullstack para generacion de Icebreakers para usuarios de LinkedIn, utilizando IA, Squads Venture


# Design Document

## Descripción high level del proyecto

#### Objetivo del proyecto:

El objetivo de esta aplicación es ayudar a generar mensajes iniciales (icebreakers) personalizados para conectar con personas en LinkedIn de manera natural y efectiva.

#### Problema que resuelve:

Muchos usuarios de LinkedIn no saben cómo iniciar una conversación con nuevos contactos sin sonar genéricos o forzados. Esto limita las oportunidades de networking, ventas o colaboración.

#### Solución propuesta:

Una aplicación web que, a partir de la URL del emisor, la URL del receptor, el problema que resuelve y la solución que ofrece, genera 3 opciones de mensajes iniciales que suenan humanos, breves y están alineados con el estilo de escritura del emisor y el perfil del destinatario.

#### Componentes principales:

Frontend (React + TypeScript): Formulario para ingresar la información y visualizar los mensajes generados.

Backend (Node.js + TypeScript): API que procesa los datos, consulta APIs externas (como LinkedIn Data API y OpenAI), y devuelve las 3 opciones de mensaje.

#### Interacción típica:
El usuario ingresa la información requerida → el backend analiza perfiles y genera mensajes → el frontend muestra las 3 opciones generadas.

## User Stories con definition of done

1) User story feliciacion de nuevo trabajo:

    Como usuario de la plataforma
    quiero poder generar un icebreaker hacia una persona que ha conseguido un nuevo trabajo,
    cargando los inputs correspondientes,
    para felicitarla por su nuevo rol

    Definition of Done:

    - El formulario acepta los siguientes campos: URL del emisor, problema, solución, URL del receptor.
    - Al enviar los datos, se generan 3 icebreakers distintos con tono humano, alineados con el problema descripto y la solucion.
    - Si faltan campos obligatorios, se muestra un mensaje de error claro.
    - El diseño del formulario y los resultados es responsive y legible.
    - La historia está integrada en el frontend y funcional desde el navegador.
    - Se documentó el endpoint correspondiente y su uso en el README.


2) User story cargado de informacion propia:

    Como usuario de la plataforma
    quiero poder ingresar información sobre mi perfil y qué solución ofrezco
    para que el mensaje generado tenga un enfoque personalizado y relevante.

    Definition of Done:
    - Se incluye un input para cargar el url del usuario emisor.
    - Se incluye un input para describir brevemente la solución o producto ofrecido.
    - La información es utilizada en la generación del mensaje.
    - Si no se completan estos campos, se advierte al usuario o se usa un prompt genérico.

3) User Story Personalización del mensaje
    Como usuario de la plataforma
    quiero poder previsualizar los icebreakers generados antes de enviarlos
    para elegir el que mejor se adapte al tono y contexto que deseo comunicar.

    Definition of Done:

    - Se generan al menos 3 icebreakers distintos.
    - Los icebreakers se muestran en la interfaz al usuario en un formato claro.
    - El usuario puede seleccionar uno para copiarlo fácilmente.
    - Los mensajes no contienen errores de gramática ni están fuera de contexto.

## Disenio general

### Componentes del sistema

#### Frontend (React + Typescript)

- Formulario con los 4 inputs:
    - URL de perfil de LinkedIn del emisor
    - Problema que resuelve
    - Solución ofrecida
    - URL del perfil destino

- Botón para generar icebreakers

- Muestra los 3 mensajes generados

- Estado de carga / errores

#### Backend (Node.js)

Funcion generate-icebreakers

- Valida inputs
- Llama a LinkedIn API para obtener datos del perfil emisor
- Llama a LinkedIn API para obtener datos del perfil destinatario
- Crea prompt con la info recopilada
- Llama a la OpenAI API para generar los icebreakers, especificando problema a resolver y solucion ofrecida
- Devuelve los 3 mensajes generados

#### Flujo de datos
- Usuario completa el formulario y hace submit.
- Frontend envía un POST al backend con los datos.

- Backend:
    - Extrae datos del perfil emisor desde la LinkedIn API.
    - Extrae datos del perfil receptor desde la LinkedIn API.
    - Construye un prompt usando los datos del perfil receptor + emisor + problema/solución.
    - Llama a OpenAI API.
    - Recibe y devuelve los 3 icebreakers al frontend.

- Frontend muestra los resultados.

#### Manejo de errores
- Inputs obligatorios validados en frontend y backend.
- Si LinkedIn API falla → mostrar error específico.
- Si OpenAI falla → mostrar mensaje genérico al usuario.
- Loading spinner para mejorar UX.

## Link a v0

https://v0.dev/chat/linkedin-message-generator-2ESuJkRH7dr

## External dependencies

## Costos

## Arquitectura de datos

## API Reference

Utilizacion de API de OpenAI
- POST request enviando el prompt con su respectiva data adjunta

Utilizacion de API de LinkedIn
- GET Profile Data By Url -> Obtener la data general del perfil.
- GET Profile Post -> Obtener el texto del post que hizo un perfil target
- GET Profile's Posts -> Obtener los posts para buscar informacion relevante

## High level sequence diagrams

## Error handling (handling and user feedback)

## Non functional requirements (rate limiting, platform limits, etc)

## Rollout (feature flags, straight to prod, etc)

## Product analytics (eventos y que gráficos vamos a tener)

## Ejemplos de ejecucion

URL del perfil de LinkedIn del emisor: 
https://www.linkedin.com/in/mateo-lardiez/

Problema que resolvés:
Las empresas suelen tener dificultades para automatizar tareas repetitivas en LinkedIn sin infringir políticas de uso.

Solución que ofrecés:
Ofrecemos una herramienta que automatiza mensajes y conexiones en LinkedIn de forma segura y personalizada, respetando los límites de la plataforma.

URL del perfil objetivo (persona a contactar):
https://www.linkedin.com/in/sofia-hernandez/