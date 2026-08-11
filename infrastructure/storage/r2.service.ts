import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

let config: R2Config | null = null;
let s3: S3Client | null = null;

// ✅ Lazy init — só valida env quando a função for chamada, nunca no module-load
// (evita quebrar build/import de módulos em dev sem variáveis configuradas)
function getConfig(): R2Config {
  if (config) return config;

  const requiredEnvVars = {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  } as const;

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`[r2.service] Variable de entorno faltante: ${key}`);
    }
  }

  config = {
    accountId: requiredEnvVars.R2_ACCOUNT_ID as string,
    accessKeyId: requiredEnvVars.R2_ACCESS_KEY_ID as string,
    secretAccessKey: requiredEnvVars.R2_SECRET_ACCESS_KEY as string,
    bucketName: requiredEnvVars.R2_BUCKET_NAME as string,
  };
  return config;
}

// ✅ UM único client — mesmo para upload e delete
function getS3Client(): S3Client {
  if (s3) return s3;
  const { accountId, accessKeyId, secretAccessKey } = getConfig();
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return s3;
}

export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const { bucketName } = getConfig();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 60 });
}

// ✅ USA o mesmo client s3 (R2_BUCKET_NAME, não CLOUDFLARE_R2_BUCKET_NAME)
export async function deleteR2Object(key: string): Promise<void> {
  const { bucketName } = getConfig();
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  await getS3Client().send(command);
}
