import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageService } from '../services/image.service';
import { SupabaseService } from '../services/supabase.service';
import { Image } from '../entities/image.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { ImageListDto } from '../dto/image-list.dto';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { CreateImageDto } from '../dto/create-image.dto';
// import { ImagePathUtil } from '../../../common/utils/image_path.util';

describe('ImageService', () => {
  let service: ImageService;
  let repository: Repository<Image>;
  let supabaseService: SupabaseService;

  // Mock data
  const mockImage = {
    id: '1',
    path: 'test/path/image.jpg',
    url: 'https://example.com/test/path/image.jpg',
    name: 'test-image',
    size: 1024,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(Image),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            preload: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            createSignedUploadUrl: jest.fn(),
            deleteFile: jest.fn(),
            checkBucketExists: jest.fn(),
            getPublicUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    repository = module.get<Repository<Image>>(getRepositoryToken(Image));
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadToken', () => {
    it('should throw IMAGE_INVALID_FORMAT error for invalid file type', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'application/pdf',
      };

      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_INVALID_FORMAT),
      );
    });

    it('should return upload token for valid file type', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/jpeg',
        businessModule: 'test',
      };

      const mockResult = {
        signedUrl: 'https://example.com/upload?token=123',
        path: 'test/2023-01-01/123456789_test.jpg',
      };

      (supabaseService.createSignedUploadUrl as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await service.getUploadToken(uploadTokenDto);

      expect(supabaseService.createSignedUploadUrl).toHaveBeenCalled();
      expect(result).toEqual({
        token: '123',
        path: 'test/2023-01-01/123456789_test.jpg',
      });
    });

    it('should return full URL as token if no token in URL', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/jpeg',
        businessModule: 'test',
      };

      const mockResult = {
        signedUrl: 'https://example.com/upload/with-no-token',
        path: 'test/2023-01-01/123456789_test.jpg',
      };

      (supabaseService.createSignedUploadUrl as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await service.getUploadToken(uploadTokenDto);

      expect(result).toEqual({
        token: 'https://example.com/upload/with-no-token',
        path: 'test/2023-01-01/123456789_test.jpg',
      });
    });

    it('should throw IMAGE_SUPABASE_ERROR if Supabase operation fails', async () => {
      const uploadTokenDto: UploadTokenDto = {
        fileType: 'image/jpeg',
        businessModule: 'test',
      };

      (supabaseService.createSignedUploadUrl as jest.Mock).mockResolvedValue({
        error: 'Some error',
        signedUrl: '',
        path: 'test/2023-01-01/123456789_test.jpg',
      });

      await expect(service.getUploadToken(uploadTokenDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_SUPABASE_ERROR),
      );
    });
  });

  describe('createImage', () => {
    it('should create image successfully', async () => {
      const createImageDto: CreateImageDto = {
        path: 'test/path/image.jpg',
        name: 'test-image',
        size: 1024,
      };

      const savedImage = { ...mockImage };

      (repository.create as jest.Mock).mockReturnValue(createImageDto);
      (repository.save as jest.Mock).mockResolvedValue(savedImage);

      const result = await service.createImage(createImageDto);

      expect(repository.create).toHaveBeenCalledWith(createImageDto);
      expect(repository.save).toHaveBeenCalledWith(createImageDto);
      expect(result).toEqual({
        id: savedImage.id,
        createdAt: savedImage.createdAt,
      });
    });

    it('should throw IMAGE_UPLOAD_FAILED error if creation fails', async () => {
      const createImageDto: CreateImageDto = {
        path: 'test/path/image.jpg',
        name: 'test-image',
        size: 1024,
      };

      (repository.create as jest.Mock).mockReturnValue(createImageDto);
      (repository.save as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.createImage(createImageDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_UPLOAD_FAILED),
      );
    });
  });

  describe('getImageList', () => {
    it('should return image list with pagination', async () => {
      const imageListDto: ImageListDto = {
        page: 1,
        pageSize: 10,
      };

      const mockImages = [mockImage];
      const mockTotal = 1;

      (repository.findAndCount as jest.Mock).mockResolvedValue([
        mockImages,
        mockTotal,
      ]);
      (supabaseService.getPublicUrl as jest.Mock).mockReturnValue(
        'https://example.com/test/path/image.jpg',
      );

      const result = await service.getImageList(imageListDto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });

      expect(supabaseService.getPublicUrl).toHaveBeenCalledWith(
        'test/path/image.jpg',
      );
      expect(result).toEqual({
        list: [
          {
            id: mockImage.id,
            url: 'https://example.com/test/path/image.jpg',
            name: mockImage.name,
            size: mockImage.size,
            createdAt: mockImage.createdAt,
          },
        ],
        total: mockTotal,
        page: imageListDto.page,
        pageSize: imageListDto.pageSize,
        totalPages: 1,
      });
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const imageId = '1';

      (repository.findOne as jest.Mock).mockResolvedValue(mockImage);
      (supabaseService.deleteFile as jest.Mock).mockResolvedValue({
        success: true,
      });

      await expect(service.deleteImage(imageId)).resolves.not.toThrow();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: imageId },
      });
      expect(supabaseService.deleteFile).toHaveBeenCalledWith(mockImage.path);
      expect(repository.remove).toHaveBeenCalledWith(mockImage);
    });

    it('should throw IMAGE_NOT_FOUND error if image does not exist', async () => {
      const imageId = 'nonexistent';

      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteImage(imageId)).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_NOT_FOUND),
      );
    });

    it('should continue deletion even if Supabase delete fails', async () => {
      const imageId = '1';

      (repository.findOne as jest.Mock).mockResolvedValue(mockImage);
      (supabaseService.deleteFile as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      await expect(service.deleteImage(imageId)).resolves.not.toThrow();

      expect(repository.remove).toHaveBeenCalledWith(mockImage);
    });
  });

  describe('batchDeleteImages', () => {
    it('should delete multiple images successfully', async () => {
      const imageIds = ['1', '2'];
      const mockImages = [mockImage, { ...mockImage, id: '2' }];

      (repository.find as jest.Mock).mockResolvedValue(mockImages);
      (supabaseService.deleteFile as jest.Mock).mockResolvedValue({
        success: true,
      });

      await expect(service.batchDeleteImages(imageIds)).resolves.not.toThrow();

      expect(repository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockImages);
    });

    it('should throw IMAGE_NOT_FOUND error if any image does not exist', async () => {
      const imageIds = ['1', '2'];
      const mockImages = [mockImage]; // Only one found

      (repository.find as jest.Mock).mockResolvedValue(mockImages);

      await expect(service.batchDeleteImages(imageIds)).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_NOT_FOUND),
      );
    });

    it('should continue deletion even if some Supabase deletes fail', async () => {
      const imageIds = ['1', '2'];
      const mockImages = [mockImage, { ...mockImage, id: '2' }];

      (repository.find as jest.Mock).mockResolvedValue(mockImages);
      (supabaseService.deleteFile as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      await expect(service.batchDeleteImages(imageIds)).resolves.not.toThrow();

      expect(repository.remove).toHaveBeenCalledWith(mockImages);
    });
  });

  describe('checkSupabaseConnection', () => {
    it('should return connection status and bucket existence', async () => {
      (supabaseService.checkBucketExists as jest.Mock).mockResolvedValue(true);

      const result = await service.checkSupabaseConnection();

      expect(supabaseService.checkBucketExists).toHaveBeenCalled();
      expect(result).toEqual({
        connected: true,
        bucketExists: true,
      });
    });

    it('should throw IMAGE_SUPABASE_ERROR if connection check fails', async () => {
      (supabaseService.checkBucketExists as jest.Mock).mockRejectedValue(
        new Error('Connection failed'),
      );

      await expect(service.checkSupabaseConnection()).rejects.toThrow(
        new BusinessException(ERROR_CODES.IMAGE_SUPABASE_ERROR),
      );
    });
  });
});
