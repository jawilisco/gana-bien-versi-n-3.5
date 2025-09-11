
// /js/app.js

import { guardarData, cargarData, setItem, getItem, removeItem } from "./assets/js/storage.js";


let data = { fincas: [] };
let nivel_actual = "fincas";
let finca_seleccionada = null;
let lote_seleccionado = null;

// Inicialización
window.onload = async () => {
  data = await cargarData(); // ahora carga desde IndexedDB

  // 🔹 Si vienes desde animal.html con "volver"
  if (getItem("volver_a_animales") === "true") {
    const fincaNombre = getItem("finca_actual");
    const loteNombre = getItem("lote_actual");

    finca_seleccionada = data.fincas.find(f => f.nombre === fincaNombre) || null;
    if (finca_seleccionada) {
      lote_seleccionada = finca_seleccionada.lotes.find(l => l.nombre === loteNombre) || null;
      if (lote_seleccionada) {
        nivel_actual = "animales"; 
      }
    }

    removeItem("volver_a_animales");
  }

  render();

  // 🔹 Mostrar campo de anotaciones solo si se elige "Con anotaciones"
  document.querySelectorAll("input[name='salud']").forEach(radio => {
    radio.addEventListener("change", () => {
      const campo = document.getElementById("campo-anotaciones");
      if (radio.value === "Con anotaciones" && radio.checked) {
        campo.classList.remove("d-none");
      } else {
        campo.classList.add("d-none");
      }
    });
  });
};
;

// Guardar cambios
function guardar() {
    guardarData(data); // ✅ ahora en IndexedDB 
}


