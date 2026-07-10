import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTodo1597106889894 implements MigrationInterface {
  name = 'CreateTodo1597106889894';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "todo" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT uuidv7(),
      "text" varchar NOT NULL,
      "done" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "ownerId" uuid NOT NULL REFERENCES "user"("id")
        ON DELETE RESTRICT
        ON UPDATE NO ACTION
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE "todo"`);
  }
}
