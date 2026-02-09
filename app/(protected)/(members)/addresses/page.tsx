import Link from "next/link";

export default function AddressesPage() {
  return (
    <div className="w-full h-full p-5 space-y-4">
      <div className="bg-second-lgt dark:bg-tertiary-drk p-6 rounded-2xl shadow-md space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold">Dirección</h1>
        <div className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
          <p>En esta página puede ver las direcciones registradas.</p>
          <p>Modificar una dirección.</p>
          <p>Enviar una nueva dirección.</p>
        </div>
      </div>
      <div className="bg-second-lgt dark:bg-tertiary-drk  p-6 rounded-2xl shadow-md space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-medium ">O que deseja fazer?</h2>
        <ul className="flex flex-col items-center justify-center w-full space-y-4">
          <li className="w-full rounded-2xl border p-4 items-center text-center text-xl">
            <Link href={"/"} className="w-full h-full ">
              Direcciones cadastradas
            </Link>
          </li>
          <li className="w-full rounded-2xl border p-4 items-center text-center text-xl">
            <Link href={"/"} className="w-full h-full ">
              Enviar Nueva Dirección
            </Link>
          </li>
          <li className="w-full rounded-2xl border p-4 items-center text-center text-xl">
            <Link href={"/"} className="w-full h-full ">
              Modificar Dirección
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
