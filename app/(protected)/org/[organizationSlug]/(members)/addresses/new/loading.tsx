import { Skeleton } from "@/components/ui/skeleton";

export default function NewAddressLoading() {
  console.log("Foi chamado");
  return (
    <div className="mx-auto h-full w-full max-w-5xl space-y-4">
      <div className="space-y-6 border-b p-5 md:p-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          {/* <MapPinPlus className="h-10 w-10 text-brand" aria-hidden="true" /> */}
          <h1 className="text-3xl font-semibold">Nueva Dirección</h1>
        </div>
        <div className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
          <p>En esta página puede enviar una nueva dirección.</p>
          <p>
            Debes elegir el tipo de dirección, información básica, datos GPS y
            una foto.
          </p>
        </div>
      </div>
      <Skeleton className="h-16 w-16" />
      {/* <AddressForm /> */}
    </div>
  );
}
