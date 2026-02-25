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

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <Input
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
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
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

                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute top-[10%] left-[85%] bg-black/70 rounded-full p-2">
                  {ADDRESS_TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;

                    return (
                      address.type === type.value && (
                        // <div key={type.value} clas>

                        <Icon
                          key={type.value}
                          className={type.color}
                          size={40}
                        />
                        // </div>
                      )
                    );
                  })}
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end text-white">
                  <div className="bg-black/50 w-full p-4">
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
