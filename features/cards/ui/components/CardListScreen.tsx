import { listCards, getOrgMembers } from "../../application/card.service";
import { CardListClient } from "../components/CardListClient";

interface Props {
  organizationId: string;
  organizationSlug: string;
}

export async function CardListScreen({
  organizationId,
  organizationSlug,
}: Props) {
  const [cards, members] = await Promise.all([
    listCards(organizationId),
    getOrgMembers(organizationId),
  ]);

  return (
    <CardListClient
      cards={cards.map((card) => ({
        ...card,
        events: card.events.map((e) => ({
          date: e.date,
          user: e.user,
        })),
      }))}
      members={members}
      organizationSlug={organizationSlug}
    />
  );
}


// import Link from "next/link";
// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { listCards, getOrgMembers } from "../../application/card.service";
// import { CardListItem } from "../components/CardListItem";

// interface Props {
//   organizationId: string;
//   organizationSlug: string;
// }

// export async function CardListScreen({
//   organizationId,
//   organizationSlug,
// }: Props) {
//   const [cards, members] = await Promise.all([
//     listCards(organizationId),
//     getOrgMembers(organizationId),
//   ]);

//   return (
//     <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
//       <header className="flex items-center justify-between mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl font-bold">Tarjetas</h1>
//           <p className="text-sm text-muted-foreground mt-0.5">
//             {cards.length} tarjeta{cards.length !== 1 ? "s" : ""} registrada
//             {cards.length !== 1 ? "s" : ""}
//           </p>
//         </div>
//         <Button asChild>
//           <Link href={`/org/${organizationSlug}/admin/cards/new`}>
//             <Plus className="size-4 mr-1.5" aria-hidden />
//             Nueva tarjeta
//           </Link>
//         </Button>
//       </header>

//       {cards.length === 0 ? (
//         <div className="text-center py-16 text-muted-foreground">
//           <p className="text-sm">Aún no se han creado tarjetas.</p>
//         </div>
//       ) : (
//         <ul className="flex flex-col gap-4" aria-label="Lista de cards">
//           {cards.map((card) => (
//             <li key={card.id}>
//               <CardListItem
//                 card={{
//                   ...card,

//                   events: card.events.map((e) => ({
//                     date: e.date,
//                     user: e.user,
//                   })),
//                 }}
//                 members={members}
//                 organizationSlug={organizationSlug}
//               />
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
