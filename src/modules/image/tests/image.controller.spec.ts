import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { UploadTokenDto } from '../dto/upload-token.dto';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageListDto } from '../dto/image-list.dto';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { BatchDeleteImageDto } from '../dto/batch-delete-image.dto';

describe('ImageController', () => {
  let controller: ImageController;
  let service: ImageService;

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
            batchDeleteImages: jest.fn(),
            checkSupabaseConnection: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUploadToken', () => {
    it('should call imageService.getUploadToken', async () => {
      const uploadTokenDto: UploadTokenDto = { fileType: 'image/jpeg' };
      const mockResult = { token: 'test-token', path: 'test/path' };
      (service.getUploadToken as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getUploadToken(uploadTokenDto);

      expect(service.getUploadToken).toHaveBeenCalledWith(uploadTokenDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createImage', () => {
    it('should call imageService.createImage', async () => {
      const createImageDto: CreateImageDto = {
        path: 'test/path/image.jpg',
        name: 'test-image',
        size: 1024,
      };
      const mockResult = { id: '1', createdAt: new Date() };
      (service.createImage as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.createImage(createImageDto);

      expect(service.createImage).toHaveBeenCalledWith(createImageDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getImageList', () => {
    it('should call imageService.getImageList', async () => {
      const imageListDto: ImageListDto = { page: 1, pageSize: 10 };
      const mockResult = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      (service.getImageList as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getImageList(imageListDto);

      expect(service.getImageList).toHaveBeenCalledWith(imageListDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteImage', () => {
    it('should call imageService.deleteImage for single deletion', async () => {
      const deleteImageDto: DeleteImageDto = { imageId: '1' };
      (service.deleteImage as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteImage(deleteImageDto);

      expect(service.deleteImage).toHaveBeenCalledWith('1');
    });

    it('should call imageService.batchDeleteImages for batch deletion', async () => {
      const deleteImageDto: BatchDeleteImageDto = { imageIds: ['1', '2'] };
      (service.batchDeleteImages as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteImage(deleteImageDto);

      expect(service.batchDeleteImages).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('checkHealth', () => {
    it('should call imageService.checkSupabaseConnection', async () => {
      const mockResult = { connected: true, bucketExists: true };
      (service.checkSupabaseConnection as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await controller.checkHealth();

      expect(service.checkSupabaseConnection).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
