import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ActualizarUsuarioRequest {
  usuarioId: string;
  datos: {
    nombre?: string;
    apellido?: string;
    dni?: string;
    email?: string;
    contraseña?: string;
    rol?: string;
    moduloNovedades?: boolean;
    moduloTareas?: boolean;
    activo?: boolean;
    photoUrl?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verificar el JWT del usuario que realiza la petición
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Token de autorización requerido");
    }

    // Cliente con el JWT del usuario para verificar identidad
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: callerUser }, error: callerError } = await supabaseUser.auth.getUser();
    if (callerError || !callerUser) {
      throw new Error("Sesión inválida. Por favor, inicie sesión nuevamente.");
    }

    // Cliente con service role para operaciones administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { usuarioId, datos }: ActualizarUsuarioRequest = await req.json();

    if (!usuarioId || !datos) {
      throw new Error("usuarioId y datos son requeridos");
    }

    // Obtener el perfil del usuario que llama para verificar permisos
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("usuarios")
      .select("id, rol, activo")
      .eq("auth_id", callerUser.id)
      .single();

    if (profileError || !callerProfile || !callerProfile.activo) {
      throw new Error("Usuario no autorizado");
    }

    const isAdmin = callerProfile.rol === "administrador";
    const isOwnProfile = callerProfile.id === usuarioId;

    if (!isAdmin && !isOwnProfile) {
      throw new Error("No tienes permisos para modificar este usuario");
    }

    // Usuarios normales solo pueden actualizar su propio nombre, apellido y foto
    if (!isAdmin) {
      const camposProhibidos = ["email", "rol", "moduloNovedades", "moduloTareas", "activo", "dni", "contraseña"];
      for (const campo of camposProhibidos) {
        if (datos[campo as keyof typeof datos] !== undefined) {
          throw new Error("No tienes permisos para modificar este campo");
        }
      }
    }

    // Obtener datos actuales del usuario a modificar
    const { data: usuarioExistente, error: errorBusqueda } = await supabaseAdmin
      .from("usuarios")
      .select("auth_id, email")
      .eq("id", usuarioId)
      .single();

    if (errorBusqueda || !usuarioExistente) {
      throw new Error("Usuario no encontrado");
    }

    // Construir objeto de actualización para la tabla pública (sin contraseña)
    const updateData: Record<string, unknown> = {};
    if (datos.nombre !== undefined) updateData.nombre = datos.nombre;
    if (datos.apellido !== undefined) updateData.apellido = datos.apellido;
    if (datos.dni !== undefined) updateData.dni = datos.dni;
    if (datos.email !== undefined) updateData.email = datos.email;
    if (datos.rol !== undefined) updateData.rol = datos.rol;
    if (datos.moduloNovedades !== undefined) updateData.modulo_novedades = datos.moduloNovedades;
    if (datos.moduloTareas !== undefined) updateData.modulo_tareas = datos.moduloTareas;
    if (datos.activo !== undefined) updateData.activo = datos.activo;
    if (datos.photoUrl !== undefined) updateData.photo_url = datos.photoUrl || null;
    // La contraseña NO se guarda en la tabla pública de usuarios

    if (Object.keys(updateData).length > 0) {
      const { error: errorUpdate } = await supabaseAdmin
        .from("usuarios")
        .update(updateData)
        .eq("id", usuarioId);

      if (errorUpdate) throw errorUpdate;
    }

    // Actualizar email o contraseña en Supabase Auth (nunca en la tabla pública)
    if (usuarioExistente.auth_id && (datos.email || datos.contraseña)) {
      const authUpdateData: Record<string, string> = {};

      if (datos.email && datos.email !== usuarioExistente.email) {
        authUpdateData.email = datos.email;
      }
      if (datos.contraseña) {
        authUpdateData.password = datos.contraseña;
      }

      if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          usuarioExistente.auth_id,
          authUpdateData
        );

        if (authError) {
          if (authError.message.includes("already registered")) {
            throw new Error("Ya existe un usuario con ese correo electrónico");
          }
          throw new Error("Error al actualizar las credenciales: " + authError.message);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Usuario actualizado correctamente" }),
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
