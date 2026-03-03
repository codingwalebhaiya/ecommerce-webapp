import axios from "axios"
const cloudName = import.meta.env.CLOUDINARY_NAME

 const uploadImageToCloudinary = async(file:File) =>{

    //step no 1- get signature and timestamp from backend
    const data = await axios.get("/api/v1/cloudinary-signature")
    const { signature, timestamp } = data.data

    // step no 2 - prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature)
    formData.append("timestamp", timestamp.toString())

    // step no 3 - upload to cloudinary
    const uploadRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData
  );

  return {
    public_id: uploadRes.data.public_id,
    secure_url: uploadRes.data.secure_url,
  };
}

export default uploadImageToCloudinary;