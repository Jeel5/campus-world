"use client"

import { usePathname } from "next/navigation"
import { CampusSidebar } from "./campus-sidebar"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/auth")

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      {!isAuthPage && <CampusSidebar />}
      
      <main className={`flex-1 min-h-screen relative w-full overflow-x-hidden ${!isAuthPage ? "lg:ml-72" : ""}`}>
        {/* Background Grid Lines */}
        {!isAuthPage && <div className="absolute inset-0 grid-lines pointer-events-none z-0 opacity-20" />}

        <div className={`relative z-10 w-full mx-auto h-full ${!isAuthPage ? "max-w-[1400px] p-4 sm:p-6 lg:p-8 xl:p-16" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
