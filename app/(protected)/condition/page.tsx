export default function ConditionPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Introdução */}
      <section className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 shadow max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold">Condiciones de Uso</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-lg">
          Aquí puedes consultar las condiciones de uso de este sistema.
        </p>
      </section>

      {/* Condições */}
      <div className="space-y-6 max-w-2xl mx-auto p-6 text-base text-zinc-700 dark:text-zinc-300">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Términos Generales</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Todos los derechos están reservados. Sin embargo, el uso de este
              sistema es gratuito.
            </li>
            <li>
              El acceso o uso puede ser revocado o restringido en cualquier
              momento, sin previo aviso.
            </li>
          </ul>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Privacidad y Datos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              No almacenamos información sensible, cumpliendo con la{" "}
              <strong>Ley General de Protección de Datos (LGPD)</strong> de
              Brasil.
            </li>
            <li>
              Solo recopilamos información necesaria como:{" "}
              <strong>nombre, correo electrónico y foto de perfil</strong>.
            </li>
            <li>
              Al utilizar este sistema, el usuario acepta el uso de esos datos
              para el funcionamiento básico.
            </li>
            <li>
              Si el usuario no está de acuerdo o desea eliminar sus datos, puede
              solicitarlo en cualquier momento contactando a los
              administradores.
            </li>
          </ul>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-2xl shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">
            Información para Administradores
          </h2>
          <p>
            Recuerde que es su responsabilidad respetar la privacidad de los
            usuarios y procesar solicitudes de eliminación de datos de manera
            rápida y segura.
          </p>
        </div>
      </div>
    </div>
  );
}
