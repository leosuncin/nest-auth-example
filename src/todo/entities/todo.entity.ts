import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  text!: string;

  @Column({ default: false })
  done!: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @Exclude()
  owner!: User | User['id'];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(data: Partial<Todo> = {}) {
    Object.assign(this, data);
  }
}
