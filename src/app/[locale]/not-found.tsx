import { useTranslations } from "next-intl";
import { PanelBody, PanelHead } from "@/components/layout/PanelHead";
import { ui } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <>
      <PanelHead title={t("title")} />
      <PanelBody>
        <div className={ui.empty}>{t.rich("text", { link: (c) => <Link href="/">{c}</Link> })}</div>
      </PanelBody>
    </>
  );
}
