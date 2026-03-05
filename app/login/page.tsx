import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://hogrefe-digital.com.br/assets/media/bg/bg-3.jpg')",
      }}
    >
      <img className="fixed min-h-screen z-50 " src="/barra2.png" alt="barra" />
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
