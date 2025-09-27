import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import {
  IApiResponse,
  IPaginatedResponse,
} from '../../../common/types/api-response.interface';
import {
  ImageResponseDto,
  UploadTokenResponseDto,
  CreateImageResponseDto,
} from '../dto/image-response.dto';

describe('ImageController', () => {
  let imageController: ImageController;
  let imageService: jest.Mocked<ImageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: {
            getUploadToken: jest.fn(),
            createImage: jest.fn(),
            getImageList: jest.fn(),
            deleteImage: jest.fn(),
            checkSupabaseConnection: jest.fn(),
          },
        },
      ],
    }).compile();

    imageController = module.get<ImageController>(ImageController);
    imageService = module.get(ImageService);
  });

  describe('getUploadToken', () => {
    it('应该成功获取图片上传凭证', async () => {
      // 安排
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'product',
        fileType: 'image/png',
      };

      const mockResponse: IApiResponse<UploadTokenResponseDto> = {
        code: ERROR_CODES.SUCCESS,
        message: '操作成功',
        data: {
          signedUrl:
            'https://example.supabase.co/storage/v1/object/upload/sign/mall-dev/product/2023-10-27/123456789_test.png',
          path: 'product/2023-10-27/123456789_test.png',
        },
      };

      imageService.getUploadToken.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.getUploadToken(uploadTokenDto);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.getUploadToken).toHaveBeenCalledWith(uploadTokenDto);
    });

    it('应该在文件类型不支持时返回错误响应', async () => {
      // 安排
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'product',
        fileType: 'text/plain',
      };

      const mockResponse: IApiResponse<UploadTokenResponseDto> = {
        code: ERROR_CODES.IMAGE_INVALID_FORMAT,
        message: '图片格式不支持',
        data: null,
      };

      imageService.getUploadToken.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.getUploadToken(uploadTokenDto);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.getUploadToken).toHaveBeenCalledWith(uploadTokenDto);
    });
  });

  describe('createImage', () => {
    it('应该成功创建图片记录', async () => {
      // 安排
      const createImageDto: CreateImageDto = {
        url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
      };

      const mockResponse: IApiResponse<CreateImageResponseDto> = {
        code: ERROR_CODES.SUCCESS,
        message: '操作成功',
        data: {
          id: 1,
          url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
          createdAt: new Date('2023-10-27T10:00:00Z'),
        },
      };

      imageService.createImage.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.createImage(createImageDto);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.createImage).toHaveBeenCalledWith(createImageDto);
    });
  });

  describe('getImageList', () => {
    it('应该成功获取图片列表', async () => {
      // 安排
      const imageListDto: ImageListDto = {
        page: 1,
        pageSize: 20,
      };

      const mockItems: ImageResponseDto[] = [
        {
          id: 1,
          url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
          name: 'test.png',
          size: 102400,
          createdAt: new Date('2023-10-27T10:00:00Z'),
        },
      ];

      const mockResponse: IApiResponse<IPaginatedResponse<ImageResponseDto>> = {
        code: ERROR_CODES.SUCCESS,
        message: '操作成功',
        data: {
          items: mockItems,
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      imageService.getImageList.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.getImageList(imageListDto);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.getImageList).toHaveBeenCalledWith(imageListDto);
    });
  });

  describe('deleteImage', () => {
    it('应该成功删除图片', async () => {
      // 安排
      const imageId = 1;
      const body = { imageId };

      const mockResponse: IApiResponse<null> = {
        code: ERROR_CODES.SUCCESS,
        message: '操作成功',
        data: null,
      };

      imageService.deleteImage.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.deleteImage(body);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.deleteImage).toHaveBeenCalledWith(imageId);
    });

    it('应该在图片不存在时返回错误响应', async () => {
      // 安排
      const imageId = 999;
      const body = { imageId };

      const mockResponse: IApiResponse<null> = {
        code: ERROR_CODES.IMAGE_NOT_FOUND,
        message: '图片不存在',
        data: null,
      };

      imageService.deleteImage.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.deleteImage(body);

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.deleteImage).toHaveBeenCalledWith(imageId);
    });
  });

  describe('checkHealth', () => {
    it('应该成功检查Supabase连接状态', async () => {
      // 安排
      const mockResponse: IApiResponse<{
        connected: boolean;
        bucketExists: boolean;
      }> = {
        code: ERROR_CODES.SUCCESS,
        message: '操作成功',
        data: {
          connected: true,
          bucketExists: true,
        },
      };

      imageService.checkSupabaseConnection.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.checkHealth();

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.checkSupabaseConnection).toHaveBeenCalled();
    });

    it('应该在连接失败时返回错误响应', async () => {
      // 安排
      const mockResponse: IApiResponse<{
        connected: boolean;
        bucketExists: boolean;
      }> = {
        code: ERROR_CODES.IMAGE_SUPABASE_ERROR,
        message: 'Supabase存储服务错误',
        data: {
          connected: false,
          bucketExists: false,
        },
      };

      imageService.checkSupabaseConnection.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageController.checkHealth();

      // 断言
      expect(result).toEqual(mockResponse);
      expect(imageService.checkSupabaseConnection).toHaveBeenCalled();
    });
  });
});
