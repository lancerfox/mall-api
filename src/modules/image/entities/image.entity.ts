import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '图片公网URL (Supabase)' })
  url: string;

  @Column({ comment: '图片在Supabase中的路径' })
  path: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}