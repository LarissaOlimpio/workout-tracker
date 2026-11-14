import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideosAndFeedback1793982000000
  implements MigrationInterface
{
  name = 'CreateVideosAndFeedback1793982000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."video_feedback_rating_enum" AS ENUM('like', 'dislike')`,
    );
    await queryRunner.query(
      `CREATE TABLE "videos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "youtubeId" character varying(20) NOT NULL,
        "title" character varying(255) NOT NULL,
        "channel" character varying(255) NOT NULL,
        "durationSeconds" integer NOT NULL,
        "goals" "public"."user_profiles_goal_enum" array NOT NULL,
        "levels" "public"."user_profiles_level_enum" array NOT NULL,
        "equipment" "public"."user_profiles_equipment_enum" array NOT NULL,
        CONSTRAINT "PK_videos_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_videos_youtubeId" UNIQUE ("youtubeId")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "video_feedback" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "videoId" uuid NOT NULL,
        "rating" "public"."video_feedback_rating_enum" NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_video_feedback_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_video_feedback_user_video" UNIQUE ("userId", "videoId"),
        CONSTRAINT "FK_video_feedback_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_video_feedback_video" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `INSERT INTO "videos" ("youtubeId", "title", "channel", "durationSeconds", "goals", "levels", "equipment") VALUES
      ('dQw4w9WgXcQ', 'Treino em casa para iniciantes com halteres – 30 minutos', 'Train Up', 1800, ARRAY['gain_muscle','maintain_health']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells']::"public"."user_profiles_equipment_enum"[]),
      ('M7lc1UVf-VE', 'Treino com faixas elásticas para queimar gordura', 'Movimento em Casa', 1500, ARRAY['lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['beginner','intermediate']::"public"."user_profiles_level_enum"[], ARRAY['resistance_bands']::"public"."user_profiles_equipment_enum"[]),
      ('ysz5S6PUM-U', 'Como começar a treinar 3x por semana sem academia', 'Train Up', 960, ARRAY['maintain_health','conditioning']::"public"."user_profiles_goal_enum"[], ARRAY['beginner']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('ScMzIvxBSi4', 'Circuito de emagrecimento: halteres + faixa elástica', 'Movimento em Casa', 2100, ARRAY['lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate']::"public"."user_profiles_level_enum"[], ARRAY['dumbbells','resistance_bands']::"public"."user_profiles_equipment_enum"[]),
      ('jNQXAC9IVRw', 'Postura e técnica correta dos exercícios para iniciantes', 'Treino Seguro', 840, ARRAY['gain_muscle','maintain_health']::"public"."user_profiles_goal_enum"[], ARRAY['beginner','intermediate']::"public"."user_profiles_level_enum"[], ARRAY[]::"public"."user_profiles_equipment_enum"[]),
      ('aqz-KE-bpKQ', 'Condicionamento com kettlebell: treino completo', 'Train Up', 1920, ARRAY['conditioning']::"public"."user_profiles_goal_enum"[], ARRAY['intermediate','advanced']::"public"."user_profiles_level_enum"[], ARRAY['kettlebell']::"public"."user_profiles_equipment_enum"[]),
      ('eYq7WapuDLU', 'Treino avançado de força com barra fixa e halteres', 'Força em Casa', 2400, ARRAY['gain_muscle']::"public"."user_profiles_goal_enum"[], ARRAY['advanced']::"public"."user_profiles_level_enum"[], ARRAY['pull_up_bar','dumbbells']::"public"."user_profiles_equipment_enum"[]),
      ('L_jWHffIx5E', 'Caminhada intervalada na esteira para cuidar da saúde', 'Movimento em Casa', 1800, ARRAY['maintain_health','lose_weight']::"public"."user_profiles_goal_enum"[], ARRAY['beginner','intermediate']::"public"."user_profiles_level_enum"[], ARRAY['treadmill']::"public"."user_profiles_equipment_enum"[])`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "video_feedback"`);
    await queryRunner.query(`DROP TABLE "videos"`);
    await queryRunner.query(
      `DROP TYPE "public"."video_feedback_rating_enum"`,
    );
  }
}
