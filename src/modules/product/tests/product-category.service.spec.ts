import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCategoryService } from '../services/product-category.service';
import { ProductCategory } from '../entities/product-category.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DeleteCategoryDto } from '../dto/delete-category.dto';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let repository: Repository<ProductCategory>;

  // Mock data
  const mockCategory = {
    id: 'cat-1',
    name: 'Test Category',
    code: 'TEST',
    level: 1,
    sort: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ProductCategory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        {
          provide: getRepositoryToken(ProductCategory),
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
          },
        },
      ],
    }).compile();

    service = module.get<ProductCategoryService>(ProductCategoryService);
    repository = module.get<Repository<ProductCategory>>(
      getRepositoryToken(ProductCategory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const createDto: CreateCategoryDto = {
        name: 'New Category',
        code: 'NEW',
        level: 1,
      };

      const createdCategory = { ...mockCategory, ...createDto, id: 'new-cat' };

      (repository.create as jest.Mock).mockReturnValue(createdCategory);
      (repository.save as jest.Mock).mockResolvedValue(createdCategory);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      const foundCategory = { ...mockCategory };
      const updatedCategory = { ...foundCategory, name: 'Updated Category' };

      (repository.findOne as jest.Mock).mockResolvedValue(foundCategory);
      (repository.merge as jest.Mock).mockReturnValue(updatedCategory);
      (repository.save as jest.Mock).mockResolvedValue(updatedCategory);

      const result = await service.update('cat-1', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(repository.merge).toHaveBeenCalledWith(
        foundCategory,
        expect.objectContaining(updateDto),
      );
      expect(result).toBeDefined();
    });

    it('should throw VALIDATION_INVALID_ID error if category does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {} as UpdateCategoryDto),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID),
      );
    });
  });

  describe('delete', () => {
    it('should delete a category successfully', async () => {
      const deleteDto: DeleteCategoryDto = { id: 'cat-1' };

      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.delete(deleteDto);

      expect(repository.delete).toHaveBeenCalledWith('cat-1');
    });

    it('should throw VALIDATION_INVALID_ID error if category does not exist', async () => {
      const deleteDto: DeleteCategoryDto = { id: 'nonexistent' };

      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.delete(deleteDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID),
      );
    });
  });

  describe('findAll', () => {
    it('should return all enabled categories', async () => {
      const mockCategories = [mockCategory];

      (repository.find as jest.Mock).mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { enabled: true },
        order: { sort: 'ASC', createdAt: 'DESC' },
      });
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(result).toEqual(expect.objectContaining({ id: 'cat-1' }));
    });

    it('should throw VALIDATION_INVALID_ID error if category does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.VALIDATION_INVALID_ID),
      );
    });
  });

  describe('buildCategoryTree', () => {
    it('should build a category tree', async () => {
      const mockCategoriesWithParent = [
        { ...mockCategory, parent: null },
        {
          ...mockCategory,
          id: 'cat-2',
          parentId: 'cat-1',
          parent: mockCategory,
        },
      ];

      (repository.find as jest.Mock).mockResolvedValue(
        mockCategoriesWithParent,
      );

      const result = await service.buildCategoryTree();

      expect(repository.find).toHaveBeenCalledWith({
        where: { enabled: true },
        order: { sort: 'ASC' },
        relations: ['parent'],
      });
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('hasChildren', () => {
    it('should return true if category has children', async () => {
      (repository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.hasChildren('cat-1');

      expect(repository.count).toHaveBeenCalledWith({
        where: { parent: { id: 'cat-1' } },
      });
      expect(result).toBe(true);
    });

    it('should return false if category has no children', async () => {
      (repository.count as jest.Mock).mockResolvedValue(0);

      const result = await service.hasChildren('cat-1');

      expect(result).toBe(false);
    });
  });

  describe('getAllDescendantIds', () => {
    it('should return all descendant category IDs', async () => {
      // Mocking a simple case where cat-1 has direct child cat-2
      (repository.find as jest.Mock)
        .mockResolvedValueOnce([{ id: 'cat-2' }]) // First call: find children of cat-1
        .mockResolvedValue([]); // Second call: find children of cat-2 (none)

      const result = await service.getAllDescendantIds('cat-1');

      expect(repository.find).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['cat-2']);
    });

    it('should return empty array if category has no descendants', async () => {
      (repository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getAllDescendantIds('cat-1');

      expect(result).toEqual([]);
    });
  });
});
