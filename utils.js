export async function fetchContent(contentFile) {
    try {
        const response = await fetch(contentFile);
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}