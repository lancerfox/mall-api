import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from '../services/product.service';
import { ProductSPU } from '../entities/product-spu.entity';
import { ProductSKU } from '../entities/product-sku.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../image/services/supabase.service';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';

describe('ProductService', () => {
  let service: ProductService;
  let spuRepository: Repository<ProductSPU>;
  let skuRepository: Repository<ProductSKU>;
  let categoryRepository: Repository<ProductCategory>;
  let supabaseService: SupabaseService;

  // Mock data
  const mockSpu = {
    id: 'spu-1',
    name: 'Test Product',
    status: 'On-shelf',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 'cat-1',
  } as ProductSPU;

  const mockSku = {
    id: 'sku-1',
    spuId: 'spu-1',
    price: 100,
    stock: 10,
    status: 1,
    specifications: [],
  } as ProductSKU;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductSPU),
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
          },
        },
        {
          provide: getRepositoryToken(ProductSKU),
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
          },
        },
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
            findAndCount: jest.fn(),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            getPublicUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    spuRepository = module.get<Repository<ProductSPU>>(
      getRepositoryToken(ProductSPU),
    );
    skuRepository = module.get<Repository<ProductSKU>>(
      getRepositoryToken(ProductSKU),
    );
    categoryRepository = module.get<Repository<ProductCategory>>(
      getRepositoryToken(ProductCategory),
    );
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveProduct', () => {
    it('should create a new product successfully', async () => {
      const saveDto: SaveProductDto = {
        spu: { name: 'New Product', description: 'Test description' },
        skus: [{ price: 100, stock: 10, specifications: [] }],
        action: 'publish',
      };

      const savedSpu = { ...mockSpu, ...saveDto.spu, id: 'new-spu-id' };

      (spuRepository.create as jest.Mock).mockReturnValue(savedSpu);
      (spuRepository.save as jest.Mock).mockResolvedValue(savedSpu);
      (skuRepository.find as jest.Mock).mockResolvedValue([]);
      (skuRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      (skuRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.saveProduct(saveDto);

      expect(spuRepository.create).toHaveBeenCalled();
      expect(spuRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'On-shelf',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should update an existing product successfully', async () => {
      const saveDto: SaveProductDto = {
        spu: { id: 'spu-1', name: 'Updated Product' },
        skus: [{ id: 'sku-1', price: 200, stock: 20, specifications: [] }],
        action: 'publish',
      };

      const existingSpu = { ...mockSpu };
      const updatedSpu = { ...existingSpu, name: 'Updated Product' };

      (spuRepository.findOne as jest.Mock).mockResolvedValue(existingSpu);
      (spuRepository.save as jest.Mock).mockResolvedValue(updatedSpu);
      (skuRepository.find as jest.Mock).mockResolvedValue([mockSku]);
      (skuRepository.save as jest.Mock).mockResolvedValue(mockSku);

      const result = await service.saveProduct(saveDto);

      expect(spuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'spu-1' },
      });
      expect(result).toBeDefined();
    });

    it('should throw PRODUCT_NOT_FOUND error if trying to update non-existent product', async () => {
      const saveDto: SaveProductDto = {
        spu: { id: 'nonexistent', name: 'Updated Product' },
        skus: [],
        action: 'publish',
      };

      (spuRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.saveProduct(saveDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('getProductList', () => {
    it('should return product list with pagination', async () => {
      const listDto: ProductListDto = {
        page: 1,
        pageSize: 10,
        filters: { name: 'Test' },
      };

      const mockProducts = [mockSpu];
      const mockTotal = 1;

      (spuRepository.findAndCount as jest.Mock).mockResolvedValue([
        mockProducts,
        mockTotal,
      ]);
      (skuRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getProductList(listDto);

      expect(spuRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: expect.anything() }, // ILike('%Test%')
        order: { updatedAt: 'DESC' },
        skip: 0,
        take: 10,
        relations: ['category'],
      });
      expect(result).toEqual({
        list: expect.any(Array),
        total: mockTotal,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });
  });

  describe('getProductDetail', () => {
    it('should return product detail', async () => {
      const detailDto: ProductDetailDto = { id: 'spu-1' };

      (spuRepository.findOne as jest.Mock).mockResolvedValue(mockSpu);
      (skuRepository.find as jest.Mock).mockResolvedValue([mockSku]);

      const result = await service.getProductDetail(detailDto);

      expect(spuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'spu-1' },
      });
      expect(result).toBeDefined();
    });

    it('should throw PRODUCT_NOT_FOUND error if product does not exist', async () => {
      const detailDto: ProductDetailDto = { id: 'nonexistent' };

      (spuRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getProductDetail(detailDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('updateProductStatus', () => {
    it('should update product status successfully', async () => {
      const updateDto: UpdateStatusDto = {
        ids: ['spu-1'],
        status: 'Off-shelf',
      };

      (spuRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.updateProductStatus(updateDto);

      expect(spuRepository.update).toHaveBeenCalledWith(
        { id: expect.anything() }, // In(['spu-1'])
        expect.objectContaining({
          status: 'Off-shelf',
        }),
      );
    });

    it('should throw PRODUCT_NOT_FOUND error if no products were updated', async () => {
      const updateDto: UpdateStatusDto = {
        ids: ['nonexistent'],
        status: 'Off-shelf',
      };

      (spuRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.updateProductStatus(updateDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('deleteProducts', () => {
    it('should delete products successfully', async () => {
      (spuRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.deleteProducts(['spu-1']);

      expect(spuRepository.update).toHaveBeenCalledWith(
        { id: expect.anything() }, // In(['spu-1'])
        expect.objectContaining({
          status: 'Deleted',
        }),
      );
    });

    it('should throw PRODUCT_NOT_FOUND error if no products were deleted', async () => {
      (spuRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.deleteProducts(['nonexistent'])).rejects.toThrow(
        new BusinessException(ERROR_CODES.PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('getProductCountByCategory', () => {
    it('should return product count for a category', async () => {
      (spuRepository.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getProductCountByCategory('cat-1');

      expect(spuRepository.count).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-1',
          status: expect.anything(), // Not('Deleted')
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return product by ID', async () => {
      (spuRepository.findOne as jest.Mock).mockResolvedValue(mockSpu);

      const result = await service.findById('spu-1');

      expect(spuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'spu-1' },
      });
      expect(result).toEqual(mockSpu);
    });
  });

  describe('saveSKUs', () => {
    it('should properly handle SKU creation and updates', async () => {
      const spuId = 'spu-1';
      const skus = [
        { id: 'sku-1', price: 100, stock: 10, specifications: [] }, // update
        { price: 200, stock: 20, specifications: [] }, // create
      ];

      (skuRepository.find as jest.Mock).mockResolvedValue([mockSku]);
      (skuRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockSku) // for finding existing SKU
        .mockResolvedValue(null); // for conflict checks
      (skuRepository.save as jest.Mock).mockResolvedValue(mockSku);
      (skuRepository.create as jest.Mock).mockImplementation((data) => data);

      // This test will check that the private saveSKUs method works correctly
      // by examining its behavior through the saveProduct method which calls it
      await expect(
        (service as any).saveSKUs(spuId, skus),
      ).resolves.not.toThrow();
    });
  });
});
