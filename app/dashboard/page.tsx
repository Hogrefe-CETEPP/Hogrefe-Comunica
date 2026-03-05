import NovoComunicadoPage from "@/components/NovoComunicadoPage";
import { getCurrentUser } from "@/lib/auth";

async function page() {
  const user = await getCurrentUser();
  return <NovoComunicadoPage />;
}

export default page;
