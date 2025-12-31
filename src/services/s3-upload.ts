import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Region = process.env.NEXT_PUBLIC_AWS_REGION || "";
const s3Bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";
const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

const s3Client = new S3Client({
  region: s3Region || "us-east-1",
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
});

/**
 * Upload image to AWS S3
 * @param file - File object from input
 * @param folder - S3 folder path (e.g., 'development/author/profile')
 * @returns S3 URL of uploaded image
 */
export async function uploadToS3(file: File, folder: string): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!s3Bucket || !s3AccessKeyId || !s3SecretAccessKey) {
    throw new Error("S3 is not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and NEXT_PUBLIC_AWS_REGION.");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomId}-${file.name}`;
  const key = `${folder}/${filename}`;

  try {
    const buffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Uint8Array for AWS SDK compatibility
    const body = new Uint8Array(buffer);
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
      ACL: "public-read", // Make it publicly accessible
    });

    await s3Client.send(command);

    // Return S3 URL
    const region = s3Region || "us-east-1";
    const s3Url = `https://${s3Bucket}.s3.${region}.amazonaws.com/${key}`;
    
    console.log("[S3] Image uploaded successfully:", s3Url);
    return s3Url;
  } catch (error) {
    console.error("[S3] Upload failed:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload author profile image
 */
export async function uploadAuthorImage(file: File): Promise<string> {
  return uploadToS3(file, "development/author/profile");
}
