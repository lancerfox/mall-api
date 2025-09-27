import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageService } from '../services/image.service';
import { SupabaseService } from '../services/supabase.service';
import { Image } from '../entities/image.entity';
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

describe('ImageService', () => {
  let imageService: ImageService;
  let imageRepository: jest.Mocked<Repository<Image>>;
  let supabaseService: jest.Mocked<SupabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(Image),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            createSignedUploadUrl: jest.fn(),
            getPublicUrl: jest.fn(),
            deleteFile: jest.fn(),
            checkBucketExists: jest.fn(),
          },
        },
      ],
    }).compile();

    imageService = module.get<ImageService>(ImageService);
    imageRepository = module.get(getRepositoryToken(Image));
    supabaseService = module.get(SupabaseService);
  });

  describe('getUploadToken', () => {
    it('应该成功生成上传凭证', async () => {
      // 安排
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'product',
        fileType: 'image/png',
      };

      const mockSupabaseResponse = {
        signedUrl:
          'https://example.supabase.co/storage/v1/object/upload/sign/mall-dev/product/2023-10-27/123456789_test.png',
        path: 'product/2023-10-27/123456789_test.png',
      };

      supabaseService.createSignedUploadUrl.mockResolvedValue(
        mockSupabaseResponse,
      );

      // 执行
      const result = await imageService.getUploadToken(uploadTokenDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toBeDefined();
      expect(result.data?.signedUrl).toBe(mockSupabaseResponse.signedUrl);
      expect(result.data?.path).toBe(mockSupabaseResponse.path);
      expect(supabaseService.createSignedUploadUrl).toHaveBeenCalled();
    });

    it('应该在文件类型不支持时返回错误', async () => {
      // 安排
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'product',
        fileType: 'text/plain',
      };

      // 执行
      const result = await imageService.getUploadToken(uploadTokenDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.IMAGE_INVALID_FORMAT);
      expect(result.message).toBe('图片格式不支持');
      expect(result.data).toBeNull();
    });

    it('应该在Supabase服务出错时返回错误', async () => {
      // 安排
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'product',
        fileType: 'image/png',
      };

      const mockSupabaseError = {
        signedUrl: '',
        path: 'product/2023-10-27/123456789_test.png',
        error: 'Supabase服务错误',
      };

      supabaseService.createSignedUploadUrl.mockResolvedValue(
        mockSupabaseError,
      );

      // 执行
      const result = await imageService.getUploadToken(uploadTokenDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.IMAGE_SUPABASE_ERROR);
      expect(result.message).toContain('Supabase错误');
      expect(result.data).toBeNull();
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

      const mockImage: Image = {
        id: 1,
        url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
        createdAt: new Date('2023-10-27T10:00:00Z'),
        updatedAt: new Date('2023-10-27T10:00:00Z'),
        productImages: [],
      };

      imageRepository.create.mockReturnValue(mockImage);
      imageRepository.save.mockResolvedValue(mockImage);

      // 执行
      const result = await imageService.createImage(createImageDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(1);
      expect(result.data?.url).toBe(createImageDto.url);
      expect(imageRepository.create).toHaveBeenCalledWith({
        ...createImageDto,
        url: createImageDto.url,
      });
      expect(imageRepository.save).toHaveBeenCalledWith(mockImage);
    });

    it('应该在没有提供URL时根据path生成公网URL', async () => {
      // 安排
      const createImageDto: CreateImageDto = {
        url: '',
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
      };

      const generatedUrl =
        'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png';

      const mockImage: Image = {
        id: 1,
        url: generatedUrl,
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
        createdAt: new Date('2023-10-27T10:00:00Z'),
        updatedAt: new Date('2023-10-27T10:00:00Z'),
        productImages: [],
      };

      supabaseService.getPublicUrl.mockReturnValue(generatedUrl);
      imageRepository.create.mockReturnValue(mockImage);
      imageRepository.save.mockResolvedValue(mockImage);

      // 执行
      const result = await imageService.createImage(createImageDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data?.url).toBe(generatedUrl);
      expect(supabaseService.getPublicUrl).toHaveBeenCalledWith(
        createImageDto.path,
      );
    });
  });

  describe('getImageList', () => {
    it('应该成功获取图片列表', async () => {
      // 安排
      const imageListDto: ImageListDto = {
        page: 1,
        pageSize: 20,
      };

      const mockImages: Image[] = [
        {
          id: 1,
          url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
          path: 'product/2023-10-27/123456789_test.png',
          name: 'test.png',
          size: 102400,
          mimeType: 'image/png',
          createdAt: new Date('2023-10-27T10:00:00Z'),
          updatedAt: new Date('2023-10-27T10:00:00Z'),
          productImages: [],
        },
      ];

      const mockResponse: [Image[], number] = [mockImages, 1];

      const expectedItems: ImageResponseDto[] = [
        {
          id: 1,
          url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
          name: 'test.png',
          size: 102400,
          createdAt: new Date('2023-10-27T10:00:00Z'),
        },
      ];

      imageRepository.findAndCount.mockResolvedValue(mockResponse);

      // 执行
      const result = await imageService.getImageList(imageListDto);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toBeDefined();
      expect(result.data?.items).toEqual(expectedItems);
      expect(result.data?.total).toBe(1);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
      expect(result.data?.totalPages).toBe(1);
      expect(imageRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('deleteImage', () => {
    it('应该成功删除图片', async () => {
      // 安排
      const imageId = 1;

      const mockImage: Image = {
        id: 1,
        url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
        createdAt: new Date('2023-10-27T10:00:00Z'),
        updatedAt: new Date('2023-10-27T10:00:00Z'),
        productImages: [],
      };

      imageRepository.findOne.mockResolvedValue(mockImage);
      supabaseService.deleteFile.mockResolvedValue({ success: true });
      imageRepository.remove.mockResolvedValue(mockImage);

      // 执行
      const result = await imageService.deleteImage(imageId);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toBeNull();
      expect(imageRepository.findOne).toHaveBeenCalledWith({
        where: { id: imageId },
      });
      expect(supabaseService.deleteFile).toHaveBeenCalledWith(mockImage.path);
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });

    it('应该在图片不存在时返回错误', async () => {
      // 安排
      const imageId = 999;

      imageRepository.findOne.mockResolvedValue(null);

      // 执行
      const result = await imageService.deleteImage(imageId);

      // 断言
      expect(result.code).toBe(ERROR_CODES.IMAGE_NOT_FOUND);
      expect(result.message).toBe('图片不存在');
      expect(result.data).toBeNull();
    });

    it('应该在Supabase文件删除失败时仍然删除数据库记录', async () => {
      // 安排
      const imageId = 1;

      const mockImage: Image = {
        id: 1,
        url: 'https://example.supabase.co/storage/v1/object/public/mall-dev/product/2023-10-27/123456789_test.png',
        path: 'product/2023-10-27/123456789_test.png',
        name: 'test.png',
        size: 102400,
        mimeType: 'image/png',
        createdAt: new Date('2023-10-27T10:00:00Z'),
        updatedAt: new Date('2023-10-27T10:00:00Z'),
        productImages: [],
      };

      imageRepository.findOne.mockResolvedValue(mockImage);
      supabaseService.deleteFile.mockResolvedValue({
        success: false,
        error: '删除失败',
      });
      imageRepository.remove.mockResolvedValue(mockImage);

      // 执行
      const result = await imageService.deleteImage(imageId);

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toBeNull();
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });
  });

  describe('checkSupabaseConnection', () => {
    it('应该成功检查Supabase连接状态', async () => {
      // 安排
      supabaseService.checkBucketExists.mockResolvedValue(true);

      // 执行
      const result = await imageService.checkSupabaseConnection();

      // 断言
      expect(result.code).toBe(ERROR_CODES.SUCCESS);
      expect(result.message).toBe('操作成功');
      expect(result.data).toEqual({
        connected: true,
        bucketExists: true,
      });
      expect(supabaseService.checkBucketExists).toHaveBeenCalled();
    });

    it('应该在检查失败时返回错误状态', async () => {
      // 安排
      supabaseService.checkBucketExists.mockRejectedValue(
        new Error('连接失败'),
      );

      // 执行
      const result = await imageService.checkSupabaseConnection();

      // 断言
      expect(result.code).toBe(ERROR_CODES.IMAGE_SUPABASE_ERROR);
      expect(result.message).toBe('Supabase存储服务错误');
      expect(result.data).toEqual({
        connected: false,
        bucketExists: false,
      });
    });
  });
});
