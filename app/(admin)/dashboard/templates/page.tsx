import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTemplatesForUser } from "@/app/(admin)/actions/templates";
import TemplatesClient from "./TemplatesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Templates",
};

const TemplatesPage = async () => {
  const result = await getTemplatesForUser();

  if ("error" in result) redirect("/login");

  return <TemplatesClient templates={result.templates} />;
};

export default TemplatesPage;
