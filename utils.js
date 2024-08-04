const updateMetadata = (metadata) => {
    if (metadata) {
        document.title = metadata.title || 'Practical:AI';
        document.querySelector('meta[name="description"]').setAttribute('content', metadata.description || '');
        document.querySelector('meta[property="og:title"]').setAttribute('content', metadata.title || '');
        document.querySelector('meta[property="og:description"]').setAttribute('content', metadata.description || '');
        document.querySelector('meta[property="og:image"]').setAttribute('content', metadata.image || '');
        document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
        document.querySelector('meta[name="twitter:card"]').setAttribute('content', 'summary_large_image');
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', metadata.title || '');
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', metadata.description || '');
        document.querySelector('meta[name="twitter:image"]').setAttribute('content', metadata.image || '');
    }
};


export async function fetchContent(contentFile) {
    try {
        const response = await fetch(contentFile);
        const yamlText = await response.text();
        const content = jsyaml.load(yamlText);
        if (content.metadata) {
            updateMetadata(content.metadata);
        }

        return content;
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}