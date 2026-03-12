"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MapPinPen } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { AddressFormData } from "../../domain/address.schema";
import { ADDRESS_FORMS_OPTIONS } from "../config/address-form.config";

const inputStyle =
  "border-0 border-b-2 border-b-muted rounded-none px-0 shadow-none bg-transparent " +
  "focus-visible:ring-0 focus-visible:outline-none focus-visible:border-b-brand " +
  "transition-colors duration-150 bg-white pl-2";

export default function AddressFormFields() {
  const { control, watch } = useFormContext<AddressFormData>();
  const addressType = watch("addressType");

  return (
    <section className="space-y-4 py-5">
      <header>
        <h2 className="inline-flex items-baseline gap-1 text-xl font-semibold">
          <MapPinPen className="h-7 w-7 text-brand" aria-hidden="true" />
          Información de la dirección
        </h2>
        <p className="text-sm text-muted-foreground">
          Por favor enviar información como: calle, número de casa, ciudad,
          barrio, información adicional, etc.
        </p>
      </header>

      <div className="space-y-6">
        {ADDRESS_FORMS_OPTIONS.map((item, index) => {
          if (
            item.kind === "text" &&
            item.name === "businessName" &&
            addressType === "House"
          ) {
            return null;
          }

          if (item.kind === "group") {
            const hasSwitch =
              item.fields?.some((f) => f.kind === "switch") ?? false;

            if (hasSwitch) {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-5"
                >
                  {item.fields?.map((sub) => (
                    <FormField
                      key={sub.name}
                      control={control}
                      name={sub.name as keyof AddressFormData}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            );
          }

          if (item.name === "info") {
            return (
              <FormField
                key={item.name}
                control={control}
                name="info"
                render={({ field }) => {
                  const length = String(field.value ?? "").length;
                  const max = 300;
                  const warning = max - length <= 20;

                  return (
                    <FormItem>
                      <FormLabel>{item.label}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={item.placeholder}
                          maxLength={max}
                          rows={4}
                          className={inputStyle}
                        />
                      </FormControl>
                      <div className="mt-1 flex justify-end text-xs">
                        <span
                          className={
                            length >= max
                              ? "text-destructive"
                              : warning
                                ? "text-yellow-500"
                                : "text-muted-foreground"
                          }
                          aria-live="polite"
                        >
                          {length}/{max}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            );
          }

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
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
