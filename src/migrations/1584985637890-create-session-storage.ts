import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionStorage1584985637890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      /* sql */ `CREATE TABLE "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE)`
    );
    await queryRunner.query(
      /* sql */ `ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE`
    );
    await queryRunner.query(
      /* sql */ `CREATE INDEX "IDX_session_expire" ON "session" ("expire")`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE "session"`);
  }
}
