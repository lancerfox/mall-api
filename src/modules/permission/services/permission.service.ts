import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionModel.findOne({
      name: createPermissionDto.name,
    });

    if (existingPermission) {
      throw new ConflictException('权限名称已存在');
    }

    const permission = new this.permissionModel(createPermissionDto);
    return permission.save();
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }
    return permission;
  }

  async findById(id: string): Promise<Permission> {
    return this.findOne(id);
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionModel.findOne({ name }).exec();
  }

  async findByNames(names: string[]): Promise<Permission[]> {
    return this.permissionModel.find({ name: { $in: names } }).exec();
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    if (updatePermissionDto.name) {
      const existingPermission = await this.permissionModel.findOne({
        name: updatePermissionDto.name,
        _id: { $ne: id },
      });

      if (existingPermission) {
        throw new ConflictException('权限名称已存在');
      }
    }

    const permission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('权限不存在');
    }
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionModel.find({ module }).exec();
  }
}
