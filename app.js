const SUPABASE_URL = 'https://akxvtxkhutewdiptjkaa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qqRZT3WyL39RFP0jTDGtVA_Wu-V_mhl';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('form-prestamo');
const inputId = document.getElementById('prestamo-id');
const inputTitulo = document.getElementById('titulo_libro');
const inputCategoria = document.getElementById('categoria');
const inputAlumno = document.getElementById('alumno');
const inputFecha = document.getElementById('fecha_prestamo');
const inputDias = document.getElementById('dias_plazo');

const tituloForm = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const mensaje = document.getElementById('mensaje');
const tablaBody = document.getElementById('tabla-prestamos');
const filtroCategoria = document.getElementById('filtro-categoria');

let listaPrestamos = [];

async function cargarPrestamos() {
  const { data, error } = await db
    .from('prestamos_biblioteca')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    tablaBody.innerHTML = `<tr><td colspan="6" class="centrado">Error al cargar: ${error.message}</td></tr>`;
    return;
  }

  listaPrestamos = data || [];
  renderizarTabla();
}

function renderizarTabla() {
  const categoriaSeleccionada = filtroCategoria.value;
  const filtrados =
    categoriaSeleccionada === 'Todas'
      ? listaPrestamos
      : listaPrestamos.filter((item) => item.categoria === categoriaSeleccionada);

  if (filtrados.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="6" class="centrado">No hay préstamos registrados en esta categoría.</td></tr>`;
    return;
  }

  tablaBody.innerHTML = filtrados
    .map(
      (item) => `
      <tr>
        <td>${item.titulo_libro}</td>
        <td>${item.categoria}</td>
        <td>${item.alumno}</td>
        <td>${item.fecha_prestamo}</td>
        <td>${item.dias_plazo} días</td>
        <td>
          <button class="btn-editar" onclick="editarPrestamo(${item.id})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarPrestamo(${item.id})">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    titulo_libro: inputTitulo.value.trim(),
    categoria: inputCategoria.value,
    alumno: inputAlumno.value.trim(),
    fecha_prestamo: inputFecha.value,
    dias_plazo: parseInt(inputDias.value, 10)
  };

  const idActual = inputId.value;

  if (idActual) {
    const { error } = await db
      .from('prestamos_biblioteca')
      .update(datos)
      .eq('id', idActual);

    if (error) {
      mensaje.textContent = 'Error al actualizar: ' + error.message;
      return;
    }
    mensaje.textContent = 'Préstamo actualizado correctamente.';
  } else {
    const { error } = await db.from('prestamos_biblioteca').insert([datos]);

    if (error) {
      mensaje.textContent = 'Error al guardar: ' + error.message;
      return;
    }
    mensaje.textContent = 'Préstamo registrado correctamente.';
  }

  resetearFormulario();
  cargarPrestamos();
});

window.editarPrestamo = function (id) {
  const item = listaPrestamos.find((p) => p.id === id);
  if (!item) return;

  inputId.value = item.id;
  inputTitulo.value = item.titulo_libro;
  inputCategoria.value = item.categoria;
  inputAlumno.value = item.alumno;
  inputFecha.value = item.fecha_prestamo;
  inputDias.value = item.dias_plazo;

  tituloForm.textContent = 'Editar préstamo';
  btnGuardar.textContent = 'Actualizar préstamo';
  btnCancelar.classList.remove('oculto');
  mensaje.textContent = '';
};

window.eliminarPrestamo = async function (id) {
  const { error } = await db.from('prestamos_biblioteca').delete().eq('id', id);

  if (error) {
    mensaje.textContent = 'Error al eliminar: ' + error.message;
    return;
  }

  mensaje.textContent = 'Préstamo eliminado.';
  cargarPrestamos();
};

function resetearFormulario() {
  form.reset();
  inputId.value = '';
  tituloForm.textContent = 'Registrar nuevo préstamo';
  btnGuardar.textContent = 'Guardar préstamo';
  btnCancelar.classList.add('oculto');
}

btnCancelar.addEventListener('click', () => {
  resetearFormulario();
  mensaje.textContent = '';
});

filtroCategoria.addEventListener('change', renderizarTabla);

cargarPrestamos();