import { useTranslations } from "next-intl";
import { ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";

/** The 404 outside the lobby: Next ships this one inside every page's payload, so it stays small. */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className={`${ui.empty} max-w-[480px]`}>
        <h1 className="m-0 mb-2 text-[22px] font-bold text-gold">{t("title")}</h1>
        {t.rich("text", { link: (c) => <Link href="/">{c}</Link> })}
      </div>
    </main>
  );
}
