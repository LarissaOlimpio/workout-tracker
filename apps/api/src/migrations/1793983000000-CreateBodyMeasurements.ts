import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBodyMeasurements1793983000000
  implements MigrationInterface
{
  name = 'CreateBodyMeasurements1793983000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "targetWeightKg" double precision`,
    );
    await queryRunner.query(
      `CREATE TABLE "body_measurements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "measuredAt" date NOT NULL,
        "weightKg" double precision NOT NULL,
        "chestCm" double precision,
        "waistCm" double precision,
        "hipCm" double precision,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_body_measurements_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_body_measurements_user_date" UNIQUE ("userId", "measuredAt"),
        CONSTRAINT "FK_body_measurements_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "body_measurements"`);
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "targetWeightKg"`,
    );
  }
}
