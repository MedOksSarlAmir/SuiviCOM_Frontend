"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore"; // Ensure this matches your path
import { useRouter } from "next/navigation";
import api from "@/services/api"; // Changed to @/lib/api based on our earlier setup
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudCog, Loader2, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await api.post("/auth/login", { email, password });

      // Store in Zustand + Cookies (Handled by store/authStore.ts)
      setAuth(res.data.user, res.data.token, true);

      // All roles now go to the single entry point: /superviseur
      router.push("/superviseur");
      router.refresh(); // Forces Next.js to re-evaluate the proxy/auth state
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message ||
          "Identifiants invalides ou erreur serveur",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 px-4">
      <div className="absolute top-10 flex items-center gap-2">
        <Image
          src="/logo.png"
          width={150}
          height={150}
          alt="Picture of the author"
        />
      </div>

      <Card className="w-full max-w-md shadow-xl border-zinc-200">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8 pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
            SuiviCom
          </CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder au suivi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs font-medium text-red-600 bg-red-50 rounded-md border border-red-100 italic">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700">
                Utilisateur ou Email
              </Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Ex: superviseur_oran"
                required
                className="bg-zinc-50 border-zinc-200 focus-visible:ring-amir-blue-hover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-zinc-50 border-zinc-200 focus-visible:ring-amir-blue-hover"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amir-blue hover:bg-amir-blue-hover text-white font-semibold transition-all h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authentification...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="absolute bottom-10 text-zinc-400 text-xs">
        © 2026 Sarl AMIR 2000. Tous droits réservés.
      </p>
    </div>
  );
}
