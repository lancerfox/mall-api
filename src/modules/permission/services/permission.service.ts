import { Injectable, HttpException } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionType } from '../../../common/decorators/roles.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOneBy({
      name: createPermissionDto.name,
    });

    if (existingPermission) {
      throw new HttpException(
        '权限名称已存在',
        ERROR_CODES.PERMISSION_ALREADY_EXISTS,
      );
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new HttpException('权限不存在', ERROR_CODES.PERMISSION_NOT_FOUND);
    }
    return permission;
  }

  async findById(id: string): Promise<Permission> {
    return this.findOne(id);
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ name });
  }

  async findByNames(names: string[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({ name: In(names) });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({ id: In(ids) });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (updatePermissionDto.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: {
          name: updatePermissionDto.name,
          id: Not(id),
        },
      });

      if (existingPermission) {
        throw new HttpException(
          '权限名称已存在',
          ERROR_CODES.PERMISSION_ALREADY_EXISTS,
        );
      }
    }

    const permission = await this.permissionRepository.preload({
      id,
      ...updatePermissionDto,
    });

    if (!permission) {
      throw new HttpException('权限不存在', ERROR_CODES.PERMISSION_NOT_FOUND);
    }

    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('权限不存在', ERROR_CODES.PERMISSION_NOT_FOUND);
    }
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.findBy({ module });
  }

  async findByType(type: string): Promise<Permission[]> {
    // 将字符串类型转换为PermissionType枚举
    const permissionType = type as PermissionType;
    return this.permissionRepository.find({ where: { type: permissionType } });
  }

  async updateByName(
    name: string,
    updateData: Partial<Permission>,
  ): Promise<Permission> {
    const permissionToUpdate = await this.permissionRepository.findOneBy({
      name,
    });
    if (!permissionToUpdate) {
      throw new HttpException(
        `权限 ${name} 不存在`,
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
    }

    // 如果更新数据中包含权限名称，检查新名称是否已存在（排除当前权限）
    if (updateData.name && updateData.name !== name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: {
          name: updateData.name,
          id: Not(permissionToUpdate.id),
        },
      });

      if (existingPermission) {
        throw new HttpException(
          '权限名称已存在',
          ERROR_CODES.PERMISSION_ALREADY_EXISTS,
        );
      }
    }

    Object.assign(permissionToUpdate, updateData);
    return this.permissionRepository.save(permissionToUpdate);
  }

  async removeByName(name: string): Promise<void> {
    const result = await this.permissionRepository.delete({ name });
    if (result.affected === 0) {
      throw new HttpException(
        `权限 ${name} 不存在`,
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
    }
  }
}
