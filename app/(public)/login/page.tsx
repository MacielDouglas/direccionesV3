import Image from "next/image";
import LoginButton from "./LoginButton";

export default function LoginPage() {
  return (
    <main
      aria-label="Página de login"
      className="w-full h-screen bg-center bg-cover bg-no-repeat flex flex-col justify-center items-center px-4"
      style={{ backgroundImage: "url('/street.webp')" }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-black/20 backdrop-blur-md shadow-xl shadow-black/40 p-10 sm:p-8">
        <header className=" space-y-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-3xl font-bold text-white leading-relaxed self-start">
            Bienvenido a{" "}
            <span className="text-bold text-5xl text-orange-500 tracking-wide ">
              Direcciones
            </span>
          </h1>
          <Image
            src={"logo_white.svg"}
            alt="Logo"
            width={180}
            height={180}
            loading="eager"
          />

          <p className="text-lg text-stone-200 bg-black/40 rounded-lg px-3 py-2 text-center">
            Para comenzar, inicie sesión con su cuenta{" "}
            <span className="text-red-500 font-semibold">Google</span>.
          </p>
        </header>
        <div className="mt-6">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
