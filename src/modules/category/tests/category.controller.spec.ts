import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategory = {
    categoryId: 'C001',
    name: '宝石类',
    parentId: null,
    description: '各种宝石材料',
    sortOrder: 1,
    level: 1,
    path: '/C001',
    materialCount: 0,
    status: 'enabled',
    createdBy: 'user1',
    updatedBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
  };

  const mockCategoryService = {
    create: jest.fn(),
    findTree: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    move: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCategoryDto: CreateCategoryDto = {
      name: '水晶类',
      parentId: 'C001',
      description: '各种水晶材料',
      sortOrder: 1,
    };

    it('should create a category', async () => {
      mockCategoryService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createCategoryDto, 'user1');

      expect(service.create).toHaveBeenCalledWith(createCategoryDto, 'user1');
      expect(result).toEqual({
        categoryId: mockCategory.categoryId,
      });
    });
  });

  describe('tree', () => {
    it('should return category tree', async () => {
      const mockTree = [mockCategory];
      mockCategoryService.findTree.mockResolvedValue(mockTree);

      const result = await controller.tree();

      expect(service.findTree).toHaveBeenCalled();
      expect(result).toEqual(mockTree);
    });
  });

  describe('listAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory];
      mockCategoryService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.listAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('update', () => {
    const updateCategoryDto: UpdateCategoryDto = {
      categoryId: 'C001',
      name: '珍珠类',
      parentId: null,
      description: '各种珍珠材料',
      sortOrder: 2,
    };

    it('should update a category', async () => {
      mockCategoryService.update.mockResolvedValue(undefined);

      const result = await controller.update(updateCategoryDto, 'user1');

      expect(service.update).toHaveBeenCalledWith(updateCategoryDto, 'user1');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove a category', async () => {
      const deleteDto = { categoryId: 'C001' };
      mockCategoryService.remove.mockResolvedValue(undefined);

      const result = await controller.delete(deleteDto);

      expect(service.remove).toHaveBeenCalledWith('C001');
      expect(result).toBeNull();
    });
  });

  describe('move', () => {
    const moveCategoryDto: MoveCategoryDto = {
      categoryId: 'C002',
      targetParentId: 'C001',
      sortOrder: 1,
    };

    it('should move a category', async () => {
      mockCategoryService.move.mockResolvedValue(undefined);

      const result = await controller.move(moveCategoryDto, 'user1');

      expect(service.move).toHaveBeenCalledWith(moveCategoryDto, 'user1');
      expect(result).toBeNull();
    });
  });
});
