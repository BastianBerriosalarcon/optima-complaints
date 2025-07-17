"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import UserProfile from "../user-profile";
import { useAuth } from "@/hooks/useAuth";

export default function NavbarClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <nav className="w-full border-b border-gray-200 bg-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" prefetch className="flex items-center gap-3">
            <Image 
              src="/images/optimacx-logo.png" 
              alt="OptimaCX Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Óptima-CX</span>
          </Link>
          <div className="flex gap-4 items-center">
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-3">
          <Image 
            src="/images/optimacx-logo.png" 
            alt="OptimaCX Logo" 
            width={40} 
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold text-gray-900">Óptima-CX</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Button>Panel de Control</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}