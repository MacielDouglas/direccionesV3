export default function ConditionPage() {
  return (
    <div className="space-y-6 px-4 py-6">
      <section className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-xs">
        <h1 className="text-3xl font-semibold tracking-tight">Condiciones de Uso</h1>
        <p className="mt-2 text-muted-foreground">
          Aquí puedes consultar las condiciones de uso de este sistema.
        </p>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 p-6 text-base text-foreground/80">
        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="text-xl font-semibold tracking-tight">Términos Generales</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Todos los derechos están reservados. Sin embargo, el uso de este sistema es gratuito.
            </li>
            <li>
              El acceso o uso puede ser revocado o restringido en cualquier momento, sin previo
              aviso.
            </li>
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
          <h2 className="text-xl font-semibold tracking-tight">Privacidad y Datos</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              No almacenamos información sensible, cumpliendo con la{" "}
              <strong>Ley General de Protección de Datos (LGPD)</strong> de Brasil.
            </li>
            <li>
              Solo recopilamos información necesaria como:{" "}
              <strong>nombre, correo electrónico y foto de perfil</strong>.
            </li>
            <li>
              Al utilizar este sistema, el usuario acepta el uso de esos datos para el
              funcionamiento básico.
            </li>
            <li>
              Si el usuario no está de acuerdo o desea eliminar sus datos, puede solicitarlo en
              cualquier momento contactando a los administradores.
            </li>
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <h2 className="text-xl font-semibold tracking-tight text-amber-800 dark:text-amber-300">
            Información para Administradores
          </h2>
          <p>
            Recuerde que es su responsabilidad respetar la privacidad de los usuarios y procesar
            solicitudes de eliminación de datos de manera rápida y segura.
          </p>
        </div>
      </div>
    </div>
  );
}
