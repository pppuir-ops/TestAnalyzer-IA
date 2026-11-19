
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL =
    'https://syzlqdmnfgnanqhfpplp.supabase.co';

const SUPABASE_KEY =
    'sb_publishable_2h0Z6sydzh2qKuVPGydQWg_m7h6_HLw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos originales

const correoUsuario = document.getElementById('usuario-correo');
const bienvenida = document.getElementById('bienvenida');
const botonCerrar = document.getElementById('btn-cerrar-sesion');
const botonAnalizar = document.getElementById('btn-nuevo-analisis');

// NUEVO: Elementos relacionados con los permisos

const menuAdmin = document.getElementById('menu-admin');
const indicadorRol = document.getElementById('rol-usuario');
const avatar = document.querySelector('.avatar');

async function comprobarSesion() {

const { data, error } = await supabase.auth.getSession();

if (error || !data.session) {
    window.location.replace('../inicio de sesion/inicio.html');
    return;
}

const usuario = data.session.user;

    correoUsuario.textContent = usuario.email ?? '';

    // Recuperar el nombre de la tabla profiles

    const { data: perfil, error: errorPerfil } = await supabase
        .from('profiles')
        .select('nombre')
        .eq('id', usuario.id)
        .maybeSingle();

    if (errorPerfil) {
        console.error(
            'No se pudo consultar el perfil:',
            errorPerfil.message
        );
    }

    const nombre = perfil?.nombre?.trim();

    bienvenida.textContent = nombre
        ? `¡Bienvenido, ${nombre}!`
        : '¡Bienvenido a TestAnalyzer AI!';

    // NUEVO: Consultar los permisos del usuario

    await comprobarRol(usuario.id);
}

// NUEVO: Funcion para identificar al administrador

async function comprobarRol(usuarioId) {

    // Ocultar las opciones administrativas por defecto

    menuAdmin.hidden = true;
    indicadorRol.classList.remove('admin');
    avatar.classList.remove('admin');

    const { data: permiso, error: errorRol } = await supabase
        .from('roles_usuario')
        .select('rol')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

    if (errorRol || !permiso) {

        console.error(
            'No se pudo consultar el rol:',
            errorRol?.message ?? 'Usuario sin rol asignado'
        );

        indicadorRol.textContent = 'Rol no verificado';

        return;
    }

    console.log('Rol actual:', permiso.rol);

    // Administrador

    if (permiso.rol === 'admin') {

        menuAdmin.hidden = false;

        indicadorRol.textContent = 'Administrador';
        indicadorRol.classList.add('admin');

        avatar.classList.add('admin');
        avatar.textContent = 'AD';

    }

    // Usuario normal

    else if (permiso.rol === 'usuario') {

        menuAdmin.hidden = true;

        indicadorRol.textContent = 'Usuario normal';

        avatar.textContent = 'TA';

    }

    // Rol desconocido

    else {

        menuAdmin.hidden = true;

        indicadorRol.textContent = 'Rol desconocido';

    }
}

// Cerrar sesion

botonCerrar.addEventListener('click', async () => {

    botonCerrar.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {

        console.error(
            'No se pudo cerrar sesión:',
            error.message
        );

        alert('No se pudo cerrar la sesión. Intenta de nuevo.');

        botonCerrar.disabled = false;

        return;
    }

    window.location.replace('../Inicio de sesion/inicio.html');

});

// Boton de nuevo analisis

botonAnalizar.addEventListener('click', () => {

    alert('Aquí podrás implementar el módulo de análisis de pruebas.');

});

// Comprobar sesion al cargar la pagina

comprobarSesion();
