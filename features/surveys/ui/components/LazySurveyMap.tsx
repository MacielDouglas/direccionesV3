"use client";

import dynamic from "next/dynamic";
import type { SurveyPin } from "../../types/survey.types";

const SurveyMap = dynamic(() => import("./SurveyMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" aria-hidden="true" />,
});

interface Props {
  organizationId: string;
  personId: string;
  userRole: string;
  initialPins: SurveyPin[];
}

export default function LazySurveyMap(props: Props) {
  return <SurveyMap {...props} />;
}
