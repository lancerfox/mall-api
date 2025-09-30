import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from '../controllers/image.controller';
import { ImageService } from '../services/image.service';
import { DeleteImageDto } from '../dto/delete-image.dto';
import { IApiResponse } from '../../../common/types/api-response.interface';

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
            deleteImage: jest.fn(),
            batchDeleteImages: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    service = module.get<ImageService>(ImageService);
  });

  describe('deleteImage', () => {
    it('should call deleteImage when imageId is provided', async () => {
      const deleteImageDto: DeleteImageDto = { imageId: 1 };
      const result: IApiResponse<null> = {
        code: 200,
        message: '操作成功',
        data: null,
      };

      (service.deleteImage as jest.Mock).mockResolvedValue(result);

      expect(await controller.deleteImage(deleteImageDto)).toBe(result);
      expect(service.deleteImage).toHaveBeenCalledWith(1);
      expect(service.batchDeleteImages).not.toHaveBeenCalled();
    });

    it('should call batchDeleteImages when imageIds is provided', async () => {
      const batchDeleteImageDto: any = { imageIds: [1, 2, 3] };
      const result: IApiResponse<null> = {
        code: 200,
        message: '操作成功',
        data: null,
      };

      (service.batchDeleteImages as jest.Mock).mockResolvedValue(result);

      expect(await controller.deleteImage(batchDeleteImageDto)).toBe(result);
      expect(service.batchDeleteImages).toHaveBeenCalledWith([1, 2, 3]);
      expect(service.deleteImage).not.toHaveBeenCalled();
    });
  });
});
