"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Map, Users, Library, FlaskConical, Coffee, ClipboardList, LogOut, Menu, X, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { name: "Campus Map", icon: Map, href: "/" },
  { name: "The Quad", icon: Users, href: "/quad" },
  { name: "The Library", icon: Library, href: "/library" },
  { name: "The Lab", icon: FlaskConical, href: "/lab" },
  { name: "The Canteen", icon: Coffee, href: "/canteen" },
  { name: "Notice Board", icon: ClipboardList, href: "/notice-board" },
]

export function CampusSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/auth/sign-in")
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-black text-base shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              CW
            </motion.div>
            <h1 className="font-black text-lg tracking-tighter">CampusWorld</h1>
          </Link>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 p-0 rounded-xl bg-black/80 border border-white/10 hover:bg-black/90"
            size="icon"
          >
            {isOpen ? <X className="w-10 h-10" /> : <Menu className="w-10 h-10" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-72 glass-dark border-r flex flex-col z-50 transition-all duration-500 hover:bg-black/50",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="p-8 flex-1 flex flex-col">
        <Link href="/" className="flex items-center gap-4 mb-14 group cursor-pointer" onClick={() => setIsOpen(false)}>
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          >
            CW
          </motion.div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl tracking-tighter leading-none">CampusWorld</h1>
          </div>
        </Link>

        <nav className="space-y-1.5">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 100 }}
                  className={cn(
                    "relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group overflow-hidden",
                    isActive
                      ? "text-primary bg-white/[0.03]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.01]",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                    />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 z-10 transition-all duration-500",
                      isActive ? "scale-110" : "group-hover:scale-110",
                    )}
                  />
                  <span className="font-bold z-10 tracking-tight text-sm uppercase">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-8 border-t border-white/5">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 shrink-0 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate">{user.username || user.email || "User"}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Level {Math.floor((user.xp || 0) / 100)} • Student</span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive hover:bg-destructive/5 group transition-all"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </>
        ) : (
          <Link href="/auth/sign-in" onClick={() => setIsOpen(false)} className="block">
            <Button
              variant="default"
              className="w-full justify-start gap-4 bg-primary hover:bg-primary/80 text-white"
            >
              <UserCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">Sign In</span>
            </Button>
          </Link>
        )}
      </div>
      </aside>
    </>
  )
}
