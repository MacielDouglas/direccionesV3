"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      await signIn();
      toast("Login com sucesso!!!");
    } catch (error) {
      setLoading(false);
      toast(`Erro ao fazer login: , ${error}`);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Button
          className="p-6 rounded-full w-full cursor-pointer"
          type="button"
          onClick={handleLogin}
        >
          {/* <GoogleIcon /> */}
          Iniciar sesión con Google
        </Button>
      )}
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={64}
        height={64}
        viewBox="0 0 24 24"
      >
        <g>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.14}
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.29}
            transform="rotate(30 12 12)"
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.43}
            transform="rotate(60 12 12)"
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.57}
            transform="rotate(90 12 12)"
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.71}
            transform="rotate(120 12 12)"
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            opacity={0.86}
            transform="rotate(150 12 12)"
          ></rect>
          <rect
            width={2}
            height={5}
            x={11}
            y={1}
            fill="currentColor"
            transform="rotate(180 12 12)"
          ></rect>
          <animateTransform
            attributeName="transform"
            calcMode="discrete"
            dur="0.75s"
            repeatCount="indefinite"
            type="rotate"
            values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
          ></animateTransform>
        </g>
      </svg>
    </div>
  );
}
