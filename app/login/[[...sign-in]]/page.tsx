import { SignIn } from "@clerk/nextjs";

export default async function SignInPage(props: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await props.searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <SignIn
        fallbackRedirectUrl={redirect_url || "/dashboard"}
        appearance={{
          elements: {
            card: "rounded-2xl border border-zinc-200 bg-white shadow-sm",
            headerTitle: "text-2xl font-bold text-black",
            headerSubtitle: "text-zinc-600",
            socialButtonsBlockButton:
              "rounded-xl border-zinc-200 h-12 text-base font-medium hover:bg-zinc-50 transition-colors",
            formButtonPrimary:
              "rounded-xl bg-black text-base font-medium h-12 hover:opacity-90 transition-all shadow-none",
            formFieldInput:
              "rounded-xl border-zinc-200 bg-zinc-50 h-11 px-4 text-base transition-colors focus:border-zinc-300 focus:bg-white focus:ring-0",
            formFieldLabel: "text-sm font-medium text-zinc-700",
            footerActionLink: "text-black font-medium hover:underline",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-500 text-sm",
            identityPreviewEditButton: "text-black",
            formFieldAction: "text-zinc-500 hover:text-black",
          },
        }}
      />
    </div>
  );
}
