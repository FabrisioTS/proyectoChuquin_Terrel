export type TipoAlerta = 'success' | 'error' | 'info';

/** Muestra un modal de SweetAlert2 sin bloquear la página si falla la carga. */
export async function mostrarAlerta(
  icono: TipoAlerta,
  titulo: string,
  texto: string,
): Promise<void> {
  try {
    const { default: Swal } = await import('sweetalert2');
    await Swal.fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#c2410c',
    });
  } catch {
    // Si el modal no está disponible, la página sigue funcionando.
  }
}
