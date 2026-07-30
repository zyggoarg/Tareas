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
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { usuarioId, datos }: ActualizarUsuarioRequest = await req.json();

    if (!usuarioId || !datos) {
      throw new Error("usuarioId y datos son requeridos");
    }

    const { data: usuarioExistente, error: errorBusqueda } = await supabaseAdmin
      .from("usuarios")
      .select("auth_id, email")
      .eq("id", usuarioId)
      .single();

    if (errorBusqueda || !usuarioExistente) {
      throw new Error("Usuario no encontrado");
    }

    const updateData: any = {};
    if (datos.nombre) updateData.nombre = datos.nombre;
    if (datos.apellido) updateData.apellido = datos.apellido;
    if (datos.dni) updateData.dni = datos.dni;
    if (datos.email) updateData.email = datos.email;
    if (datos.contraseña) updateData.contraseña = datos.contraseña;
    if (datos.rol) updateData.rol = datos.rol;
    if (datos.moduloNovedades !== undefined) updateData.modulo_novedades = datos.moduloNovedades;
    if (datos.moduloTareas !== undefined) updateData.modulo_tareas = datos.moduloTareas;
    if (datos.activo !== undefined) updateData.activo = datos.activo;
    if (datos.photoUrl !== undefined) updateData.photo_url = datos.photoUrl || null;

    const { error: errorUpdate } = await supabaseAdmin
      .from("usuarios")
      .update(updateData)
      .eq("id", usuarioId);

    if (errorUpdate) throw errorUpdate;

    if (usuarioExistente.auth_id && (datos.email || datos.contraseña)) {
      const authUpdateData: any = {};
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
          console.error("Error actualizando Supabase Auth:", authError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Usuario actualizado correctamente" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
