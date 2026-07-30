import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CrearUsuarioRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: "administrador" | "usuario";
  moduloNovedades?: boolean;
  moduloTareas?: boolean;
  activo?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verificar el JWT del administrador que realiza la petición
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Token de autorización requerido");
    }

    // Verificar identidad del usuario llamante
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: callerUser }, error: callerError } = await supabaseUser.auth.getUser();
    if (callerError || !callerUser) {
      throw new Error("Sesión inválida. Por favor, inicie sesión nuevamente.");
    }

    // Cliente admin para verificar rol y crear el usuario
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verificar que el usuario llamante es administrador
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("usuarios")
      .select("rol, activo")
      .eq("auth_id", callerUser.id)
      .single();

    if (profileError || !callerProfile || !callerProfile.activo) {
      throw new Error("Usuario no autorizado");
    }

    if (callerProfile.rol !== "administrador") {
      throw new Error("Solo los administradores pueden crear usuarios");
    }

    const {
      email,
      password,
      nombre,
      apellido,
      dni,
      rol,
      moduloNovedades = true,
      moduloTareas = true,
      activo = true,
    }: CrearUsuarioRequest = await req.json();

    if (!email || !password || !nombre || !apellido || !dni || !rol) {
      throw new Error("Todos los campos obligatorios deben completarse");
    }

    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Crear el usuario en Supabase Auth usando el admin API
    // Esto no modifica la sesión del administrador ni envía email de confirmación
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, apellido, dni, email },
    });

    if (createError) {
      if (
        createError.message.includes("already registered") ||
        createError.message.includes("already been registered")
      ) {
        throw new Error("Ya existe un usuario con ese correo electrónico");
      }
      throw new Error("Error al crear el acceso: " + createError.message);
    }

    // Crear el perfil en la tabla pública sin almacenar la contraseña
    const { data: profileData, error: profileCreateError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        nombre,
        apellido,
        dni,
        email,
        rol,
        modulo_novedades: moduloNovedades,
        modulo_tareas: moduloTareas,
        activo,
        auth_id: authData.user.id,
      })
      .select()
      .single();

    if (profileCreateError) {
      // Revertir: eliminar el usuario de auth si no se pudo crear el perfil
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      if (profileCreateError.code === "23505") {
        throw new Error("Ya existe un usuario con ese DNI o correo electrónico");
      }
      throw new Error("Error al crear el perfil: " + profileCreateError.message);
    }

    return new Response(
      JSON.stringify({ success: true, usuario: profileData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
