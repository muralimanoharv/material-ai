export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Get just the base64 content
            const encoded = reader.result.toString().split(',')[1];

            // Resolve with an object containing both data and type
            resolve({ data: encoded, type: file.type, name: file.name });
        };
        reader.onerror = error => reject(error);
    });
}

export function formatBase64Data(data, mimeType) {
    return `data:${mimeType};base64,${fixBase64String(data)}`;
}

export function fixBase64String(base64) {
    // Replace URL-safe characters if they exist
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // Fix base64 padding
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    return base64;
}

export function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.debug(e)
        return false;
    }
    return true;
}