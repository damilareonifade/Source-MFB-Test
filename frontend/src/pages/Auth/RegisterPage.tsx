import RegisterSidebar from './RegisterSidebar';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-[#F0F4F8] border-r border-[#E2E8F0]">
        <RegisterSidebar />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-12 overflow-y-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
