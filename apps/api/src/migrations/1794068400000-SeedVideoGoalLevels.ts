import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedVideoGoalLevels1794068400000 implements MigrationInterface {
  name = 'SeedVideoGoalLevels1794068400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "videos" ("youtubeId", "title", "channel", "durationSeconds", "goals", "levels", "equipment") VALUES
      ('a1B2c3D4e5F', 'Treino para emagrecer: comece com segurança', 'Movimento em Casa', 1200, ARRAY['lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('b2C3d4E5f6G', 'Treino para emagrecer: circuito intermediário', 'Movimento em Casa', 1800, ARRAY['lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells']::"public"."user_profiles_equipment_enum"[]),
      ('c3D4e5F6g7H', 'Treino para emagrecer: desafio avançado', 'Movimento em Casa', 2100, ARRAY['lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['advanced']::"public"."user_profiles_level_enum"[], ARRAY['kettlebell']::"public"."user_profiles_equipment_enum"[]),
      ('d4E5f6G7h8I', 'Ganho de massa: treino inicial em casa', 'Força em Casa', 1500, ARRAY['gain_muscle']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells']::"public"."user_profiles_equipment_enum"[]),
      ('e5F6g7H8i9J', 'Ganho de massa: treino intermediário completo', 'Força em Casa', 2100, ARRAY['gain_muscle']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('f6G7h8I9j0K', 'Ganho de massa: força avançada com halteres', 'Força em Casa', 2400, ARRAY['gain_muscle']::"public"."user_profiles_goal_enum"[], ARRAY['advanced']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells']::"public"."user_profiles_equipment_enum"[]),
      ('g7H8i9J0k1L', 'Condicionamento: treino leve para começar', 'Train Up', 1200, ARRAY['conditioning']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('h8I9j0K1l2M', 'Condicionamento: circuito de resistência', 'Train Up', 1800, ARRAY['conditioning']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate']::"public"."user_profiles_level_enum"[], ARRAY['resistance_bands']::"public"."user_profiles_equipment_enum"[]),
      ('i9J0k1L2m3N', 'Condicionamento: treino intenso avançado', 'Train Up', 2400, ARRAY['conditioning']::"public"."user_profiles_goal_enum"[], ARRAY['advanced']::"public"."user_profiles_level_enum"[], ARRAY['kettlebell']::"public"."user_profiles_equipment_enum"[]),
      ('j0K1l2M3n4O', 'Saúde e movimento: rotina para iniciantes', 'Movimento em Casa', 900, ARRAY['maintain_health']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('k1L2m3N4o5P', 'Saúde e movimento: treino equilibrado', 'Movimento em Casa', 1500, ARRAY['maintain_health']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate']::"public"."user_profiles_level_enum"[], ARRAY['resistance_bands']::"public"."user_profiles_equipment_enum"[]),
      ('l2M3n4O5p6Q', 'Saúde e movimento: força avançada', 'Movimento em Casa', 2100, ARRAY['maintain_health']::"public"."user_profiles_goal_enum"[], ARRAY['advanced']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells']::"public"."user_profiles_equipment_enum"[])
      ON CONFLICT ("youtubeId") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "videos" WHERE "youtubeId" IN ('a1B2c3D4e5F', 'b2C3d4E5f6G', 'c3D4e5F6g7H', 'd4E5f6G7h8I', 'e5F6g7H8i9J', 'f6G7h8I9j0K', 'g7H8i9J0k1L', 'h8I9j0K1l2M', 'i9J0k1L2m3N', 'j0K1l2M3n4O', 'k1L2m3N4o5P', 'l2M3n4O5p6Q')`);
  }
}
