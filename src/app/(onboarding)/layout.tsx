export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vael Hospitality</h1>
          <p className="text-sm text-gray-500">Let&apos;s get you set up</p>
        </div>
        {children}
      </div>
    </div>
  );
}
