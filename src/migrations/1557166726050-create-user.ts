import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1557166726050 implements MigrationInterface {
  name = 'CreateUser1557166726050';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "user" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT uuidv7(),
      "name" varchar NOT NULL,
      "email" citext NOT NULL UNIQUE,
      "password" varchar NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE "user"`);
  }
}
