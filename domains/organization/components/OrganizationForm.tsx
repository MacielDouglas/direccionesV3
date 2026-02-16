"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createOrganizationAction } from "@/server/organization/organization.actions";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
});

function createSlug(text: string) {
  return text
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // remove símbolos
    .replace(/\s+/g, "_"); // troca espaços por _
}

export default function OrganizationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  const slug = useMemo(() => createSlug(nameValue), [nameValue]);

  useEffect(() => {
    form.setValue("slug", slug);
  }, [slug, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createOrganizationAction(values);

      toast.success("Organização Criada!");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar organização",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 md:flex items-center gap-3 w-full bg-slate-200 p-5 rounded-xl"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da organização</FormLabel>
              <FormControl>
                <Input placeholder="Nova Organização" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (gerado automaticamente)</FormLabel>
              <FormControl>
                <Input disabled placeholder="slug_gerado" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Criar organização"
          )}
        </Button>
      </form>
    </Form>
  );
}
