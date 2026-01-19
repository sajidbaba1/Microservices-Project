import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ select: false }) // Don't return password in queries by default
    password!: string;

    @Column({ default: 'user' })
    role!: string;

    @Column({ nullable: true })
    avatarUrl?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
