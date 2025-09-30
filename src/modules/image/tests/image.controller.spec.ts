import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { BatchDeleteImageDto } from '../dto/batch-delete-image.dto';
import {
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';
import { ImageListResponseDto } from '../dto/image-list-response.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('ImageController', () => {
  let controller: ImageController;
  let service: ImageService;

  const mockImageService = {
    getUploadToken: jest.fn(),
    createImage: jest.fn(),
    getImageList: jest.fn(),
    deleteImage: jest.fn(),
    batchDeleteImages: jest.fn(),
    checkSupabaseConnection: jest.fn(),
  };

  beforeEach(async () => {
    // 设置测试环境变量
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    process.env.SUPABASE_BUCKET_NAME = 'test-bucket';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              SUPABASE_URL: process.env.SUPABASE_URL,
              SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
              SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
            }),
          ],
        }),
      ],
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 清理测试环境变量
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_BUCKET_NAME;
  });

  describe('getUploadToken', () => {
    it('should return upload token successfully', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/png',
        businessModule: 'product',
      };
      const expectedResult: UploadTokenResponseDto = {
        token: 'test-token',
        path: 'product/2023-10-27/test.png',
      };

      mockImageService.getUploadToken.mockResolvedValue(expectedResult);

      const result = await controller.getUploadToken(uploadTokenDto);

      expect(result).toEqual(expectedResult);
      expect(service.getUploadToken).toHaveBeenCalledWith(uploadTokenDto);
    });

    it('应该处理服务错误', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/png',
      };

      mockImageService.getUploadToken.mockRejectedValue(
        new BusinessException(ERROR_CODES.IMAGE_INVALID_FORMAT),
      );

      await expect(controller.getUploadToken(uploadTokenDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('should handle service errors', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/png',
      };

      mockImageService.getUploadToken.mockRejectedValue(
        new BusinessException(ERROR_CODES.IMAGE_INVALID_FORMAT),
      );

      await expect(controller.getUploadToken(uploadTokenDto)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('createImage', () => {
    it('应该成功创建图片', async () => {
      const createImageDto: CreateImageDto = {
        path: 'images/test.png',
        name: 'test.png',
        size: 1024,
        mimeType: 'image/png',
      };
      const expectedResult: CreateImageResponseDto = {
        id: 'test-id',
        createdAt: new Date(),
      };

      mockImageService.createImage.mockResolvedValue(expectedResult);

      const result = await controller.createImage(createImageDto);

      expect(result).toEqual(expectedResult);
      expect(service.createImage).toHaveBeenCalledWith(createImageDto);
    });
  });

  describe('getImageList', () => {
    it('应该成功返回图片列表', async () => {
      const imageListDto: ImageListDto = {
        page: 1,
        pageSize: 20,
      };
      const expectedResult: ImageListResponseDto = {
        list: [
          {
            id: 'test-id',
            url: 'https://example.com/test.png',
            name: 'test.png',
            size: 1024,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      mockImageService.getImageList.mockResolvedValue(expectedResult);

      const result = await controller.getImageList(imageListDto);

      expect(result).toEqual(expectedResult);
      expect(service.getImageList).toHaveBeenCalledWith(imageListDto);
    });
  });

  describe('deleteImage', () => {
    it('应该调用deleteImage进行单张图片删除', async () => {
      const deleteImageDto: DeleteImageDto = {
        imageId: 'test-id',
      };

      mockImageService.deleteImage.mockResolvedValue(undefined);

      await controller.deleteImage(deleteImageDto);

      expect(service.deleteImage).toHaveBeenCalledWith('test-id');
      expect(service.batchDeleteImages).not.toHaveBeenCalled();
    });

    it('应该调用batchDeleteImages进行批量删除', async () => {
      const batchDeleteImageDto: BatchDeleteImageDto = {
        imageIds: ['test-id-1', 'test-id-2'],
      };

      mockImageService.batchDeleteImages.mockResolvedValue(undefined);

      await controller.deleteImage(batchDeleteImageDto);

      expect(service.batchDeleteImages).toHaveBeenCalledWith([
        'test-id-1',
        'test-id-2',
      ]);
      expect(service.deleteImage).not.toHaveBeenCalled();
    });

    it('应该正确处理混合DTO类型', async () => {
      const deleteImageDto = {
        imageId: 'test-id',
      } as DeleteImageDto;

      mockImageService.deleteImage.mockResolvedValue(undefined);

      await controller.deleteImage(deleteImageDto);

      expect(service.deleteImage).toHaveBeenCalledWith('test-id');
    });
  });

  describe('checkHealth', () => {
    it('应该返回健康检查结果', async () => {
      const expectedResult = {
        connected: true,
        bucketExists: true,
      };

      mockImageService.checkSupabaseConnection.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.checkHealth();

      expect(result).toEqual(expectedResult);
      expect(service.checkSupabaseConnection).toHaveBeenCalled();
    });
  });
});
