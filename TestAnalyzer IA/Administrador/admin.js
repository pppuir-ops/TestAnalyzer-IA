
import { createClient } from
'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://syzlqdmnfgnanqhfpplp.supabase.co',
    'sb_publishable_2h0Z6sydzh2qKuVPGydQWg_m7h6_HLw'
);

const rutaLogin =
    '../Inicio de sesion/inicio.html';

async function verificarAdministrador() {

    try {
        const { data: { user }, error } =
            await supabase.auth.getUser();

        if (error || !user) {
            window.location.replace(rutaLogin);
            return;
        }

        const { data: permiso, error: errorRol } =
            await supabase
            .from('roles_usuario')
            .select('rol')
            .eq('usuario_id', user.id)
            .maybeSingle();

        if (errorRol) {
            console.error('No se pudo verificar el rol:', errorRol);
        }

        if (permiso?.rol !== 'admin') {
            alert('No tienes permisos de administrador');

            window.location.replace(
                '../Pagina principal/Principal.html'
            );

            return;
        }

        document.getElementById('bienvenida')
            .textContent = `Bienvenido, ${user.email}`;

        document.getElementById('panel-admin')
            .hidden = false;

    } catch (error) {
        console.error('No se pudo verificar el acceso:', error);
        alert('No se pudo verificar tu sesión. Intenta iniciar sesión de nuevo.');
        window.location.replace(rutaLogin);
    }
}

document.getElementById('cerrar-sesion')
    .addEventListener('click', async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('No se pudo cerrar sesión:', error);
            alert('No se pudo cerrar la sesión. Intenta de nuevo.');
            return;
        }

        window.location.replace(rutaLogin);

    });

verificarAdministrador();
