import { notFound } from "next/navigation";
import { UnidadForm } from "@/components/admin/UnidadForm";
import { SELECT_UNIDAD } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Unidad } from "@/lib/types";
import { UUID_RE } from "@/lib/utils";

export const metadata = { title: "Editar unidad" };

export default async function EditarUnidadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("unidades").select(SELECT_UNIDAD).eq("id", id).maybeSingle();
  if (!data) notFound();
  return <UnidadForm unidad={data as Unidad} />;
}
