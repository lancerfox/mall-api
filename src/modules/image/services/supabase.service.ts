import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_KEY',
    );
    this.bucketName = this.configService.get<string>(
      'SUPABASE_BUCKET_NAME',
      'mall-dev',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.error(
        'Supabase配置缺失: SUPABASE_URL 和 SUPABASE_SERVICE_KEY 是必需的',
      );
      throw new BusinessException(ERROR_CODES.IMAGE_SUPABASE_ERROR);
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log(`Supabase客户端初始化成功，存储桶: ${this.bucketName}`);
  }

  /**
   * 生成预签名上传URL
   */
  async createSignedUploadUrl(filePath: string): Promise<{
    signedUrl: string;
    path: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUploadUrl(filePath);

      if (error) {
        this.logger.error('生成预签名URL失败:', error);
        return {
          signedUrl: '',
          path: filePath,
          error: error.message,
        };
      }

      return {
        signedUrl: data.signedUrl,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Supabase服务异常:', error);
      return {
        signedUrl: '',
        path: filePath,
        error: (error as any)?.message || 'Supabase服务异常',
      };
    }
  }

  /**
   * 获取文件的公网URL
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * 删除文件
   */
  async deleteFile(
    filePath: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.error('删除文件失败:', error);
        return {
          success: false,
          error: (error as any)?.message || '删除文件失败',
        };
      }

      return { success: true };
    } catch (error) {
      this.logger.error('删除文件异常:', error);
      return {
        success: false,
        error: (error as any)?.message || '删除文件异常',
      };
    }
  }

  /**
   * 检查存储桶是否存在
   */
  async checkBucketExists(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();

      if (error) {
        this.logger.error('检查存储桶失败:', error);
        return false;
      }

      return data.some((bucket: any) => bucket.name === this.bucketName);
    } catch (error) {
      this.logger.error('检查存储桶异常:', error);
      return false;
    }
  }
}
