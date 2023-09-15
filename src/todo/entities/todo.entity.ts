import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from '../../user/entities/user.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: false })
  done: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @Exclude()
  owner: User | number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
