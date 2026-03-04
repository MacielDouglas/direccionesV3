"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  createOrganizationAction,
  setActiveOrg,
} from "@/server/organization/organization.actions";
import { createOrganizationSchema } from "@/domains/organization/schemas/organization.schema";
import type { z } from "zod";

type FormValues = z.infer<typeof createOrganizationSchema>;

function createSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}

export default function OrganizationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = useWatch({ control: form.control, name: "name" });
  const slug = useMemo(() => createSlug(nameValue), [nameValue]);

  useEffect(() => {
    form.setValue("slug", slug, { shouldValidate: true });
  }, [slug, form]);

  async function onSubmit(values: FormValues) {
    try {
      const newOrg = await createOrganizationAction(values);
      toast.success("¡Organización creada correctamente!");
      if (newOrg?.id) {
        await setActiveOrg(newOrg.id);
      }
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear la organización.",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4 rounded-xl bg-muted p-5 md:flex md:items-end md:gap-3 md:space-y-0"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Nombre de la organización</FormLabel>
              <FormControl>
                <Input placeholder="Nueva Organización" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Slug (generado automáticamente)</FormLabel>
              <FormControl>
                <Input disabled placeholder="slug_generado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
          className="w-full md:w-auto"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Creando…</span>
            </>
          ) : (
            "Crear organización"
          )}
        </Button>
      </form>
    </Form>
  );
}
