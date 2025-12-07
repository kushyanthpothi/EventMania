const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImage = async (imageFile) => {
    try {
        if (!imageFile) {
            return { url: null, error: 'No image file provided' };
        }

        if (imageFile.size > 32 * 1024 * 1024) {
            return { url: null, error: 'Image size must be less than 32MB' };
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
            return { url: null, error: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP' };
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('key', IMGBB_API_KEY);

        const response = await fetch(IMGBB_API_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return {
                url: data.data.display_url,
                deleteUrl: data.data.delete_url,
                error: null
            };
        } else {
            return { url: null, error: data.error.message || 'Upload failed' };
        }
    } catch (error) {
        return { url: null, error: error.message };
    }
};

export const uploadImageBase64 = async (base64String, name = 'image') => {
    try {
        if (!base64String) {
            return { url: null, error: 'No image data provided' };
        }

        const formData = new FormData();
        formData.append('image', base64String);
        formData.append('key', IMGBB_API_KEY);
        formData.append('name', name);

        const response = await fetch(IMGBB_API_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return {
                url: data.data.display_url,
                deleteUrl: data.data.delete_url,
                error: null
            };
        } else {
            return { url: null, error: data.error.message || 'Upload failed' };
        }
    } catch (error) {
        return { url: null, error: error.message };
    }
};
