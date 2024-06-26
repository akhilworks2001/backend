import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error('Could not find the path')
        
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully
        console.log("file has been uploaded on cloudinary", response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export { uploadOnCloudinary }