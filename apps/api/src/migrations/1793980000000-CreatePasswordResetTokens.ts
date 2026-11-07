import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1793980000000
  implements MigrationInterface
{
  name = 'CreatePasswordResetTokens1793980000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "tokenHash" character varying(64) NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "usedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_password_reset_tokens_userId" ON "password_reset_tokens" ("userId")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_password_reset_tokens_tokenHash" ON "password_reset_tokens" ("tokenHash")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "password_reset_tokens"');
  }
}
