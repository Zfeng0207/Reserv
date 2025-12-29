import { SignInForm } from "./form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-10">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}

