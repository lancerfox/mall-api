import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { User, UserDocument } from '../src/modules/user/entities/user.entity';
import { SecurityService } from '../src/modules/auth/services/security.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: Model<UserDocument>;
  let securityService: SecurityService;

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    realName: 'Test User',
    role: 'admin',
    status: 'active',
    permissions: ['user:read', 'user:write'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(User.name),
    );
    securityService = moduleFixture.get<SecurityService>(SecurityService);

    await app.init();

    // Create test user
    const hashedPassword = await securityService.hashPassword(
      testUser.password,
    );
    await userModel.create({
      ...testUser,
      password: hashedPassword,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await userModel.deleteMany({});
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.user.password).toBeUndefined();
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });

      refreshToken = loginResponse.body.refresh_token;
    });

    it('should refresh token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: refreshToken,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.expires_in).toBeDefined();
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refresh_token: 'invalid_token',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.username).toBe(testUser.username);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('/auth/profile (PUT)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should update user profile', () => {
      const updateData = {
        realName: 'Updated Name',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.realName).toBe(updateData.realName);
          expect(res.body.email).toBe(updateData.email);
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/password (PUT)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should change password with valid current password', () => {
      return request(app.getHttpServer())
        .put('/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('密码修改成功');
        });
    });

    it('should reject with wrong current password', () => {
      return request(app.getHttpServer())
        .put('/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(400);
    });
  });
});
