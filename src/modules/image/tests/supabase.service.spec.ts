import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseService } from '../services/supabase.service';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { createClient } from '@supabase/supabase-js';

// Mock the supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;

  const mockSupabaseClient = {
    storage: {
      from: jest.fn().mockReturnThis(),
      createSignedUploadUrl: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
      listBuckets: jest.fn(),
    },
  };

  beforeEach(async () => {
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
          envFilePath: '.env.test',
        }),
      ],
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('应该成功初始化Supabase客户端', () => {
      expect(createClient).toHaveBeenCalledWith(
        configService.get('SUPABASE_URL'),
        configService.get('SUPABASE_SERVICE_KEY'),
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );
    });

    it('应该在配置缺失时抛出异常', async () => {
      // 临时清除环境变量来测试配置缺失的情况
      const originalUrl = process.env.SUPABASE_URL;
      const originalKey = process.env.SUPABASE_SERVICE_KEY;
      
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_KEY;

      try {
        await expect(async () => {
          const module = await Test.createTestingModule({
            imports: [
              ConfigModule.forRoot({
                isGlobal: true,
                ignoreEnvFile: true, // 忽略环境文件，确保使用当前进程环境变量
                load: [
                  () => ({
                    SUPABASE_URL: process.env.SUPABASE_URL,
                    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
                    SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
                  }),
                ],
              }),
            ],
            providers: [SupabaseService],
          }).compile();

          // 实例化服务时会检查配置
          module.get<SupabaseService>(SupabaseService);
        }).rejects.toThrow(BusinessException);
      } finally {
        // 恢复环境变量
        process.env.SUPABASE_URL = originalUrl;
        process.env.SUPABASE_SERVICE_KEY = originalKey;
      }
    });
  });

  describe('createSignedUploadUrl', () => {
    it('应该成功生成预签名URL', async () => {
      const filePath = 'test/image.jpg';
      const mockResponse = {
        data: {
          signedUrl: 'https://example.supabase.co/upload?token=abc123',
        },
        error: null,
      };

      mockSupabaseClient.storage.createSignedUploadUrl.mockResolvedValue(
        mockResponse,
      );

      const result = await service.createSignedUploadUrl(filePath);

      expect(result).toEqual({
        signedUrl: 'https://example.supabase.co/upload?token=abc123',
        path: filePath,
      });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        configService.get('SUPABASE_BUCKET_NAME'),
      );
      expect(
        mockSupabaseClient.storage.createSignedUploadUrl,
      ).toHaveBeenCalledWith(filePath);
    });

    it('应该处理Supabase错误', async () => {
      const filePath = 'test/image.jpg';
      const mockError = new Error('Upload failed');

      mockSupabaseClient.storage.createSignedUploadUrl.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await service.createSignedUploadUrl(filePath);

      expect(result).toEqual({
        signedUrl: '',
        path: filePath,
        error: 'Upload failed',
      });
    });

    it('应该处理异常情况', async () => {
      const filePath = 'test/image.jpg';

      mockSupabaseClient.storage.createSignedUploadUrl.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await service.createSignedUploadUrl(filePath);

      expect(result).toEqual({
        signedUrl: '',
        path: filePath,
        error: 'Network error',
      });
    });
  });

  describe('getPublicUrl', () => {
    it('应该返回文件的公网URL', () => {
      const filePath = 'test/image.jpg';
      const mockPublicUrl =
        'https://example.supabase.co/storage/v1/object/public/mall-test/test/image.jpg';

      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: {
          publicUrl: mockPublicUrl,
        },
      });

      const result = service.getPublicUrl(filePath);

      expect(result).toBe(mockPublicUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        configService.get('SUPABASE_BUCKET_NAME'),
      );
      expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
        filePath,
      );
    });
  });

  describe('deleteFile', () => {
    it('应该成功删除文件', async () => {
      const filePath = 'test/image.jpg';

      mockSupabaseClient.storage.remove.mockResolvedValue({ error: null });

      const result = await service.deleteFile(filePath);

      expect(result).toEqual({ success: true });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        configService.get('SUPABASE_BUCKET_NAME'),
      );
      expect(mockSupabaseClient.storage.remove).toHaveBeenCalledWith([
        filePath,
      ]);
    });

    it('应该处理删除失败', async () => {
      const filePath = 'test/image.jpg';
      const mockError = new Error('Delete failed');

      mockSupabaseClient.storage.remove.mockResolvedValue({ error: mockError });

      const result = await service.deleteFile(filePath);

      expect(result).toEqual({
        success: false,
        error: 'Delete failed',
      });
    });

    it('应该处理删除异常', async () => {
      const filePath = 'test/image.jpg';

      mockSupabaseClient.storage.remove.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await service.deleteFile(filePath);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });
  });

  describe('checkBucketExists', () => {
    it('应该返回true当存储桶存在', async () => {
      const mockBuckets = [
        { name: 'other-bucket' },
        { name: configService.get('SUPABASE_BUCKET_NAME') },
        { name: 'another-bucket' },
      ];

      mockSupabaseClient.storage.listBuckets.mockResolvedValue({
        data: mockBuckets,
        error: null,
      });

      const result = await service.checkBucketExists();

      expect(result).toBe(true);
      expect(mockSupabaseClient.storage.listBuckets).toHaveBeenCalled();
    });

    it('应该返回false当存储桶不存在', async () => {
      const mockBuckets = [
        { name: 'other-bucket' },
        { name: 'another-bucket' },
      ];

      mockSupabaseClient.storage.listBuckets.mockResolvedValue({
        data: mockBuckets,
        error: null,
      });

      const result = await service.checkBucketExists();

      expect(result).toBe(false);
    });

    it('应该返回false当列表存储桶失败', async () => {
      mockSupabaseClient.storage.listBuckets.mockResolvedValue({
        data: null,
        error: new Error('List buckets failed'),
      });

      const result = await service.checkBucketExists();

      expect(result).toBe(false);
    });

    it('应该返回false当发生异常', async () => {
      mockSupabaseClient.storage.listBuckets.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await service.checkBucketExists();

      expect(result).toBe(false);
    });
  });
});
