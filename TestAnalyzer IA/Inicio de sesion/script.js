// const container = document.querySelector(".container");
// const btnSignIn = document.getElementById("btn-sign-in");
// const btnSignUp = document.getElementById("btn-sign-up");
// btnSignIn.addEventListener("click",()=>{
//     container.classList.remove("toggle");
// });
// btnSignUp.addEventListener("click",()=>{
//     container.classList.add("toggle");
// });


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1. CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://syzlqdmnfgnanqhfpplp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2h0Z6sydzh2qKuVPGydQWg_m7h6_HLw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// 2. ELEMENTOS DEL HTML
const container = document.querySelector('.container');

const btnSignIn = document.getElementById('btn-sign-in');
const btnSignUp = document.getElementById('btn-sign-up');

const formLogin = document.querySelector('form.inicio-sesion');
const formRegistro = document.querySelector('form.registro');

// 3. ALTERNAR ENTRE LOS FORMULARIOS
btnSignIn.addEventListener('click', () => {
    container.classList.remove('toggle');
});

btnSignUp.addEventListener('click', () => {
    container.classList.add('toggle');
});

// 4. REGISTRAR USUARIO
formRegistro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputs = formRegistro.querySelectorAll('input');

    const nombre = inputs[0].value.trim();
    const correo = inputs[1].value.trim();
    const contrasena = inputs[2].value;

    if (!nombre || !correo || !contrasena) {
        alert('Completa todos los campos.');
        return;
    }

    const boton = formRegistro.querySelector('.button');
    boton.disabled = true;
    boton.textContent = 'Registrando...';

    try {
        const { data, error } = await supabase.auth.signUp({
            email: correo,
            password: contrasena,
            options: {
                data: {
                    nombre: nombre
                },
                emailRedirectTo: window.location.origin +
                    window.location.pathname
            }
        });

        if (error) {
            throw error;
        }

        if (data.user && !data.session) {
            alert(
                'Tu registro fue recibido correctamente. ' +
                'Revisa tu correo y confirma tu cuenta antes de iniciar sesión.'
            );

            formRegistro.reset();
            container.classList.remove('toggle');

        } else if (data.user && data.session) {
            alert('Tu cuenta se creó correctamente.');

            formRegistro.reset();
            container.classList.remove('toggle');

            await redirigirPorRol(data.user.id);
        }

    } catch (error) {
        console.error('Error en el registro:', error);
        alert('No se pudo completar el registro: ' + error.message);

    } finally {
        boton.disabled = false;
        boton.textContent = 'REGISTRARSE';
    }
});

// 5. COMPROBAR ROL Y REDIRIGIR
async function redirigirPorRol(usuarioId) {

    const { data: permiso, error } = await supabase
        .from('roles_usuario')
        .select('rol')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

    if (error) {
        console.error('Error al consultar el rol:', error);
    }

    if (permiso?.rol === 'admin') {
        window.location.replace(
            '../Administrador/admin.html'
        );
    } else {
        window.location.replace(
            '../Pagina principal/Principal.html'
        );
    }
}

// 6. INICIAR SESIÓN
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputs = formLogin.querySelectorAll('input');

    const correo = inputs[0].value.trim();
    const contrasena = inputs[1].value;

    if (!correo || !contrasena) {
        alert('Ingresa tu correo y contraseña.');
        return;
    }

    const boton = formLogin.querySelector('.button');
    boton.disabled = true;
    boton.textContent = 'Verificando...';

    try {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: correo,
                password: contrasena
            });

        if (error) {
            throw error;
        }

        if (data.session && data.user) {

            // Verificar si es usuario o administrador
            await redirigirPorRol(data.user.id);

        } else {
            alert('No se pudo establecer la sesión.');
        }

    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        alert(
            'No se pudo iniciar sesión. Verifica tu correo, ' +
            'contraseña y que hayas confirmado tu cuenta.'
        );

    } finally {
        boton.disabled = false;
        boton.textContent = 'INICIAR SESIÓN';
    }
});

// 7. COMPROBAR SI YA EXISTE UNA SESIÓN
async function comprobarSesion() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error al comprobar la sesión:', error);
        return;
    }

    if (data.session) {

        console.log(
            'Sesión activa para:',
            data.session.user.email
        );

        // Verificar el rol de la sesión existente
        await redirigirPorRol(data.session.user.id);
    }
}

comprobarSesion();
