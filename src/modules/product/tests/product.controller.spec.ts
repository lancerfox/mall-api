import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import { SpuDto } from '../dto/spu.dto';
import { SkuDto } from '../dto/sku.dto';
import { SpecificationDto } from '../dto/specification.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductEditResponseDto } from '../dto/product-edit-response.dto';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            saveProduct: jest.fn(),
            getProductList: jest.fn(),
            getProductDetail: jest.fn(),
            updateProductStatus: jest.fn(),
            deleteProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
  });

  describe('save', () => {
    it('应该成功保存商品', async () => {
      // 安排
      const spuDto: SpuDto = {
        name: '测试SPU',
        categoryId: 'category123',
        material: '测试材质',
      };
      const skuDto: SkuDto = {
        specifications: [{ key: '规格', value: '测试' }],
        price: 100,
        stock: 10,
      };
      const saveProductDto: SaveProductDto = {
        spu: spuDto,
        skus: [skuDto],
        action: 'saveToDraft',
      };
      const saveProductResponse: ProductResponseDto = {
        id: 'product123',
        name: '测试商品',
        spuCode: 'SPU001',
        category: {
          id: 'category123',
          name: '测试分类',
          code: 'TEST_CATEGORY',
          level: 1,
          sort: 0,
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: [],
        },
        categoryName: '测试分类',
        description: '测试商品描述',
        mainImage: '',
        imageGallery: [],
        specifications: [],
        skus: [
          {
            id: 'sku123',
            skuCode: 'SKU001',
            price: 100,
            originalPrice: 100,
            stock: 10,
            specs: {},
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        totalStock: 10,
        priceRange: [100, 100] as [number, number],
        material: '测试材质',
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productService.saveProduct.mockResolvedValue(saveProductResponse);

      // 执行
      const result = await productController.save(saveProductDto);

      // 断言
      expect(result).toEqual(saveProductResponse);
      expect(productService.saveProduct).toHaveBeenCalledWith(saveProductDto);
    });
  });

  describe('list', () => {
    it('应该成功获取商品列表', async () => {
      // 安排
      const productListDto: ProductListDto = {
        page: 1,
        pageSize: 10,
        filters: {
          categoryId: 'category123',
        },
      };
      const productListResponse = {
        items: [
          {
            id: '1',
            name: '商品1',
            spuCode: 'SPU001',
            category: {
              id: 'category123',
              name: '测试分类',
              code: 'TEST_CATEGORY',
              level: 1,
              sort: 0,
              enabled: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [],
            },
            categoryName: '测试分类',
            description: '商品1描述',
            mainImage: '',
            imageGallery: [],
            specifications: [],
            skus: [],
            totalStock: 0,
            priceRange: [0, 0] as [number, number],
            material: '材质1',
            status: 'On-shelf',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            name: '商品2',
            spuCode: 'SPU002',
            category: {
              id: 'category123',
              name: '测试分类',
              code: 'TEST_CATEGORY',
              level: 1,
              sort: 0,
              enabled: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              children: [],
            },
            categoryName: '测试分类',
            description: '商品2描述',
            mainImage: '',
            imageGallery: [],
            specifications: [],
            skus: [],
            totalStock: 0,
            priceRange: [0, 0] as [number, number],
            material: '材质2',
            status: 'On-shelf',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      productService.getProductList.mockResolvedValue(productListResponse);

      // 执行
      const result = await productController.list(productListDto);

      // 断言
      expect(result).toEqual({
        data: productListResponse.items,
        total: productListResponse.total,
        page: productListResponse.page,
        pageSize: productListResponse.pageSize,
        totalPages: productListResponse.totalPages,
      });
      expect(productService.getProductList).toHaveBeenCalledWith(
        productListDto,
      );
    });
  });

  describe('detail', () => {
    it('应该成功获取商品详情', async () => {
      // 安排
      const productDetailDto: ProductDetailDto = { id: 'product123' };
      const productDetailResponse: ProductEditResponseDto = {
        spu: {
          id: 'spu123',
          name: '测试SPU',
          categoryId: 'category123',
          material: '测试材质',
        },
        skus: [
          {
            id: 'sku123',
            specifications: [{ key: '规格', value: '测试' }],
            price: 100,
            stock: 10,
          },
        ],
        action: 'saveToDraft',
      };

      productService.getProductDetail.mockResolvedValue(productDetailResponse);

      // 执行
      const result = await productController.detail(productDetailDto);

      // 断言
      expect(result).toEqual(productDetailResponse);
      expect(productService.getProductDetail).toHaveBeenCalledWith(
        productDetailDto,
      );
    });
  });

  describe('updateStatus', () => {
    it('应该成功更新商品状态', async () => {
      // 安排
      const updateStatusDto: UpdateStatusDto = {
        ids: ['product123'],
        status: 'On-shelf',
      };

      productService.updateProductStatus.mockResolvedValue();

      // 执行
      const result = await productController.updateStatus(updateStatusDto);

      // 断言
      expect(result).toEqual({ message: '更新成功' });
      expect(productService.updateProductStatus).toHaveBeenCalledWith(
        updateStatusDto,
      );
    });
  });

  describe('delete', () => {
    it('应该成功删除商品', async () => {
      // 安排
      const deleteProductDto = { ids: ['product123', 'product456'] };

      productService.deleteProducts.mockResolvedValue();

      // 执行
      const result = await productController.delete(deleteProductDto);

      // 断言
      expect(result).toEqual({ message: '删除成功' });
      expect(productService.deleteProducts).toHaveBeenCalledWith([
        'product123',
        'product456',
      ]);
    });
  });
});
