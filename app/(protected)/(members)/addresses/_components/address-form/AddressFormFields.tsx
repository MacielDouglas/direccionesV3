"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ADDRESS_FORMS_OPTIONS } from "@/features/addresses/constants/address.constants";
import { AddressFormData } from "@/features/addresses/schemas/address.schema";
import { MapPinPen } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function AddressFormFields() {
  const { control, watch } = useFormContext<AddressFormData>();

  const addressType = watch("addressType");

  const inputStyle =
    "bg-muted/40 border-0 border-b-2 border-transparent rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:outline-none transition-colors duration-150 border-b-muted !focus:border-orange-500";

  return (
    <section className="space-y-4  py-5">
      <header className="inline-flex gap-1">
        <MapPinPen className="text-orange-500 w-8 h-8" />
        <h2 className="text-lg font-semibold">
          - Información principal del lugar
        </h2>
      </header>

      <div className="space-y-6">
        {ADDRESS_FORMS_OPTIONS.map((item, index) => {
          /**
           * esconder businessName quando for casa
           */
          if (
            item.kind === "text" &&
            item.name === "businessName" &&
            addressType === "House"
          ) {
            return null;
          }

          /**
           * GROUP
           */
          if (item.kind === "group") {
            const hasSwitch =
              item.fields?.some((field) => field.kind === "switch") ?? false;

            // GROUP DE SWITCHES
            if (hasSwitch) {
              return (
                <div
                  key={index}
                  className="space-y-3 flex items-center justify-between gap-5"
                >
                  {item.fields?.map((sub) => (
                    <FormField
                      key={sub.name}
                      control={control}
                      name={sub.name as keyof AddressFormData}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>{sub.label}</FormLabel>
                          <FormControl>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              );
            }

            // GROUP DE INPUTS
            return (
              <div className="flex gap-3" key={index}>
                {item.fields?.map((sub) => (
                  <FormField
                    key={sub.name}
                    control={control}
                    name={sub.name as keyof AddressFormData}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{sub.label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={String(field.value ?? "")}
                            className={inputStyle}
                            placeholder={sub.placeholder}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            );
          }

          /**
           * TEXTAREA
           */
          if (item.name === "info") {
            return (
              <FormField
                key={item.name}
                control={control}
                name={item.name}
                render={({ field }) => {
                  const length = String(field.value ?? "").length;
                  const max = 300;
                  const warning = max - length <= 20;

                  return (
                    <FormItem>
                      <FormLabel>{item.label}</FormLabel>

                      <FormControl>
                        <textarea
                          {...field}
                          placeholder={item.placeholder}
                          maxLength={max}
                          rows={3}
                          className={`${inputStyle} w-full min-h-21 resize-y focus:border-orange-500`}
                        />
                      </FormControl>

                      <div className="flex justify-end text-xs mt-1">
                        <span
                          className={
                            length >= max
                              ? "text-destructive"
                              : warning
                                ? "text-yellow-500"
                                : "text-muted-foreground"
                          }
                        >
                          {length}/{max}
                        </span>
                      </div>
                    </FormItem>
                  );
                }}
              />
            );
          }

          /**
           * DEFAULT INPUT
           */
          return (
            <FormField
              key={item.name}
              control={control}
              name={item.name as keyof AddressFormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{item.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={String(field.value ?? "")}
                      placeholder={item.placeholder}
                      className={inputStyle}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
