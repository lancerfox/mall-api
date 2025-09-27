import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
  bucketName: process.env.SUPABASE_BUCKET_NAME || 'mall-dev',
}));
