import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageController } from '../controllers/upload-image.controller';
import { UploadImageService } from '../services/upload-image.service';

describe('UploadImageController', () => {
  let controller: UploadImageController;
  let service: UploadImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadImageController],
      providers: [
        {
          provide: UploadImageService,
          useValue: {
            uploadImage: jest.fn(),
            batchUploadImages: jest.fn(),
            deleteImage: jest.fn(),
            getImageList: jest.fn(),
            setMainImage: jest.fn(),
            sortImages: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadImageController>(UploadImageController);
    service = module.get<UploadImageService>(UploadImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // TODO: Add more specific test cases for each method in UploadImageController
});