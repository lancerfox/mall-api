import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { ProductImageService } from '../services/product-image.service';
import { SaveProductDto } from '../dto/save-product.dto';
import { ProductListDto } from '../dto/product-list.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { ProductDetailDto } from '../dto/product-detail.dto';
import { UpdateProductImagesDto } from '../dto/update-product-images.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;
  let productImageService: ProductImageService;

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
        {
          provide: ProductImageService,
          useValue: {
            updateProductImages: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
    productImageService = module.get<ProductImageService>(ProductImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('save', () => {
    it('should call productService.saveProduct', async () => {
      const saveDto: SaveProductDto = {
        spu: { name: 'Test Product' },
        skus: [{ price: 100, stock: 10, specifications: [] }],
        action: 'publish',
      };
      const mockResponse = { id: '1', name: 'Test Product' };
      (productService.saveProduct as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.save(saveDto);

      expect(productService.saveProduct).toHaveBeenCalledWith(saveDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('list', () => {
    it('should call productService.getProductList', async () => {
      const listDto: ProductListDto = { page: 1, pageSize: 10 };
      const mockResponse = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      (productService.getProductList as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.list(listDto);

      expect(productService.getProductList).toHaveBeenCalledWith(listDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('detail', () => {
    it('should call productService.getProductDetail', async () => {
      const detailDto: ProductDetailDto = { id: '1' };
      const mockResponse = { spu: { id: '1' }, skus: [], action: 'publish' };
      (productService.getProductDetail as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.detail(detailDto);

      expect(productService.getProductDetail).toHaveBeenCalledWith(detailDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should call productService.updateProductStatus', async () => {
      const updateDto: UpdateStatusDto = { ids: ['1'], status: 'On-shelf' };
      (productService.updateProductStatus as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.updateStatus(updateDto);

      expect(productService.updateProductStatus).toHaveBeenCalledWith(
        updateDto,
      );
    });
  });

  describe('delete', () => {
    it('should call productService.deleteProducts', async () => {
      const deleteBody = { ids: ['1', '2'] };
      (productService.deleteProducts as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(deleteBody);

      expect(productService.deleteProducts).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('updateProductImages', () => {
    it('should call productImageService.updateProductImages', async () => {
      const updateImagesDto: UpdateProductImagesDto = {
        spuId: '1',
        images: [],
      };
      (productImageService.updateProductImages as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.updateProductImages(updateImagesDto);

      expect(productImageService.updateProductImages).toHaveBeenCalledWith(
        updateImagesDto,
      );
    });
  });
});
