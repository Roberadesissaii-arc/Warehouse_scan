import { Suspense } from "react";
import { SignInFallback, SignInForm } from "@/components/sign-in";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
