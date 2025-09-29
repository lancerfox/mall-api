import { SupabaseService } from '../../modules/image/services/supabase.service';

/**
 * 图片路径处理工具类
 */
export class ImagePathUtil {
  /**
   * 从完整URL中提取图片路径
   * @param imageUrl 完整的图片URL
   * @returns 图片路径
   */
  static extractImagePath(imageUrl: string): string {
    try {
      // 如果是完整的URL，提取路径部分
      const url = new URL(imageUrl);
      // Supabase公共URL格式: /storage/v1/object/public/{bucket}/{path}
      const pathSegments = url.pathname.split('/');
      const publicIndex = pathSegments.indexOf('public');

      // 如果找到了public段，提取其后的路径
      if (publicIndex !== -1 && publicIndex < pathSegments.length - 2) {
        // 跳过 'public' 和 bucket name，获取实际的文件路径
        const pathAfterPublic = pathSegments.slice(publicIndex + 2);
        return pathAfterPublic.join('/');
      }

      // 如果没有找到预期的格式，返回原URL（可能是相对路径）
      return imageUrl;
    } catch {
      // 如果不是有效的URL格式，直接返回
      return imageUrl;
    }
  }

  /**
   * 将图片路径拼接成完整URL
   * @param path 图片路径
   * @param supabaseService Supabase服务实例
   * @returns 完整的图片URL
   */
  static buildImageUrl(path: string, supabaseService: SupabaseService): string {
    if (!path) return '';

    try {
      // 如果已经是完整URL，直接返回
      new URL(path);
      return path;
    } catch {
      // 如果是相对路径，通过Supabase服务生成完整URL
      try {
        return supabaseService.getPublicUrl(path);
      } catch {
        // 如果转换失败，返回原路径
        return path;
      }
    }
  }
}
