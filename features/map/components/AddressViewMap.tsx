"use client";

import { useState } from "react";
import { Car, Footprints } from "lucide-react";
import { MapboxProvider } from "../core/MapboxProvider";
import { Coordinates, RouteProfile } from "../types/map.types";
import RouteLayer from "../layers/RouteLayer";
import Link from "next/link";

export function AddressViewMap({ latitude, longitude }: Coordinates) {
  const [profile, setProfile] = useState<RouteProfile>("walking");

  const destination = { latitude, longitude };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${profile === "walking" ? "walking" : "driving"}`;

  const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

  return (
    <div className="w-full flex flex-col">
      {/* Mapa */}
      <div className="w-full h-96 sm:h-96  overflow-hidden shadow-md relative">
        <MapboxProvider>
          <RouteLayer destination={destination} profile={profile} />
        </MapboxProvider>

        {/* Badge de modo no canto do mapa */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1 text-gray-700">
          {profile === "walking" ? <Footprints size={14} /> : <Car size={14} />}
          {profile === "walking" ? "A pé" : "De carro"}
        </div>
      </div>

      {/* Botões de modo */}
      <div className="py-3 space-y-3 bg-white z-20 -mt-14 rounded-2xl m-2 dark:bg-tertiary-drk">
        <div className="flex gap-2 px-3">
          <button
            onClick={() => setProfile("walking")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              profile === "walking"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Footprints size={18} />
            Caminando
          </button>

          <button
            onClick={() => setProfile("driving")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              profile === "driving"
                ? "bg-black text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Car size={18} />
            Auto
          </button>
        </div>

        {/* Botões externos */}
        <div className="flex gap-2 px-3">
          <Link
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M18.27 6c1.01 2.17.78 4.73-.33 6.81c-.94 1.69-2.29 3.12-3.44 4.69c-.5.7-1 1.45-1.37 2.26c-.13.27-.22.55-.32.83s-.19.56-.28.84c-.09.26-.2.57-.53.57c-.39 0-.5-.44-.58-.74c-.24-.73-.48-1.43-.85-2.1c-.42-.79-.95-1.52-1.49-2.23zM9.12 8.42l-3.3 3.92c.61 1.29 1.52 2.39 2.39 3.49c.21.25.42.51.62.78L13 11.67l-.04.01c-1.46.5-3.08-.24-3.66-1.68c-.08-.17-.14-.37-.18-.57a3 3 0 0 1 0-1zm-2.54-3.8l-.01.01c-1.62 2.05-1.9 4.9-.93 7.31L9.63 7.2l-.05-.05zm7.64-2.26L11 6.17l.04-.01c1.34-.46 2.84.12 3.52 1.34c.15.28.27.58.31.88c.06.38.08.65.01 1.02v.01l3.2-3.8a7 7 0 0 0-3.85-3.24zM9.89 6.89l3.91-4.65l-.04-.01C13.18 2.08 12.59 2 12 2c-1.97 0-3.83.85-5.15 2.31l-.02.01z"
              ></path>
            </svg>
            Google Maps
          </Link>

          <Link
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-cyan-300 hover:bg-cyan-200 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 32 32"
              // className="bg-white"
            >
              <path
                fill="currentColor"
                d="M17.7 4c-5 0-10.1 3.3-11.1 8.3c-.6 3 .2 5.8-2.3 5.8c-1.1 0-1.8 1.3-1.1 2.2c1.4 1.9 3.3 3 5.2 3.7l.616.246A2.5 2.5 0 0 0 11.5 27a2.5 2.5 0 0 0 2.445-2h4.108a2.5 2.5 0 0 0 2.447 2a2.5 2.5 0 0 0 2.371-3.291c4.19-2.13 6.518-6.371 5.729-10.908C28 7.7 23 4 17.7 4m0 2c4.5 0 8.5 3.1 9.2 7.3c.6 3.6-1.3 7.1-4.8 8.8l-.454.181A2.5 2.5 0 0 0 20.5 22a2.5 2.5 0 0 0-1.998 1H13.9c-.122 0-.28-.016-.42-.021A2.5 2.5 0 0 0 11.5 22a2.5 2.5 0 0 0-1.367.41l-.033-.01l-.9-.3c-1.4-.5-2.6-1.2-3.6-2.2c2.4-.7 2.6-3.5 2.7-5.1c.1-.7.1-1.4.2-2.1c.9-4.2 5.3-6.7 9.2-6.7m-3.2 5a1.5 1.5 0 0 0 0 3a1.5 1.5 0 0 0 0-3m6 0a1.5 1.5 0 0 0 0 3a1.5 1.5 0 0 0 0-3m-6.895 3.979A.44.44 0 0 0 13.4 15c-.3.1-.5.3-.4.6c.5 2.3 2.7 3.4 4.5 3.4s4-1.1 4.5-3.4c0-.3-.1-.5-.4-.6c-.3 0-.5.1-.6.4c-.4 1.8-2.1 2.6-3.5 2.6s-3.1-.8-3.5-2.6c-.075-.225-.207-.393-.395-.421"
              ></path>
            </svg>
            {/* <Navigation size={18} className="text-cyan-500" /> */}
            Waze
          </Link>
        </div>
      </div>
    </div>
  );
}
