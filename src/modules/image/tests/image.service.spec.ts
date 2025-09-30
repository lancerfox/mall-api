import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from '../services/image.service';
import { SupabaseService } from '../services/supabase.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from '../entities/image.entity';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { CreateImageDto } from '../dto/create-image.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { Repository } from 'typeorm';

describe('ImageService', () => {
  let service: ImageService;
  let supabaseService: SupabaseService;
  let imageRepository: Repository<Image>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: SupabaseService,
          useValue: {
            createSignedUploadUrl: jest.fn(),
            deleteFile: jest.fn(),
            checkBucketExists: jest.fn(),
            getPublicUrl: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Image),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            findAndCount: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    imageRepository = module.get<Repository<Image>>(getRepositoryToken(Image));
  });

  describe('getUploadToken', () => {
    it('应该成功生成上传凭证', async () => {
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'test',
        fileType: 'image/jpeg',
      };

      jest.spyOn(supabaseService, 'createSignedUploadUrl').mockResolvedValue({
        signedUrl: 'https://example.com/upload?token=abc123',
        path: 'test/2024-01-01/test.jpg',
      });

      const result = await service.getUploadToken(uploadTokenDto);

      expect(result).toEqual({
        token: 'abc123',
        path: 'test/2024-01-01/test.jpg',
      });
      expect(supabaseService.createSignedUploadUrl).toHaveBeenCalledWith(
        expect.stringMatching(/test\/\d{4}-\d{2}-\d{2}\//),
      );
    });

    it('应该拒绝不支持的图片格式', async () => {
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'test',
        fileType: 'image/bmp',
      };

      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        ERROR_CODES.IMAGE_INVALID_FORMAT.message,
      );
    });

    it('应该处理Supabase服务错误', async () => {
      const uploadTokenDto: UploadTokenDto = {
        businessModule: 'test',
        fileType: 'image/jpeg',
      };

      jest.spyOn(supabaseService, 'createSignedUploadUrl').mockResolvedValue({
        signedUrl: '',
        path: 'test/2024-01-01/test.jpg',
        error: 'Supabase error',
      });

      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        ERROR_CODES.IMAGE_SUPABASE_ERROR.message,
      );
    });
  });

  describe('createImage', () => {
    it('应该成功创建图片记录', async () => {
      const createImageDto: CreateImageDto = {
        path: 'test/test.jpg',
        name: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
      };

      const mockImage = {
        id: 'uuid-123',
        ...createImageDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        productImages: [],
      };

      jest.spyOn(imageRepository, 'create').mockReturnValue(mockImage as any);
      jest.spyOn(imageRepository, 'save').mockResolvedValue(mockImage as any);

      const result = await service.createImage(createImageDto);

      expect(result).toEqual({
        id: 'uuid-123',
        createdAt: mockImage.createdAt,
      });
      expect(imageRepository.create).toHaveBeenCalledWith(createImageDto);
      expect(imageRepository.save).toHaveBeenCalledWith(mockImage);
    });

    it('应该处理创建图片记录失败', async () => {
      const createImageDto: CreateImageDto = {
        path: 'test/test.jpg',
        name: 'test.jpg',
      };

      jest
        .spyOn(imageRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.createImage(createImageDto)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.createImage(createImageDto)).rejects.toThrow(
        ERROR_CODES.IMAGE_UPLOAD_FAILED.message,
      );
    });
  });

  describe('getImageList', () => {
    it('应该返回图片列表', async () => {
      const imageListDto: ImageListDto = {
        page: 1,
        pageSize: 10,
      };

      const mockImages = [
        {
          id: 'uuid-1',
          path: 'test/image1.jpg',
          name: 'image1.jpg',
          size: 1024,
          mimeType: 'image/jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
          productImages: [],
        },
        {
          id: 'uuid-2',
          path: 'test/image2.jpg',
          name: 'image2.jpg',
          size: 2048,
          mimeType: 'image/png',
          createdAt: new Date(),
          updatedAt: new Date(),
          productImages: [],
        },
      ];

      jest
        .spyOn(imageRepository, 'findAndCount')
        .mockResolvedValue([mockImages as any, 2]);
      jest
        .spyOn(supabaseService, 'getPublicUrl')
        .mockReturnValue('https://example.com/image.jpg');

      const result = await service.getImageList(imageListDto);

      expect(result).toEqual({
        list: [
          {
            id: 'uuid-1',
            url: 'https://example.com/image.jpg',
            name: 'image1.jpg',
            size: 1024,
            createdAt: mockImages[0].createdAt,
          },
          {
            id: 'uuid-2',
            url: 'https://example.com/image.jpg',
            name: 'image2.jpg',
            size: 2048,
            createdAt: mockImages[1].createdAt,
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });
  });

  describe('deleteImage', () => {
    it('应该成功删除图片', async () => {
      const imageId = 'uuid-123';
      const mockImage = {
        id: imageId,
        path: 'test/test.jpg',
        name: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
        productImages: [],
      };

      jest
        .spyOn(imageRepository, 'findOne')
        .mockResolvedValue(mockImage as any);
      jest
        .spyOn(supabaseService, 'deleteFile')
        .mockResolvedValue({ success: true });
      jest.spyOn(imageRepository, 'remove').mockResolvedValue(mockImage as any);

      await service.deleteImage(imageId);

      expect(imageRepository.findOne).toHaveBeenCalledWith({
        where: { id: imageId },
      });
      expect(supabaseService.deleteFile).toHaveBeenCalledWith('test/test.jpg');
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });

    it('应该处理图片不存在的情况', async () => {
      const imageId = 'uuid-not-found';

      jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteImage(imageId)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.deleteImage(imageId)).rejects.toThrow(
        ERROR_CODES.IMAGE_NOT_FOUND.message,
      );
    });

    it('应该处理Supabase删除失败但继续删除数据库记录', async () => {
      const imageId = 'uuid-123';
      const mockImage = {
        id: imageId,
        path: 'test/test.jpg',
        name: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
        productImages: [],
      };

      jest
        .spyOn(imageRepository, 'findOne')
        .mockResolvedValue(mockImage as any);
      jest.spyOn(supabaseService, 'deleteFile').mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });
      jest.spyOn(imageRepository, 'remove').mockResolvedValue(mockImage as any);

      await service.deleteImage(imageId);

      expect(supabaseService.deleteFile).toHaveBeenCalledWith('test/test.jpg');
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
    });
  });

  describe('batchDeleteImages', () => {
    it('应该成功批量删除图片', async () => {
      const imageIds = ['uuid-1', 'uuid-2'];
      const mockImages = [
        {
          id: 'uuid-1',
          path: 'test/image1.jpg',
          name: 'image1.jpg',
          size: 1024,
          mimeType: 'image/jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
          productImages: [],
        },
        {
          id: 'uuid-2',
          path: 'test/image2.jpg',
          name: 'image2.jpg',
          size: 2048,
          mimeType: 'image/png',
          createdAt: new Date(),
          updatedAt: new Date(),
          productImages: [],
        },
      ];

      jest.spyOn(imageRepository, 'find').mockResolvedValue(mockImages as any);
      jest
        .spyOn(supabaseService, 'deleteFile')
        .mockResolvedValue({ success: true });
      jest
        .spyOn(imageRepository, 'remove')
        .mockResolvedValue(mockImages as any);

      await service.batchDeleteImages(imageIds);

      expect(imageRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) },
      });
      expect(supabaseService.deleteFile).toHaveBeenCalledTimes(2);
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImages);
    });

    it('应该处理部分图片不存在的情况', async () => {
      const imageIds = ['uuid-1', 'uuid-not-found'];
      const mockImages = [
        {
          id: 'uuid-1',
          path: 'test/image1.jpg',
          name: 'image1.jpg',
          size: 1024,
          mimeType: 'image/jpeg',
          createdAt: new Date(),
          updatedAt: new Date(),
          productImages: [],
        },
      ];

      jest.spyOn(imageRepository, 'find').mockResolvedValue(mockImages as any);

      await expect(service.batchDeleteImages(imageIds)).rejects.toThrow(
        BusinessException,
      );
      await expect(service.batchDeleteImages(imageIds)).rejects.toThrow(
        ERROR_CODES.IMAGE_NOT_FOUND.message,
      );
    });
  });

  describe('checkSupabaseConnection', () => {
    it('应该返回Supabase连接状态', async () => {
      jest.spyOn(supabaseService, 'checkBucketExists').mockResolvedValue(true);

      const result = await service.checkSupabaseConnection();

      expect(result).toEqual({
        connected: true,
        bucketExists: true,
      });
    });

    it('应该处理Supabase连接失败', async () => {
      jest
        .spyOn(supabaseService, 'checkBucketExists')
        .mockRejectedValue(new Error('Connection failed'));

      await expect(service.checkSupabaseConnection()).rejects.toThrow(
        BusinessException,
      );
      await expect(service.checkSupabaseConnection()).rejects.toThrow(
        ERROR_CODES.IMAGE_SUPABASE_ERROR.message,
      );
    });
  });
});
