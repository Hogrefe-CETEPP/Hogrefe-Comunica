import EditarComunicadosPage from "@/components/EditarComunicadosPage";
import { getCurrentUser } from "@/lib/auth";

async function page() {
  const user = await getCurrentUser();
  return <EditarComunicadosPage />;
}

export default page;
