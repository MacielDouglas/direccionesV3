"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Address } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ADDRESS_TYPE_OPTIONS } from "../../domain/constants/address.constants";

type AddressListScreenProps = {
  addresses: Address[];
  organizationSlug: string;
  query?: string;
};

export default function AddressListScreen({
  addresses,
  organizationSlug,
  query,
}: AddressListScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    router.push(`/org/${organizationSlug}/addresses?${params.toString()}`);
  }

  const inputStyle =
    "bg-muted/40 border-0 border-b-2 border-transparent rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:outline-none transition-colors duration-150 border-b-muted !focus:border-orange-500 bg-white p-2";

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <Input
          className={inputStyle}
          placeholder="Buscar dirección..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Direcciones encontradas: {addresses.length}
      </p>

      {/* List */}
      <ul className="flex flex-col gap-4">
        {addresses.map((address) => (
          <li key={address.id}>
            <Link
              href={`/org/${organizationSlug}/addresses/${address.id}`}
              className="block"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden flex flex-col">
                {/* Background Image */}
                {address.image && (
                  <Image
                    src={address.image}
                    alt={address.businessName ?? address.street}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={false}
                  />
                )}
                <div className=" bg-black/70 rounded-bl-xl p-2 absolute self-end ">
                  {ADDRESS_TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;

                    return (
                      address.type === type.value && (
                        <Icon
                          key={type.value}
                          className={type.color}
                          size={40}
                        />
                      )
                    );
                  })}
                </div>

                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end text-white">
                  <div className="bg-black/70 w-full px-4 py-2">
                    <p className="text-lg font-semibold leading-tight tracking-wider">
                      {address.businessName}
                    </p>

                    <p className="text-lg font-light  truncate ">
                      {address.street}, {address.number} |{" "}
                      {address.neighborhood} | {address.city}
                    </p>

                    {address.info && (
                      <p className="text-xs opacity-75 truncate mt-1">
                        {address.info}
                      </p>
                    )}
                    <p className="text-xs text-center tracking-wider lowercase">
                      <span
                        className={
                          address.active ? "text-blue-400" : "text-red-400"
                        }
                      >
                        {address.active ? "Activo" : "Inactivo"}
                      </span>{" "}
                      |{" "}
                      <span
                        className={
                          address.confirmed ? "text-blue-400" : "text-red-400"
                        }
                      >
                        {address.confirmed ? "Confirmado" : "No confirmado"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Hover enhancement (desktop only) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 hidden md:block" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Dentro de transportes / call center
