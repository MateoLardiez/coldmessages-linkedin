
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
  