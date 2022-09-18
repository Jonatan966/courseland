import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  driver_license: string;

  @Column()
  isAdmin: boolean;

  @Column()
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @Expose({
    name: 'avatar_url',
  })
  avatar_url(): string {
    if (!this.avatar) {
      return null;
    }

    switch (process.env.DISK) {
      case 'local':
        return `${process.env.APP_URL}/avatar/${this.avatar}`;

      case 's3':
        return `${process.env.AWS_BUCKET_URL}/avatar/${this.avatar}`;

      default:
        return null;
    }
  }

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
      this.isAdmin = false;
    }
  }
}

export { User };
