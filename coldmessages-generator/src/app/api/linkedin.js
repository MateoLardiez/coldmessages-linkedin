
// GET user profile data by URL
export async function fetchLinkedInProfile(profileUrl) {
    const encodedUrl = encodeURIComponent(profileUrl)
  

    const url = `https://${process.env.RAPIDAPI_HOST}/get-profile-data-by-url?url=${encodedUrl}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        //const result = await response.text();
        const data = await response.json();
        console.log("Linkedin profile text:", data);
        //console.log("LinkedIn Profile json:", data)
        return data
    } catch (error) {
        console.error("Error fetching LinkedIn profile: ", error);
    }

}

// GET user posts by username
export async function fetchLinkedInPosts(username) {

    const url = `https://${process.env.RAPIDAPI_HOST}/get-profile-posts?username=${username}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Extraer los textos de los posts
        const postsTexts = data.data.map(post => post.text);
        console.log("LinkedIn profile posts:", data);
        console.log("LinkedIn profile posts texts:", postsTexts);
        return postsTexts;
    } catch (error) {
        console.error("Error fetching LinkedIn posts: ", error);
        throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
    }
}

// GET user post and comments by urn
export async function fetchLinkedInPostAndComments(urn) {
    const url = `https://${process.env.RAPIDAPI_HOST}/get-profile-post-and-comments?urn=${urn}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Post and comments data:", data);

        const postText = data.data?.post?.text || "Post text not available";
        const username = data.data?.post?.author?.username || "Username not available";

        console.log("Post text:", postText);
        console.log("Username:", username);
        return { postText, username };
    } catch (error) {
        console.error("Error fetching LinkedIn post and comments: ", error);
        throw error;
    }
}

// GET user profile by username
export async function fetchLinkedInProfileByUsername(username) {
    const url = `https://${process.env.RAPIDAPI_HOST}/?username=${username}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("LinkedIn profile by username:", data);
        return data;
    } catch (error) {
        console.error("Error fetching LinkedIn profile by username: ", error);
        throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
    }
}

// GET user comments by username (interactions)
export async function fetchLinkedInComments(username) {
    const url = `https://${process.env.RAPIDAPI_HOST}/get-profile-comments?username=${username}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Verificar si data.data existe
        // if (!data.data || !Array.isArray(data.data)) {
        //     console.error("La respuesta no contiene datos válidos:", data);
        //     throw new Error("La respuesta del endpoint no contiene datos válidos.");
        // }

        // Crear un diccionario con el texto del post como clave y el comentario como valor
        const commentsDict = {};
        data.data.forEach(post => {
            const postText = post.highlightedCommentsActivityCounts?.text || "Texto del post no disponible";
            const commentText = post.highlightedComments?.[0] || "Comentario no disponible";
            commentsDict[postText] = commentText;
        });

        console.log("Comentarios extraídos:", commentsDict);
        return commentsDict;
    } catch (error) {
        console.error("Error fetching LinkedIn comments: ", error);
        throw error; // Re-lanzar el error para manejarlo en otro lugar si es necesario
    }
}