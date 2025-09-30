import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PermissionService } from '../../permission/services/permission.service';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleListResponseDto } from '../dto/role-list-response.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private permissionService: PermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOneBy({
      name: createRoleDto.name,
    });

    if (existingRole) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 验证角色类型是否合法
    const validRoleTypes = Object.values(RoleType) as RoleType[];
    if (!validRoleTypes.includes(createRoleDto.type)) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    const newRole = this.roleRepository.create({
      name: createRoleDto.name,
      type: createRoleDto.type,
      description: createRoleDto.description,
      status: createRoleDto.status || 'active',
      isSystem: createRoleDto.isSystem || false,
    });

    // 验证并关联权限
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionService.findByIds(
        createRoleDto.permissions,
      );
      if (permissions.length !== createRoleDto.permissions.length) {
        throw new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND);
      }
      newRole.permissions = permissions;
    }

    const savedRole = await this.roleRepository.save(newRole);
    return savedRole;
  }

  async findAll(): Promise<RoleListResponseDto[]> {
    const roles = await this.roleRepository.find({
      select: [
        'id',
        'name',
        'type',
        'description',
        'status',
        'isSystem',
        'createdAt',
        'updatedAt',
      ],
    });
    return roles.map((role) => ({
      ...role,
    }));
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    return this.findOne(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async findByType(type: RoleType): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { type },
      relations: ['permissions'],
    });
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    return this.roleRepository.findBy({ id: In(ids) });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const roleToUpdate = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!roleToUpdate) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 系统角色不允许修改某些字段
    if (roleToUpdate.isSystem && updateRoleDto.isSystem === false) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 角色类型不允许修改
    if (updateRoleDto.type && updateRoleDto.type !== roleToUpdate.type) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    if (updateRoleDto.name) {
      const duplicateRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (duplicateRole && duplicateRole.id !== id) {
        throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
      }
    }

    // 验证并更新权限
    if (updateRoleDto.permissions) {
      if (updateRoleDto.permissions.length > 0) {
        const permissions = await this.permissionService.findByIds(
          updateRoleDto.permissions,
        );
        if (permissions.length !== updateRoleDto.permissions.length) {
          throw new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND);
        }
        roleToUpdate.permissions = permissions;
      } else {
        roleToUpdate.permissions = [];
      }
    }

    return this.roleRepository.save(roleToUpdate);
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    if (role.isSystem) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }
  }

  async addPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 验证权限是否存在
    const newPermissions =
      await this.permissionService.findByIds(permissionIds);
    if (newPermissions.length !== permissionIds.length) {
      throw new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND);
    }

    // 添加权限（去重）
    const currentPermissionIds = role.permissions.map((p) => p.id);
    const permissionsToAdd = newPermissions.filter(
      (p) => !currentPermissionIds.includes(p.id),
    );

    role.permissions.push(...permissionsToAdd);

    return this.roleRepository.save(role);
  }

  async updatePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    let permissions: Permission[] = [];
    // 验证权限是否存在
    if (permissionIds.length > 0) {
      permissions = await this.permissionService.findByIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        throw new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND);
      }
    }

    // 更新权限（完全替换）
    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async findPermissionsByRoleId(
    roleId: string,
    type?: string,
  ): Promise<
    Array<{
      id: string;
      name?: string;
      description?: string;
      code?: string;
      type?: string;
    }>
  > {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new BusinessException(ERROR_CODES.ROLE_NOT_FOUND);
    }

    let permissions = role.permissions || [];

    if (type) {
      permissions = permissions.filter((p) => p.type === (type as any));
    }

    return permissions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      code: p.name, // 使用name作为code
      type: p.type,
    }));
  }

  /**
   * 获取所有角色类型枚举值
   * @returns 角色类型列表，包含value和label
   */
  getRoleTypes(): Array<{ value: string; label: string }> {
    const roleTypes = Object.values(RoleType);

    // 映射为前端友好的格式
    const typeLabels: Record<RoleType, string> = {
      [RoleType.SUPER_ADMIN]: '超级管理员',
      [RoleType.ADMIN]: '管理员',
      [RoleType.OPERATOR]: '操作员',
    };

    return roleTypes.map((type) => ({
      value: type,
      label: typeLabels[type] || type,
    }));
  }
}
