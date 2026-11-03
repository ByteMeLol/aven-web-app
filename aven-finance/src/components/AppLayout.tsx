
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX, FiUser } from "react-icons/fi";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-slate-800">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:hidden">
            <span className="text-sm font-semibold text-slate-800">
              Navigation
            </span>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <FiX size={21} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Sidebar onNavigate={closeSidebar} />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-emerald-700 lg:hidden"
            >
              <FiMenu size={21} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:text-xs">
                Personal finance
              </p>
              <h1 className="mt-1 truncate text-sm font-semibold text-slate-900 sm:text-base">
                Your financial space
              </h1>
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                My account
              </p>
              <p className="text-xs text-slate-500">Personal workspace</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800">
              <FiUser size={19} />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)]">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
