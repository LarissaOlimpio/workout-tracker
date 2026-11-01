import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfiles1793285497801 implements MigrationInterface {
  name = 'CreateUserProfiles1793285497801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_profiles_goal_enum" AS ENUM('lose_weight', 'gain_muscle', 'conditioning', 'maintain_health')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_profiles_level_enum" AS ENUM('beginner', 'intermediate', 'advanced')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_profiles_equipment_enum" AS ENUM('none', 'dumbbells', 'resistance_bands', 'pull_up_bar', 'kettlebell', 'bench', 'treadmill')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("userId" uuid NOT NULL, "goal" "public"."user_profiles_goal_enum" NOT NULL, "level" "public"."user_profiles_level_enum" NOT NULL, "daysPerWeek" integer NOT NULL, "equipment" "public"."user_profiles_equipment_enum" array NOT NULL, "weightKg" double precision NOT NULL, "heightCm" double precision NOT NULL, "birthDate" date NOT NULL, CONSTRAINT "PK_user_profiles_userId" PRIMARY KEY ("userId"), CONSTRAINT "FK_user_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_profiles_equipment_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_profiles_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_profiles_goal_enum"`);
  }
}
