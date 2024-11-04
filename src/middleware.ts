import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Récupération de la session de l'utilisateur
  const session = await auth();

  const { pathname } = new URL(req.url);

  // Vérification de l'état de la session
  if (pathname === "/login" && session) {
    // Rediriger vers le tableau de bord si l'utilisateur est authentifié
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  } else if (!session && pathname !== "/login") {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié et n'est pas déjà sur /login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est authentifié ou déjà sur /login, continuer la requête normalement
  return NextResponse.next();
}

// Configuration des routes protégées
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login"], // Routes à protéger
};
