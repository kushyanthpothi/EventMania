export const uploadImageToImgbb = async (file) => {
    const apiKey = '804833de548ba607472ab796a64aac2c';
    const formData = new FormData();
    formData.append('image', file);
  
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
  
    const result = await response.json();
    if (result.success) {
      return result.data.url; // Return the uploaded image URL
    } else {
      throw new Error('Image upload failed');
    }
  };
  