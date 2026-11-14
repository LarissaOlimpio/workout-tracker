export const formatNumber = (value: number, digits = 1) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
    new Date(`${value}T00:00:00`),
  );

export const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T00:00:00`));

export const todayLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
