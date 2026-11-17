"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bootstrapTenantForUser } from "@/lib/tenant/bootstrap";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Credenciales inválidas" };
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();

  if (!email || !password || !fullName || !organizationName || !businessName) {
    return { error: "Completa todos los campos" };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const authUserId = data.user?.id;
  if (!authUserId) {
    return {
      error: "No se pudo crear el usuario. Revisa la configuración de Auth.",
    };
  }

  try {
    // Service-role bootstrap works even when email confirmation delays the session.
    await bootstrapTenantForUser({
      authUserId,
      email,
      fullName,
      organizationName,
      businessName,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al crear organización/negocio";
    return { error: message };
  }

  if (!data.session) {
    return {
      success:
        "Cuenta creada. Confirma tu email y luego inicia sesión para entrar al CRM.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
