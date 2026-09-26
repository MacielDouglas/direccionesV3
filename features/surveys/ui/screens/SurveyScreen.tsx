import { getServerDictionary } from "@/lib/i18n/server";
import type { SurveyPin } from "../../types/survey.types";
import LazySurveyMap from "../components/LazySurveyMap";

interface Props {
  organizationId: string;
  personId: string;
  userRole: string;
  initialPins: SurveyPin[];
}

export default async function SurveyScreen(props: Props) {
  const t = await getServerDictionary();

  return (
    <section
      aria-label={t.survey.mapAria}
      className="relative min-h-0 w-full flex-1 overflow-hidden"
    >
      <LazySurveyMap {...props} />
    </section>
  );
}
