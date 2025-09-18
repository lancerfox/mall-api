import { Test, TestingModule } from '@nestjs/testing';
import { UploadImageService } from '../services/upload-image.service';
import { getModelToken } from '@nestjs/mongoose';
import { Image } from '../entities/image.entity';

describe('UploadImageService', () => {
  let service: UploadImageService;
  let imageModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadImageService,
        {
          provide: getModelToken(Image.name),
          useValue: {
            // Mock your Image model methods here
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            // Add other methods as needed for your service tests
          },
        },
      ],
    }).compile();

    service = module.get<UploadImageService>(UploadImageService);
    imageModel = module.get(getModelToken(Image.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: Add more specific test cases for each method in UploadImageService
});