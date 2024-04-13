import imageCompression from 'browser-image-compression';


const loadFile = async (file) => {
    if (!file) return; // Vérifie si le fichier existe

    console.log('originalFile instanceof Blob', file instanceof Blob); // true
    console.log(`originalFile size ${file.size / 1024 / 1024} MB`);

    let encodedfile;

    const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 200,
        useWebWorker: true,
    }

    try {
        // Compress file
        const compressedFile = await imageCompression(file, options);
        console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
        console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

        // Transforme to base64
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                encodedfile = reader.result;
                resolve(encodedfile);
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        });

    } catch (error) {
        console.log(error);
    }
}


export default {
    loadFile
};