function render() {
    const titulo = document.getElementById("titulo");
    const btn_agregar = document.getElementById("btn-agregar");
    const btn_atras = document.getElementById("btn-atras");
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    if (nivel_actual === "fincas") {
        titulo.textContent = "Fincas";
        btn_agregar.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn_atras.disabled = true;
        data.fincas.forEach((finca, idx) => {
            const div = document.createElement("div");
            div.className = "mb-2"; // Solo margen inferior, sin fondo ni borde
            div.innerHTML = `
                <div class="d-flex align-items-center justify-content-between" style="background:none; border:none; box-shadow:none;">
                    <span style="flex:1;cursor:pointer;" onclick="abrirFinca(${idx})">${finca.nombre}</span>
                    <button class="btn btn-sm btn-warning me-1" onclick="renombrarFinca(${idx})" title="Renombrar"><i class="fa fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarFinca(${idx})" title="Eliminar"><i class="fa fa-trash"></i></button>
                </div>
            `;
            lista.appendChild(div);
        });
    } else if (nivel_actual === "lotes") {
        titulo.textContent = `Lotes en ${finca_seleccionada.nombre}`;
        btn_agregar.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn_atras.disabled = false;
        (finca_seleccionada.lotes || []).forEach((lote, idx) => {
            const div = document.createElement("div");
            div.className = "mb-2"; // Solo margen inferior, sin fondo ni borde
            div.innerHTML = `

                <div class="d-flex align-items-center justify-content-between" style="background:none; border:none; box-shadow:none;">
                    <span style="flex:1;cursor:pointer;" onclick="abrirLote(${idx})">${lote.nombre}</span>
                    <button class="btn btn-sm btn-warning me-1" onclick="renombrarLote(${idx})" title="Renombrar"><i class="fa fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarLote(${idx})" title="Eliminar"><i class="fa fa-trash"></i></button>
                </div>
            `;
            lista.appendChild(div);
        });
} else if (nivel_actual === "animales") {
    titulo.textContent = `Animales en ${lote_seleccionado.nombre}`;
    btn_agregar.innerHTML = '<i class="fa-solid fa-plus"></i>';
    btn_atras.disabled = false;
    (lote_seleccionado.animales || []).forEach(animal => {
        const div = document.createElement("div");
        div.className = "card mb-3";
        div.style.maxWidth = "540px";
        div.innerHTML = `
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${animal.foto || 'https://via.placeholder.com/150'}" class="img-fluid rounded-start" alt="Foto animal">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">ID:${animal.numero_id || ''}</h5>
                        <p class="card-text">
                            Sexo: ${animal.genero || ''} <br>Peso: ${animal.peso || ''} kg <br> Edad: ${animal.edad_aprox || ''} meses<br>
                            E.salud: ${animal.estado_salud || ''}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // 👉 Evento para abrir el detalle del animal
        div.addEventListener("click", () => {
             setItem("animal_seleccionado", JSON.stringify(animal));
            window.location.href = "animal.html"; // tu página de detalle
        });

        lista.appendChild(div);
    });
}
}

// Funciones para abrir finca/lote
function abrirFinca(idx) {
    finca_seleccionada = data.fincas[idx];
    nivel_actual = "lotes";
    render();
}
function abrirLote(idx) {
    lote_seleccionado = finca_seleccionada.lotes[idx];
    nivel_actual = "animales";
    render();
}

// Renombrar y eliminar fincas/lotes
function renombrarFinca(idx) {
    const nuevo = prompt("Nuevo nombre de la finca:", data.fincas[idx].nombre);
    if (nuevo && nuevo.trim()) {
        data.fincas[idx].nombre = nuevo.trim();
        guardar();
        render();
    }
}
function eliminarFinca(idx) {
    if (confirm("¿Eliminar esta finca? Se eliminarán todos sus lotes y animales.")) {
        data.fincas.splice(idx, 1);
        guardar();
        render();
    }
}
function renombrarLote(idx) {
    const nuevo = prompt("Nuevo nombre del lote:", finca_seleccionada.lotes[idx].nombre);
    if (nuevo && nuevo.trim()) {
        finca_seleccionada.lotes[idx].nombre = nuevo.trim();
        guardar();
        render();
    }
}
function eliminarLote(idx) {
    if (confirm("¿Eliminar este lote? Se eliminarán todos sus animales.")) {
        finca_seleccionada.lotes.splice(idx, 1);
        guardar();
        render();
    }
}

document.getElementById("btn-atras").onclick = () => {
    if (nivel_actual === "animales") {
        nivel_actual = "lotes";
        lote_seleccionado = null;
    } else if (nivel_actual === "lotes") {
        nivel_actual = "fincas";
        finca_seleccionada = null;
    }
    render();
};


const salud = document.querySelector("input[name='salud']:checked")?.value || "";
const anotaciones = document.getElementById("anotaciones").value.trim();

document.getElementById("btn-guardar-animal").onclick = () => {
    const id = document.getElementById("id").value.trim();
    const sexo = document.querySelector("input[name='sexo']:checked")?.value || "";
    const peso = document.getElementById("peso").value.trim();
    const partos = document.getElementById("partos").value.trim();
    const prenes = document.querySelector("input[name='prenes']:checked")?.value || "";
    const tprenes = document.getElementById("tprenes").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const salud = document.querySelector("input[name='salud']:checked")?.value || "";
    const anotaciones = document.getElementById("anotaciones").value.trim();
    const imgFile = document.getElementById("img").files[0];

    if (!id) {
        alert("El ID es obligatorio");
        return;
    }

    const nuevoAnimal = {
        numero_id: id,
        genero: sexo,
        peso,
        partos: partos || 0,
        prenes,
        tiempo_prenes: tprenes,
        edad_aprox: edad,
        estado_salud: salud,
        anotaciones_salud: salud === "Con anotaciones" ? anotaciones : "",
        foto: ""
    };

    if (imgFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            nuevoAnimal.foto = e.target.result;
            guardarAnimal(nuevoAnimal);
        };
        reader.readAsDataURL(imgFile);
    } else {
        guardarAnimal(nuevoAnimal);
    }
};

function guardarAnimal(animal) {
    lote_seleccionado.animales = lote_seleccionado.animales || [];
    lote_seleccionado.animales.push(animal);
    guardar();
    render();

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalAnimal"));
    modal.hide();

    // Limpiar formulario
    document.getElementById("formAnimal").reset();
}


document.getElementById("btn-buscar").onclick = () => {
    const texto = document.getElementById("buscar").value.toLowerCase();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    if (nivel_actual === "fincas") {
        data.fincas.filter(f => f.nombre.toLowerCase().includes(texto)).forEach(finca => {
            const div = document.createElement("div");
            div.className = "card mb-2";
            div.innerHTML = `<div class="card-body" style="cursor:pointer;">${finca.nombre}</div>`;
            div.onclick = () => {
                finca_seleccionada = finca;
                nivel_actual = "lotes";
                render();
            };
            lista.appendChild(div);
        });
    } else if (nivel_actual === "lotes") {
        (finca_seleccionada.lotes || []).filter(l => l.nombre.toLowerCase().includes(texto)).forEach(lote => {
            const div = document.createElement("div");
            div.className = "card mb-2";
            div.innerHTML = `<div class="card-body" style="cursor:pointer;">${lote.nombre}</div>`;
            div.onclick = () => {
                lote_seleccionado = lote;
                nivel_actual = "animales";
                render();
            };
            lista.appendChild(div);
        });
    } else if (nivel_actual === "animales") {
        (lote_seleccionado.animales || []).filter(a => (a.numero_id || "").toLowerCase().includes(texto)).forEach(animal => {
            const div = document.createElement("div");
            div.className = "card mb-2";
            div.innerHTML = `<div class="card-body" style="cursor:pointer;">ID: ${animal.numero_id || ""} | Raza: ${animal.raza || ""}</div>`;
            lista.appendChild(div);
            div.addEventListener("click", () => {
   setItem("animal_seleccionado", JSON.stringify(animal));
   setItem("finca_actual", finca_seleccionada.nombre); // 👈 guardamos finca
   setItem("lote_actual", lote_seleccionado.nombre);   // 👈 guardamos lote
  window.location.href = "animal.html";
});

        });
    }
};

document.getElementById("btn-agregar").onclick = () => {
    if (nivel_actual === "fincas") {
        const nombre = prompt("Nombre de la finca:");
        if (nombre) {
            data.fincas.push({ nombre, lotes: [] });
            guardar();
            render();
        }
    } else if (nivel_actual === "lotes") {
        const nombre = prompt("Nombre del lote:");
        if (nombre) {
            finca_seleccionada.lotes = finca_seleccionada.lotes || [];
            finca_seleccionada.lotes.push({ nombre, animales: [] });
            guardar();
            render();
        }
    } else if (nivel_actual === "animales") {
        // Mostrar modal en lugar de prompt
        const modal = new bootstrap.Modal(document.getElementById("modalAnimal"));
        modal.show();
    }
};



window.onload = () => {
  // 🔹 Si vienes desde animal.html con "volver"
if ( getItem("volver_a_animales") === "true") {
  const fincaNombre =  getItem("finca_actual");
  const loteNombre =  getItem("lote_actual");

    finca_seleccionada = data.fincas.find(f => f.nombre === fincaNombre) || null;
    if (finca_seleccionada) {
      lote_seleccionado = finca_seleccionada.lotes.find(l => l.nombre === loteNombre) || null;
      if (lote_seleccionado) {
        nivel_actual = "animales"; // 👈 Regresa directamente al nivel de animales
      }
    }

     removeItem("volver_a_animales");
  }

  render();

  // 🔹 Mostrar campo de anotaciones solo si se elige "Con anotaciones"
  document.querySelectorAll("input[name='salud']").forEach(radio => {
    radio.addEventListener("change", () => {
      const campo = document.getElementById("campo-anotaciones");
      if (radio.value === "Con anotaciones" && radio.checked) {
        campo.classList.remove("d-none");
      } else {
        campo.classList.add("d-none");
      }
    });
  });
};


