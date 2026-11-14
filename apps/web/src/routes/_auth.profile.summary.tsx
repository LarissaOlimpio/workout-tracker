import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Play } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../components/ui/Button";
import {
  clearFeedback,
  getProfile,
  getRecommendations,
  setFeedback,
  type RecommendationResponse,
} from "../lib/profile-api";
import { profileLabels } from "../lib/profile.labels";

const profileKey = ["profile"];
const recommendationsKey = ["recommendations"];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function ProfileSummaryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedbackError, setFeedbackError] = useState(false);
  const profileQuery = useQuery({ queryKey: profileKey, queryFn: getProfile });
  const recommendationsQuery = useQuery({
    queryKey: recommendationsKey,
    queryFn: getRecommendations,
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ videoId, rating }: { videoId: string; rating: "like" | "dislike" | null }) => {
      if (rating === null) await clearFeedback(videoId);
      else await setFeedback(videoId, rating);
    },
    onMutate: async ({ videoId, rating }) => {
      setFeedbackError(false);
      await queryClient.cancelQueries({ queryKey: recommendationsKey });
      const previous = queryClient.getQueryData<RecommendationResponse>(recommendationsKey);
      queryClient.setQueryData<RecommendationResponse>(recommendationsKey, (current) =>
        current
          ? {
              ...current,
              videos: current.videos.map((video) =>
                video.id === videoId ? { ...video, myFeedback: rating } : video,
              ),
            }
          : current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      setFeedbackError(true);
      if (context?.previous) {
        queryClient.setQueryData(recommendationsKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: recommendationsKey }),
  });

  const profile = profileQuery.data;
  const recommendations = recommendationsQuery.data?.videos ?? [];
  const isLoading = profileQuery.isLoading || recommendationsQuery.isLoading;
  const hasError = profileQuery.isError || recommendationsQuery.isError;
  const bmi = profile
    ? (profile.weightKg / (profile.heightCm / 100) ** 2)
        .toFixed(1)
        .replace(".", ",")
    : null;
  const baseText = profile
    ? `Com base em: ${profileLabels.goal[profile.goal]} · ${profileLabels.level[profile.level]} · ${profile.daysPerWeek}x por semana · ${profile.equipment.map((item) => profileLabels.equipment[item]).join(" e ")}`
    : "";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-2xl font-extrabold tracking-tight">
              TRAIN <span className="text-primary">UP</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Passo 2 de 3 · Perfil salvo
            </p>
          </div>
          <h1 className="mt-7 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Seu perfil está pronto!
          </h1>
          <p className="mt-1 text-base text-muted-foreground sm:text-lg">
            Confira seus dados e veja os vídeos escolhidos para o seu objetivo.
          </p>
        </header>

        {isLoading ? (
          <p className="rounded-3xl border border-border bg-surface p-8 text-muted-foreground">
            Carregando seu resumo...
          </p>
        ) : hasError || !profile ? (
          <div className="rounded-3xl border border-border bg-surface p-8">
            <p className="text-danger">Não foi possível carregar seu perfil e as recomendações.</p>
            <Button className="mt-5" onClick={() => navigate({ to: "/profile-setup" })}>
              Abrir perfil
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
            <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-base font-extrabold uppercase tracking-wider">
                Dados físicos e medidas
              </h2>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Measure label="Altura" value={`${profile.heightCm} cm`} />
                <Measure label="Peso" value={`${profile.weightKg} kg`} />
                <Measure label="IMC" value={bmi ?? "—"} />
              </div>
              {(profile.chestCm !== null || profile.waistCm !== null || profile.hipCm !== null) && (
                <div className="mt-5">
                  <h3 className="mb-3 text-sm font-bold">Medidas corporais</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.chestCm !== null && <Measure label="Peito" value={`${profile.chestCm} cm`} />}
                    {profile.waistCm !== null && <Measure label="Cintura" value={`${profile.waistCm} cm`} />}
                    {profile.hipCm !== null && <Measure label="Quadril" value={`${profile.hipCm} cm`} />}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-border pt-5">
                <h2 className="text-base font-extrabold uppercase tracking-wider">
                  Sua rotina e metas
                </h2>
                <ProfileDetail label="Objetivo">
                  <Chip>{profileLabels.goal[profile.goal]}</Chip>
                </ProfileDetail>
                <ProfileDetail label="Nível de experiência">
                  <Chip>{profileLabels.level[profile.level]}</Chip>
                </ProfileDetail>
                <ProfileDetail label="Dias de treino por semana">
                  <Chip>{profile.daysPerWeek} dias</Chip>
                </ProfileDetail>
                <ProfileDetail label="Equipamentos em casa">
                  <div className="flex flex-wrap gap-2">
                    {profile.equipment.map((item) => (
                      <Chip key={item}>{profileLabels.equipment[item]}</Chip>
                    ))}
                  </div>
                </ProfileDetail>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-6 h-12 w-full"
                onClick={() => navigate({ to: "/profile-setup" })}
              >
                Editar perfil
              </Button>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="mb-4">
                <h2 className="text-base font-extrabold uppercase tracking-wider">
                  Vídeos recomendados
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {baseText}
                </p>
              </div>
              {recommendationsQuery.isError ? (
                <p className="rounded-2xl border border-border bg-input p-5 text-danger">
                  Não foi possível carregar os vídeos.
                </p>
              ) : recommendations.length === 0 ? (
                <p className="rounded-2xl border border-border bg-input p-5 text-muted-foreground">
                  Ainda não há vídeos compatíveis com seu perfil.
                </p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((video) => (
                    <article
                      key={video.id}
                      className="grid gap-4 rounded-2xl border border-border bg-input/70 p-3 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)_150px] sm:items-center sm:gap-5 sm:p-4"
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-video overflow-hidden rounded-xl bg-background"
                        aria-label={`Assistir: ${video.title}`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt=""
                          className="h-full w-full object-cover brightness-[0.55] transition duration-300 group-hover:brightness-75"
                        />
                        <span className="absolute inset-0 grid place-items-center text-white">
                          <span className="grid size-11 place-items-center rounded-full bg-primary shadow-lg">
                            <Play className="ml-1 size-5 fill-current" />
                          </span>
                        </span>
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black px-1.5 py-0.5 text-xs font-bold text-white">
                          {formatDuration(video.durationSeconds)}
                        </span>
                      </a>
                      <div className="min-w-0">
                        <h3 className="font-bold leading-snug">{video.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {video.channel} · YouTube
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <FeedbackButton
                          label="Gostei"
                          selected={video.myFeedback === "like"}
                          disabled={feedbackMutation.isPending}
                          onClick={() => feedbackMutation.mutate({
                            videoId: video.id,
                            rating: video.myFeedback === "like" ? null : "like",
                          })}
                        />
                        <FeedbackButton
                          label="Não gostei"
                          selected={video.myFeedback === "dislike"}
                          disabled={feedbackMutation.isPending}
                          onClick={() => feedbackMutation.mutate({
                            videoId: video.id,
                            rating: video.myFeedback === "dislike" ? null : "dislike",
                          })}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {feedbackError && (
                <p role="alert" className="mt-4 text-sm text-danger">
                  Não foi possível salvar sua avaliação. Tente novamente.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Measure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-input p-3 sm:p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold leading-tight sm:text-xl">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-primary bg-primary/10 px-3.5 py-1.5 text-sm font-medium">
      {children}
    </span>
  );
}

function ProfileDetail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function FeedbackButton({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-full items-center gap-2.5 rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 ${selected ? "border-primary bg-primary/10" : "border-border hover:bg-surface"}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-5 shrink-0 place-items-center rounded-sm border ${selected ? "border-primary bg-primary text-white" : "border-muted-foreground bg-background"}`}
      >
        {selected && <Check className="size-4 stroke-[3]" />}
      </span>
      {label}
    </button>
  );
}

export const Route = createFileRoute("/_auth/profile/summary")({
  component: ProfileSummaryPage,
});
