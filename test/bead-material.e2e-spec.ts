import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('BeadMaterial (e2e)', () => {
  let app: INestApplication;
  let categoryId: string;
  let materialId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/categories (POST)', () => {
    it('应该创建新分类', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: '测试分类',
          description: '这是一个测试分类',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('分类创建成功');
          expect(res.body.data).toHaveProperty('_id');
          expect(res.body.data.name).toBe('测试分类');
          categoryId = res.body.data._id;
        });
    });

    it('应该拒绝无效的分类数据', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          description: '缺少名称的分类',
        })
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    it('应该获取分类列表', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('获取分类列表成功');
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('limit');
          expect(Array.isArray(res.body.data.data)).toBe(true);
        });
    });

    it('应该支持关键词搜索', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .query({ keyword: '测试' })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.data.length).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('/categories/:id (GET)', () => {
    it('应该获取分类详情', () => {
      if (!categoryId) {
        return request(app.getHttpServer())
          .post('/categories')
          .send({
            name: '详情测试分类',
            description: '用于测试详情的分类',
          })
          .then((res) => {
            categoryId = res.body.data._id;
            return request(app.getHttpServer())
              .get(`/categories/${categoryId}`)
              .expect(200)
              .expect((res) => {
                expect(res.body.code).toBe(200);
                expect(res.body.message).toBe('获取分类详情成功');
                expect(res.body.data._id).toBe(categoryId);
              });
          });
      }

      return request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('获取分类详情成功');
          expect(res.body.data._id).toBe(categoryId);
        });
    });

    it('应该处理不存在的分类ID', () => {
      return request(app.getHttpServer())
        .get('/categories/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('/materials (POST)', () => {
    it('应该创建新材料', () => {
      if (!categoryId) {
        return request(app.getHttpServer())
          .post('/categories')
          .send({
            name: '材料测试分类',
            description: '用于测试材料的分类',
          })
          .then((res) => {
            categoryId = res.body.data._id;
            return request(app.getHttpServer())
              .post('/materials')
              .send({
                name: '测试材料',
                category_id: categoryId,
                description: '这是一个测试材料',
                color: '红色',
                size: '10mm',
                shape: '圆形',
                texture: '光滑',
                hardness: '5',
                transparency: '不透明',
                origin: '中国',
                price: 12.5,
                stock_quantity: 50,
                unit: '颗',
                supplier: '测试供应商',
                purchase_date: new Date('2024-01-01'),
              })
              .expect(201)
              .expect((res) => {
                expect(res.body.code).toBe(200);
                expect(res.body.message).toBe('材料创建成功');
                expect(res.body.data).toHaveProperty('_id');
                expect(res.body.data.name).toBe('测试材料');
                materialId = res.body.data._id;
              });
          });
      }

      return request(app.getHttpServer())
        .post('/materials')
        .send({
          name: '测试材料2',
          category_id: categoryId,
          description: '这是另一个测试材料',
          color: '蓝色',
          size: '8mm',
          shape: '方形',
          texture: '粗糙',
          hardness: '6',
          transparency: '半透明',
          origin: '日本',
          price: 15.0,
          stock_quantity: 30,
          unit: '颗',
          supplier: '测试供应商2',
          purchase_date: new Date('2024-01-02'),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('材料创建成功');
          expect(res.body.data).toHaveProperty('_id');
          expect(res.body.data.name).toBe('测试材料2');
        });
    });

    it('应该拒绝无效的材料数据', () => {
      return request(app.getHttpServer())
        .post('/materials')
        .send({
          description: '缺少必要字段的材料',
        })
        .expect(400);
    });
  });

  describe('/materials (GET)', () => {
    it('应该获取材料列表', () => {
      return request(app.getHttpServer())
        .get('/materials')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.message).toBe('获取材料列表成功');
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('limit');
          expect(Array.isArray(res.body.data.data)).toBe(true);
        });
    });

    it('应该支持关键词搜索', () => {
      return request(app.getHttpServer())
        .get('/materials')
        .query({ keyword: '测试' })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data.data.length).toBeGreaterThanOrEqual(0);
        });
    });

    it('应该支持分类筛选', () => {
      if (categoryId) {
        return request(app.getHttpServer())
          .get('/materials')
          .query({ category_id: categoryId })
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.data.data.length).toBeGreaterThanOrEqual(0);
          });
      }
    });
  });

  describe('/materials/:id (GET)', () => {
    it('应该获取材料详情', () => {
      if (materialId) {
        return request(app.getHttpServer())
          .get(`/materials/${materialId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('获取材料详情成功');
            expect(res.body.data._id).toBe(materialId);
          });
      }
    });

    it('应该处理不存在的材料ID', () => {
      return request(app.getHttpServer())
        .get('/materials/507f1f77bcf86cd799439999')
        .expect(404);
    });
  });

  describe('/categories (POST) - Update', () => {
    it('应该更新分类', () => {
      if (categoryId) {
        return request(app.getHttpServer())
          .post('/categories/update')
          .send({
            id: categoryId,
            name: '更新后的测试分类',
            description: '这是更新后的测试分类',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('分类更新成功');
            expect(res.body.data.name).toBe('更新后的测试分类');
          });
      }
    });
  });

  describe('/materials (POST) - Update', () => {
    it('应该更新材料', () => {
      if (materialId) {
        return request(app.getHttpServer())
          .post('/materials/update')
          .send({
            id: materialId,
            name: '更新后的测试材料',
            description: '这是更新后的测试材料',
            price: 20.0,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('材料更新成功');
            expect(res.body.data.name).toBe('更新后的测试材料');
            expect(res.body.data.price).toBe(20.0);
          });
      }
    });
  });

  describe('/materials (POST) - Delete', () => {
    it('应该删除材料', () => {
      if (materialId) {
        return request(app.getHttpServer())
          .post('/materials/delete')
          .send({ id: materialId })
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('材料删除成功');
          });
      }
    });
  });

  describe('/categories (POST) - Delete', () => {
    it('应该删除分类', () => {
      if (categoryId) {
        return request(app.getHttpServer())
          .post('/categories/delete')
          .send({ id: categoryId })
          .expect(200)
          .expect((res) => {
            expect(res.body.code).toBe(200);
            expect(res.body.message).toBe('分类删除成功');
          });
      }
    });
  });
});
