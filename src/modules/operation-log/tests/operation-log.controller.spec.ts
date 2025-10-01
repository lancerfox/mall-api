import { Test, TestingModule } from '@nestjs/testing';
import { OperationLogController } from '../controllers/operation-log.controller';
import { OperationLogService } from '../services/operation-log.service';
import { OperationLogListDto } from '../dto/operation-log-list.dto';

describe('OperationLogController', () => {
  let controller: OperationLogController;
  let service: OperationLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationLogController],
      providers: [
        {
          provide: OperationLogService,
          useValue: {
            getList: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OperationLogController>(OperationLogController);
    service = module.get<OperationLogService>(OperationLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getList', () => {
    it('should call operationLogService.getList', async () => {
      const listDto: OperationLogListDto = { page: 1, pageSize: 10 };
      const mockResult = { list: [], total: 0 };
      (service.getList as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getList(listDto);

      expect(service.getList).toHaveBeenCalledWith(listDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getById', () => {
    it('should call operationLogService.getById', async () => {
      const id = '1';
      const mockResult = { id: '1', userId: 'user1', username: 'testuser' };
      (service.getById as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getById(id);

      expect(service.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });
  });
});
