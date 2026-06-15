import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfile1570141220019 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE TABLE "profile" (
          "id" SERIAL NOT NULL,
          "phone" character varying NOT NULL,
          "birthday" date NOT NULL,
          "website" character varying NOT NULL,
          "occupation" character varying NOT NULL,
          "userId" integer,
          CONSTRAINT "REL_a24972ebd73b106250713dcddd"
            UNIQUE ("userId"),
          CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb"
            PRIMARY KEY ("id"),
          CONSTRAINT "FK_a24972ebd73b106250713dcddd9"
            FOREIGN KEY ("userId")
            REFERENCES "user"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      /* sql */ `ALTER TABLE "profile" DROP CONSTRAINT "FK_a24972ebd73b106250713dcddd9"`
    );
    await queryRunner.query(/* sql */ `DROP TABLE "profile"`);
  }
}
