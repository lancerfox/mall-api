import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../services/supabase.service';

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: jest.fn().mockReturnThis(),
    createSignedUploadUrl: jest.fn(),
    getPublicUrl: jest.fn(),
    remove: jest.fn(),
    listBuckets: jest.fn(),
  },
};

// Mock @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseService', () => {
  let supabaseService: SupabaseService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              switch (key) {
                case 'SUPABASE_URL':
                  return 'http://47.115.232.131';
                case 'SUPABASE_SERVICE_KEY':
                  return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwicmVmIjoic2JwLWtzcnBwYWRyOXZveWlrNzMiLCJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1ODg2ODAyOCwiZXhwIjoyMDc0NDQ0MDI4fQ.4zqW5ksm4GGsc2wQnNWQGf0g--K71lJzWhqk0YxTPa0';
                case 'SUPABASE_BUCKET_NAME':
                  return 'mall-test';
                default:
                  return defaultValue;
              }
            }),
          },
        },
      ],
    }).compile();

    supabaseService = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该成功创建SupabaseService实例', () => {
    expect(supabaseService).toBeDefined();
  });

  describe('createSignedUploadUrl', () => {
    it('应该成功生成预签名上传URL', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const mockResponse = {
        data: {
          signedUrl:
            'http://47.115.232.131/storage/v1/object/upload/sign/mall-test/test/path/image.png?token=abc123',
        },
        error: null,
      };

      mockSupabaseClient.storage
        .from()
        .createSignedUploadUrl.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.createSignedUploadUrl(filePath);

      // 断言
      expect(result).toEqual({
        signedUrl:
          'http://47.115.232.131/storage/v1/object/upload/sign/mall-test/test/path/image.png?token=abc123',
        path: filePath,
      });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('mall-test');
      expect(
        mockSupabaseClient.storage.from().createSignedUploadUrl,
      ).toHaveBeenCalledWith(filePath);
    });

    it('应该在Supabase返回错误时返回错误信息', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const mockResponse = {
        data: null,
        error: {
          message: '存储桶不存在',
        },
      };

      mockSupabaseClient.storage
        .from()
        .createSignedUploadUrl.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.createSignedUploadUrl(filePath);

      // 断言
      expect(result).toEqual({
        signedUrl: '',
        path: filePath,
        error: '存储桶不存在',
      });
    });

    it('应该在发生异常时返回错误信息', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const errorMessage = '网络错误';

      mockSupabaseClient.storage
        .from()
        .createSignedUploadUrl.mockRejectedValue(new Error(errorMessage));

      // 执行
      const result = await supabaseService.createSignedUploadUrl(filePath);

      // 断言
      expect(result).toEqual({
        signedUrl: '',
        path: filePath,
        error: errorMessage,
      });
    });
  });

  describe('getPublicUrl', () => {
    it('应该成功获取文件的公网URL', () => {
      // 安排
      const filePath = 'test/path/image.png';
      const mockResponse = {
        data: {
          publicUrl:
            'http://47.115.232.131/storage/v1/object/public/mall-test/test/path/image.png',
        },
      };

      mockSupabaseClient.storage
        .from()
        .getPublicUrl.mockReturnValue(mockResponse);

      // 执行
      const result = supabaseService.getPublicUrl(filePath);

      // 断言
      expect(result).toBe(
        'http://47.115.232.131/storage/v1/object/public/mall-test/test/path/image.png',
      );
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('mall-test');
      expect(
        mockSupabaseClient.storage.from().getPublicUrl,
      ).toHaveBeenCalledWith(filePath);
    });
  });

  describe('deleteFile', () => {
    it('应该成功删除文件', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const mockResponse = {
        error: null,
      };

      mockSupabaseClient.storage.from().remove.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.deleteFile(filePath);

      // 断言
      expect(result).toEqual({ success: true });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('mall-test');
      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith([
        filePath,
      ]);
    });

    it('应该在删除文件失败时返回错误信息', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const mockResponse = {
        error: {
          message: '文件不存在',
        },
      };

      mockSupabaseClient.storage.from().remove.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.deleteFile(filePath);

      // 断言
      expect(result).toEqual({
        success: false,
        error: '文件不存在',
      });
    });

    it('应该在发生异常时返回错误信息', async () => {
      // 安排
      const filePath = 'test/path/image.png';
      const errorMessage = '网络错误';

      mockSupabaseClient.storage
        .from()
        .remove.mockRejectedValue(new Error(errorMessage));

      // 执行
      const result = await supabaseService.deleteFile(filePath);

      // 断言
      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
    });
  });

  describe('checkBucketExists', () => {
    it('应该成功检查存储桶是否存在', async () => {
      // 安排
      const mockResponse = {
        data: [
          { name: 'mall-test', id: 'bucket1' },
          { name: 'other-bucket', id: 'bucket2' },
        ],
        error: null,
      };

      mockSupabaseClient.storage.listBuckets.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.checkBucketExists();

      // 断言
      expect(result).toBe(true);
      expect(mockSupabaseClient.storage.listBuckets).toHaveBeenCalled();
    });

    it('应该在存储桶不存在时返回false', async () => {
      // 安排
      const mockResponse = {
        data: [{ name: 'other-bucket', id: 'bucket2' }],
        error: null,
      };

      mockSupabaseClient.storage.listBuckets.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.checkBucketExists();

      // 断言
      expect(result).toBe(false);
    });

    it('应该在Supabase返回错误时返回false', async () => {
      // 安排
      const mockResponse = {
        data: null,
        error: {
          message: '权限不足',
        },
      };

      mockSupabaseClient.storage.listBuckets.mockResolvedValue(mockResponse);

      // 执行
      const result = await supabaseService.checkBucketExists();

      // 断言
      expect(result).toBe(false);
    });

    it('应该在发生异常时返回false', async () => {
      // 安排
      const errorMessage = '网络错误';

      mockSupabaseClient.storage.listBuckets.mockRejectedValue(
        new Error(errorMessage),
      );

      // 执行
      const result = await supabaseService.checkBucketExists();

      // 断言
      expect(result).toBe(false);
    });
  });
});
