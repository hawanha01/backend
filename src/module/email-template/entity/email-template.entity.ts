import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entity/base.entity';

@Entity('email_templates')
@Index(['templateCode'], { unique: true })
export class EmailTemplate extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'template_code',
    unique: true,
  })
  templateCode: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
    name: 'subject',
  })
  subject: string;

  @Column({
    type: 'text',
    nullable: false,
    name: 'html_content',
  })
  htmlContent: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'description',
  })
  description: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'variables',
  })
  variables: string[] | null;
}
