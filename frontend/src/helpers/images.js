import { supabase } from "./supabase";

export const uploadImage = async (file) => {
  console.log(file);
  const bucket = 'images'; 
  const fileName = `${Date.now()}-${file.name}`; 
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error.message);
    return null;
  }

  const filePath = data.path;
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;

  return { filePath, publicUrl, bucket };
};

export const deleteImage = async (file) => {
  console.log(file);
  const {bucket, filePath} = file;

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if(error) {
    console.log('Error deleting image: ', error);
  } else {
    console.log('Image deleted successfully!');
  }
}