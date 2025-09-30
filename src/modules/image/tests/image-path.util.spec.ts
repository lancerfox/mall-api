import { ImagePathUtil } from '../../../common/utils/image-path.util';
import { SupabaseService } from '../services/supabase.service';

describe('ImagePathUtil', () => {
  describe('extractImagePath', () => {
    it('应该从Supabase公共URL中提取路径', () => {
      const url =
        'https://test.supabase.co/storage/v1/object/public/mall-dev/images/product/test.png';
      const result = ImagePathUtil.extractImagePath(url);

      expect(result).toBe('images/product/test.png');
    });

    it('应该从包含多个段的URL中提取路径', () => {
      const url =
        'https://test.supabase.co/storage/v1/object/public/bucket-name/folder1/folder2/image.png';
      const result = ImagePathUtil.extractImagePath(url);

      expect(result).toBe('folder1/folder2/image.png');
    });

    it('应该对非URL输入返回原始字符串', () => {
      const path = 'images/test.png';
      const result = ImagePathUtil.extractImagePath(path);

      expect(result).toBe('images/test.png');
    });

    it('应该对无效URL返回原始字符串', () => {
      const invalidUrl = 'not-a-valid-url';
      const result = ImagePathUtil.extractImagePath(invalidUrl);

      expect(result).toBe('not-a-valid-url');
    });

    it('应该处理没有public段的URL', () => {
      const url = 'https://example.com/images/test.png';
      const result = ImagePathUtil.extractImagePath(url);

      expect(result).toBe('https://example.com/images/test.png');
    });
  });

  describe('buildImageUrl', () => {
    const mockSupabaseService = {
      getPublicUrl: jest.fn(),
    } as unknown as SupabaseService;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('应该对完整URL输入返回原始URL', () => {
      const url = 'https://example.com/images/test.png';
      const result = ImagePathUtil.buildImageUrl(url, mockSupabaseService);

      expect(result).toBe(url);
      expect(mockSupabaseService.getPublicUrl).not.toHaveBeenCalled();
    });

    it('应该使用Supabase服务为相对路径构建URL', () => {
      const path = 'images/test.png';
      const expectedUrl =
        'https://test.supabase.co/storage/v1/object/public/mall-dev/images/test.png';

      mockSupabaseService.getPublicUrl = jest.fn().mockReturnValue(expectedUrl);

      const result = ImagePathUtil.buildImageUrl(path, mockSupabaseService);

      expect(result).toBe(expectedUrl);
      expect(mockSupabaseService.getPublicUrl).toHaveBeenCalledWith(path);
    });

    it('应该对空路径返回空字符串', () => {
      const result = ImagePathUtil.buildImageUrl('', mockSupabaseService);

      expect(result).toBe('');
      expect(mockSupabaseService.getPublicUrl).not.toHaveBeenCalled();
    });

    it('应该当Supabase服务失败时返回原始路径', () => {
      const path = 'images/test.png';

      mockSupabaseService.getPublicUrl = jest.fn().mockImplementation(() => {
        throw new Error('Service error');
      });

      const result = ImagePathUtil.buildImageUrl(path, mockSupabaseService);

      expect(result).toBe(path);
    });

    it('应该优雅地处理无效URL', () => {
      const path = 'images/test.png';

      mockSupabaseService.getPublicUrl = jest
        .fn()
        .mockReturnValue('invalid-url');

      const result = ImagePathUtil.buildImageUrl(path, mockSupabaseService);

      expect(result).toBe('invalid-url');
    });
  });

  describe('edge cases', () => {
    it('应该处理带有查询参数的URL', () => {
      const url =
        'https://test.supabase.co/storage/v1/object/public/mall-dev/images/test.png?token=abc123';
      const result = ImagePathUtil.extractImagePath(url);

      expect(result).toBe('images/test.png');
    });

    it('应该处理带有片段的URL', () => {
      const url =
        'https://test.supabase.co/storage/v1/object/public/mall-dev/images/test.png#section';
      const result = ImagePathUtil.extractImagePath(url);

      expect(result).toBe('images/test.png');
    });

    it('应该处理复杂路径', () => {
      const path = '2023/10/27/product/images/12345-67890.png';
      const result = ImagePathUtil.extractImagePath(path);

      expect(result).toBe('2023/10/27/product/images/12345-67890.png');
    });
  });
});
