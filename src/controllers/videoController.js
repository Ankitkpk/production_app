import uploadImageOnCloudinary from '../utils/cloudinary.js';

const publishedVideo = async (req, res) => {
    try {
      const { title, description, owner } = req.body;
  
      if ([title, description, owner].some((field) =>field.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
      }
     
  
      // File upload validation
      const videoFile = req.files?.videoFile?.[0]?.path;
      const thumbnail = req.files?.thumbnail?.[0]?.path;
  
      if (!videoFile) {
        return res.status(400).json({ message: "Video file is required" });
      }
      if (!thumbnail) {
        return res.status(400).json({ message: "Thumbnail file is required" });
      }
  
      // Upload files to Cloudinary
      const uploadedVideoFile = await uploadImageOnCloudinary(videoFile);
      const uploadedThumbnail = await uploadImageOnCloudinary(thumbnail);
  
      if (!uploadedVideoFile?.secure_url || !uploadedThumbnail?.secure_url) {
        return res.status(500).json({ message: "Failed to upload files to Cloudinary" });
      }
  
      // Create a new video entry
      const newVideo = new Video({
        title,
        description,
        duration:videoFile?.duration || null,
        videoFile: uploadedVideoFile.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        owner,
        isPublished:true,
      });
  
      await newVideo.save();
  
      return res.status(201).json({
        success: true,
        message: "Video created successfully",
        data: newVideo,
      });
    } catch (error) {
      console.error("Error creating video:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  
  






const vidoePublished=async(req,res)=>{
    try{

    }catch(error)
    {

    }
}

export{publishedVideo}