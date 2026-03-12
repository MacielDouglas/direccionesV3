import type { SurveyPin } from "../../types/survey.types";
import SurveyMap from "../components/SurveyMap";

interface Props {
  organizationId: string;
  userId: string;
  userRole: string;
  initialPins: SurveyPin[];
}

export default function SurveyScreen(props: Props) {
  return (
    <main
      aria-label="Mapa de relevamiento"
      className="relative h-svh w-full overflow-hidden"
    >
      <SurveyMap {...props} />
    </main>
  );
}
