import MudarSenhaPage from "@/components/MudarSenhaPage";
import { getCurrentUser } from "@/lib/auth";

async function page() {
  const user = await getCurrentUser();
  return <MudarSenhaPage />;
}

export default page;
