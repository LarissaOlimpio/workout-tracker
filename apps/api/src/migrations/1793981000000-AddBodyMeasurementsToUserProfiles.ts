import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBodyMeasurementsToUserProfiles1793981000000
  implements MigrationInterface
{
  name = 'AddBodyMeasurementsToUserProfiles1793981000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "chestCm" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "waistCm" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD "hipCm" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "hipCm"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "waistCm"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP COLUMN "chestCm"`,
    );
  }
}
