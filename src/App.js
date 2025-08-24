import React from 'react';

// ============================================
// COMPONENTE DE HERRAMIENTA DE INCIDENTES
// ============================================
const HerramientaIncidentes = () => {
  const [showForm, setShowForm] = React.useState(true);
  const [jsPDFLoaded, setJsPDFLoaded] = React.useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = React.useState(false);
  
  React.useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => setJsPDFLoaded(true);
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script2.onload = () => setHtml2canvasLoaded(true);
    document.head.appendChild(script2);
    
    return () => {
      if (document.head.contains(script1)) document.head.removeChild(script1);
      if (document.head.contains(script2)) document.head.removeChild(script2);
    };
  }, []);

  const [formData, setFormData] = React.useState({
    estado: 'En Revision',
    prioridad: 'P2',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    descripcion: '',
    situacionActual: '',
    serviciosAfectados: '',
    accionesRecuperacion: '',
    causaRaiz: '',
    solucionDefinitiva: '',
    responsable: '',
    fechaEjecucion: '',
    horaEjecucion: '',
    empresa: 'Diners Club'
  });

  const [calculadora, setCalculadora] = React.useState({
    mostrar: false,
    afectacion: 0,
    impactoUsuarios: 1,
    urgencia: 2,
    horario: 2
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePrioridad = (field, value) => {
    const newCalc = { ...calculadora, [field]: value };
    setCalculadora(newCalc);
    
    const puntaje = newCalc.afectacion + newCalc.impactoUsuarios + newCalc.urgencia + newCalc.horario;
    let prioridad = 'P4';
    if (puntaje >= 12) prioridad = 'P1';
    else if (puntaje >= 10) prioridad = 'P2';
    else if (puntaje >= 5) prioridad = 'P3';
    
    handleChange('prioridad', prioridad);
  };

  const calcularDuracion = () => {
    if (!formData.fechaInicio || !formData.fechaFin || !formData.horaInicio || !formData.horaFin) return '';
    
    try {
      const inicio = new Date(formData.fechaInicio + 'T' + formData.horaInicio);
      const fin = new Date(formData.fechaFin + 'T' + formData.horaFin);
      const diff = fin - inicio;
      
      if (diff <= 0) return '';
      
      const totalSegundos = Math.floor(diff / 1000);
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;
      
      return String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    } catch {
      return '';
    }
  };

  const limpiar = () => {
    setFormData({
      estado: 'En Revision',
      prioridad: 'P2',
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '',
      horaFin: '',
      descripcion: '',
      situacionActual: '',
      serviciosAfectados: '',
      accionesRecuperacion: '',
      causaRaiz: '',
      solucionDefinitiva: '',
      responsable: '',
      fechaEjecucion: '',
      horaEjecucion: '',
      empresa: 'Diners Club'
    });
    setCalculadora({ mostrar: false, afectacion: 0, impactoUsuarios: 1, urgencia: 2, horario: 2 });
  };

  const exportarPDF = async () => {
    if (!jsPDFLoaded || !html2canvasLoaded || !window.jspdf || !window.html2canvas) {
      alert('⏳ Por favor espera mientras se cargan los recursos necesarios...');
      return;
    }
    
    try {
      const elemento = document.querySelector('[data-communication="preview"]');
      if (!elemento) {
        alert('No se pudo encontrar el comunicado');
        return;
      }

      const canvas = await window.html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#f0f4f8',
        logging: false
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = 10;
      const yPosition = 10;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xPosition,
        yPosition,
        imgWidth,
        imgHeight
      );

      const filename = `comunicado_${formData.estado.replace(' ', '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(filename);
      
      alert('✅ PDF descargado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar el PDF. Intenta de nuevo.');
    }
  };

  const renderVistaPrevia = () => {
    switch (formData.estado) {
      case 'En Revision':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Situación actual:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.situacionActual || 'Detallar el estado en donde se encuentra la revisión (Relevante).'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Servicios afectados:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.serviciosAfectados || 'Se detalla los servicios que se encuentran impactados.'}
              </span>
            </div>
          </>
        );

      case 'Recuperado':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Fin: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaFin}, {formData.horaFin}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Duración: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{calcularDuracion() || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Acciones de recuperación:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333', whiteSpace: 'pre-wrap' }}>
                {formData.accionesRecuperacion || 'Detallar la acción que permitió la recuperación del servicio.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Servicios afectados:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.serviciosAfectados || 'Se detalla los servicios que se encuentran impactados.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Causa raíz preliminar:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.causaRaiz || 'Detallar el motivo de la afectación al servicio.'}
              </span>
            </div>
          </>
        );

      case 'Detalle Incidentes':
        return (
          <>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Inicio: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaInicio}, {formData.horaInicio}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Fin: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{formData.fechaFin}, {formData.horaFin}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366', marginLeft: '20px' }}>Duración: </span>
              <span style={{ fontSize: '16px', color: '#333' }}>{calcularDuracion() || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Causa raíz:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                {formData.causaRaiz || 'Origen de la afectación al servicio.'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Solución definitiva:</span>
              <br />
              <span style={{ fontSize: '16px', color: '#333' }}>
                <strong>1.</strong> {formData.solucionDefinitiva || 'Detallar la acción ejecutada para su solución.'}
              </span>
              <br />
              <span style={{ fontSize: '16px', color: '#333', marginTop: '10px', display: 'block' }}>
                <strong>Responsable:</strong> {formData.responsable || 'Nombre área interna / externa.'}
              </span>
              <span style={{ fontSize: '16px', color: '#333', marginTop: '5px', display: 'block' }}>
                <strong>Ejecutado:</strong> {formData.fechaEjecucion || 'dd/mm/aaaa'}, {formData.horaEjecucion || 'hh:mm'}
              </span>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (showForm) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2c4b73 30%, #3d5a7a 70%, #4a6b85 100%)',
          color: 'white',
          padding: '20px 30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '600' }}>
            Crear Comunicado de Incidente
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Sistema de gestión y notificación técnica
          </p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="En Revision">En Revision</option>
                <option value="Recuperado">Recuperado</option>
                <option value="Detalle Incidentes">Detalle Incidentes</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Prioridad</label>
                {formData.estado !== 'Detalle Incidentes' && (
                  <button
                    type="button"
                    onClick={() => setCalculadora(prev => ({ ...prev, mostrar: !prev.mostrar }))}
                    style={{ fontSize: '12px', color: '#0066B2', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {calculadora.mostrar ? 'Ocultar calculadora' : 'Calcular prioridad'}
                  </button>
                )}
              </div>
              <select
                value={formData.prioridad}
                onChange={(e) => handleChange('prioridad', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empresa</label>
              <select
                value={formData.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Diners Club">Diners Club</option>
                <option value="Interdin">Interdin</option>
              </select>
            </div>
          </div>

          {calculadora.mostrar && formData.estado !== 'Detalle Incidentes' && (
            <div style={{ border: '1px solid #b3d1ff', backgroundColor: '#e6f0ff', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#0066B2', textAlign: 'center' }}>
                Calculadora de Prioridad - Puntaje: {calculadora.afectacion + calculadora.impactoUsuarios + calculadora.urgencia + calculadora.horario} - Prioridad: {formData.prioridad}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Afectación
                  </h4>
                  {[
                    { label: 'Indisponibilidad Total (3)', value: 3 },
                    { label: 'Indisponibilidad Parcial (2)', value: 2 },
                    { label: 'Delay (1)', value: 1 },
                    { label: 'Ninguna (0)', value: 0 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="afectacion"
                        checked={calculadora.afectacion === opcion.value}
                        onChange={() => updatePrioridad('afectacion', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Impacto
                  </h4>
                  {[
                    { label: 'Masivo (3)', value: 3 },
                    { label: 'Múltiple (2)', value: 2 },
                    { label: 'Puntual (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="impactoUsuarios"
                        checked={calculadora.impactoUsuarios === opcion.value}
                        onChange={() => updatePrioridad('impactoUsuarios', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Urgencia
                  </h4>
                  {[
                    { label: 'Crítica (4)', value: 4 },
                    { label: 'Alta (3)', value: 3 },
                    { label: 'Media (2)', value: 2 },
                    { label: 'Baja (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="urgencia"
                        checked={calculadora.urgencia === opcion.value}
                        onChange={() => updatePrioridad('urgencia', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '12px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #b3d1ff', padding: '10px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#0066B2', marginBottom: '10px', textAlign: 'center', fontSize: '14px' }}>
                    Horario
                  </h4>
                  {[
                    { label: 'Alta Carga TX 08h00-23h00 (2)', value: 2 },
                    { label: 'Baja Carga TX 23h00-08h00 (1)', value: 1 }
                  ].map((opcion, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name="horario"
                        checked={calculadora.horario === opcion.value}
                        onChange={() => updatePrioridad('horario', opcion.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <label style={{ fontSize: '11px' }}>{opcion.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder={formData.estado === 'Detalle Incidentes' ? 'TÍTULO COMPONENTE AFECTADO' : 'DESCRIPCIÓN BREVE DEL INCIDENTE'}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {formData.estado !== 'Detalle Incidentes' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Fin</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => handleChange('fechaFin', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Inicio</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaInicio}
                    onChange={(e) => handleChange('horaInicio', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Hora ecuatoriana (GMT-5) - Incluye segundos</span>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Fin</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaFin}
                    onChange={(e) => handleChange('horaFin', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Hora ecuatoriana (GMT-5) - Incluye segundos</span>
                </div>
              </div>

              {formData.fechaInicio && formData.fechaFin && formData.horaInicio && formData.horaFin && (
                <div style={{ backgroundColor: '#e6f0ff', border: '1px solid #b3d1ff', padding: '10px', borderRadius: '4px', marginBottom: '15px', color: '#0066B2' }}>
                  <strong>Duración: {calcularDuracion()}</strong>
                  {formData.fechaInicio !== formData.fechaFin && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Incidente de múltiples días: {formData.fechaInicio} al {formData.fechaFin}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {formData.estado === 'En Revision' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Situación actual</label>
                <textarea
                  value={formData.situacionActual}
                  onChange={(e) => handleChange('situacionActual', e.target.value)}
                  placeholder="Detallar el estado en donde se encuentra la revisión (Relevante)."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicios afectados</label>
                <textarea
                  value={formData.serviciosAfectados}
                  onChange={(e) => handleChange('serviciosAfectados', e.target.value)}
                  placeholder="Se detalla los servicios que se encuentran impactados."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}

          {formData.estado === 'Recuperado' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Acciones de recuperación</label>
                <textarea
                  value={formData.accionesRecuperacion}
                  onChange={(e) => handleChange('accionesRecuperacion', e.target.value)}
                  placeholder="Detallar la acción que permitió la recuperación del servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicios afectados</label>
                <textarea
                  value={formData.serviciosAfectados}
                  onChange={(e) => handleChange('serviciosAfectados', e.target.value)}
                  placeholder="Se detalla los servicios que se encuentran impactados."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Causa raíz preliminar</label>
                <textarea
                  value={formData.causaRaiz}
                  onChange={(e) => handleChange('causaRaiz', e.target.value)}
                  placeholder="Detallar el motivo de la afectación al servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}

          {formData.estado === 'Detalle Incidentes' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Causa raíz</label>
                <textarea
                  value={formData.causaRaiz}
                  onChange={(e) => handleChange('causaRaiz', e.target.value)}
                  placeholder="Origen de la afectación al servicio."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Solución definitiva</label>
                <textarea
                  value={formData.solucionDefinitiva}
                  onChange={(e) => handleChange('solucionDefinitiva', e.target.value)}
                  placeholder="Detallar la acción ejecutada para su solución."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Responsable</label>
                <input
                  value={formData.responsable}
                  onChange={(e) => handleChange('responsable', e.target.value)}
                  placeholder="Nombre área interna / externa."
                  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de ejecución</label>
                  <input
                    type="date"
                    value={formData.fechaEjecucion}
                    onChange={(e) => handleChange('fechaEjecucion', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora de ejecución</label>
                  <input
                    type="time"
                    step="1"
                    value={formData.horaEjecucion}
                    onChange={(e) => handleChange('horaEjecucion', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>Incluye segundos para mayor precisión</span>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: '12px 20px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Vista Previa del Comunicado
            </button>
            <button
              onClick={limpiar}
              style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
            >
              Limpiar Campos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#f0f4f8', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} data-communication="preview">
        <div style={{ backgroundColor: '#0066cc', color: 'white', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', letterSpacing: '1px', fontFamily: 'Arial, sans-serif' }}>
            GESTIÓN DE INCIDENTES
          </h1>
          
          {/* Logo según empresa seleccionada */}
          {formData.empresa === 'Diners Club' ? (
            // Logo Diners
            <div style={{
              width: '50px',
              height: '40px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '50px',
                height: '38px',
                position: 'relative',
                borderRadius: '19px',
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '2px solid white'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '50%',
                  height: '100%',
                  backgroundColor: '#4db8db'
                }}></div>
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  width: '50%',
                  height: '100%',
                  backgroundColor: '#004976'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '80%',
                  backgroundColor: 'white',
                  borderRadius: '5px'
                }}></div>
              </div>
            </div>
          ) : (
            // Logo Interdin
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              height: '35px',
              border: '2px solid white',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <div style={{ 
                backgroundColor: '#1b3a5e',
                color: '#ffffff',
                padding: '0 10px',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif',
                  letterSpacing: '1.5px'
                }}>
                  INTER
                </span>
              </div>
              <div style={{ 
                backgroundColor: '#e60000',
                color: '#ffffff',
                padding: '0 10px',
                height: '100%',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif',
                  letterSpacing: '1.5px'
                }}>
                  DIN
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '30px 40px', position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: '30px', right: '40px', display: 'flex', gap: '15px', zIndex: 10, alignItems: 'center' }}>
            {formData.estado !== 'Detalle Incidentes' && (
              <div style={{
                backgroundColor: '#f0f4f8',
                color: formData.estado === 'Recuperado' ? '#28a745' : formData.estado === 'En Revision' ? '#ff6b35' : '#333',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '15px',
                fontWeight: '600',
                border: `2px solid ${formData.estado === 'Recuperado' ? '#28a745' : formData.estado === 'En Revision' ? '#ff6b35' : '#e0e0e0'}`,
                display: 'inline-block',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '15px', verticalAlign: 'middle', lineHeight: '1' }}>●</span>
                <span style={{ marginLeft: '8px', verticalAlign: 'middle', fontSize: '15px', lineHeight: '1' }}>{formData.estado}</span>
              </div>
            )}

            <div style={{
              backgroundColor: '#f0f4f8',
              color: '#0066cc',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '15px',
              fontWeight: '600',
              border: '2px solid #0066cc',
              display: 'inline-block',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1',
              whiteSpace: 'nowrap'
            }}>
              Prioridad: {formData.prioridad}
            </div>
          </div>

          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            flex: 1,
            paddingTop: '10px'
          }}>
            <div style={{ marginBottom: '20px', paddingRight: '300px', wordWrap: 'break-word', lineHeight: '1.4' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#003366' }}>Descripción: </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                {formData.descripcion || (formData.estado === 'Detalle Incidentes' ? 'TÍTULO COMPONENTE AFECTADO' : 'DESCRIPCIÓN BREVE DEL INCIDENTE')}
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              {renderVistaPrevia()}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#0066cc',
          color: 'white',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <strong>Email:</strong> monitoreot@dinersclub.com.ec
            </p>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '1px' }}>
            PRODUCCIÓN Y SERVICIOS
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '40px auto 0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
          >
            Volver al Editor
          </button>
          <button
            onClick={exportarPDF}
            style={{ padding: '12px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE GENERADOR DE COMUNICADOS (COMPLETO)
// ============================================
// ============================================
// COMPONENTE GENERADOR DE COMUNICADOS (COMPLETO)
// ============================================
const GeneradorComunicados = () => {
  const [formData, setFormData] = React.useState({
    empresa: 'INTERDIN S.A.',
    actividad: '',
    fechaInicioDate: '',
    horaInicio: '',
    fechaFinDate: '',
    horaFin: '',
    servicioAfectado: '',
    periodoAfectacion: ''
  });
  const [mostrarVista, setMostrarVista] = React.useState(false);
  const [jsPDFLoaded, setJsPDFLoaded] = React.useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = React.useState(false);
  const [idioma, setIdioma] = React.useState('es');
  const [traduciendo, setTraduciendo] = React.useState(false);
  const [textoTraducido, setTextoTraducido] = React.useState(null);

  React.useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => setJsPDFLoaded(true);
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script2.onload = () => setHtml2canvasLoaded(true);
    document.head.appendChild(script2);
    
    return () => {
      if (document.head.contains(script1)) document.head.removeChild(script1);
      if (document.head.contains(script2)) document.head.removeChild(script2);
    };
  }, []);

  const exportarPDF = async () => {
    if (!jsPDFLoaded || !html2canvasLoaded || !window.jspdf || !window.html2canvas) {
      alert('⏳ Por favor espera mientras se cargan los recursos necesarios...');
      return;
    }
    
    try {
      const elemento = document.querySelector('[data-comunicado="preview"]');
      if (!elemento) {
        alert('No se pudo encontrar el comunicado');
        return;
      }

      const canvas = await window.html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPosition = 10;
      const yPosition = 10;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xPosition,
        yPosition,
        imgWidth,
        imgHeight
      );

      const filename = `comunicado_oficial_${formData.empresa.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(filename);
      
      alert('✅ PDF descargado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar el PDF. Intenta de nuevo.');
    }
  };

  const formatearFecha = (fecha, hora, idiomaActual) => {
    if (!fecha || !hora) return '';
    
    const fechaObj = new Date(fecha + 'T' + hora);
    
    if (idiomaActual === 'en') {
      const diasEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const mesesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      const diaSemana = diasEn[fechaObj.getDay()];
      const dia = fechaObj.getDate();
      const mes = mesesEn[fechaObj.getMonth()];
      const año = fechaObj.getFullYear();
      const horas = fechaObj.getHours();
      const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';
      const hora12 = horas % 12 || 12;
      
      return `${diaSemana}, ${mes} ${dia}, ${año} ${hora12.toString().padStart(2, '0')}:${minutos} ${ampm} (GMT-5)`;
    } else {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      const diaSemana = dias[fechaObj.getDay()];
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = meses[fechaObj.getMonth()];
      const año = fechaObj.getFullYear();
      const horas = fechaObj.getHours();
      const minutos = fechaObj.getMinutes().toString().padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';
      const hora12 = horas % 12 || 12;
      
      return `${diaSemana}, ${dia} de ${mes} de ${año} ${hora12.toString().padStart(2, '0')}:${minutos} ${ampm} (GMT-5)`;
    }
  };

  const calcularPeriodo = () => {
    if (!formData.fechaInicioDate || !formData.horaInicio || !formData.fechaFinDate || !formData.horaFin) return '';
    
    const inicio = new Date(formData.fechaInicioDate + 'T' + formData.horaInicio);
    const fin = new Date(formData.fechaFinDate + 'T' + formData.horaFin);
    const diferencia = fin - inicio;
    
    if (diferencia <= 0) return '';
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    let periodo = '';
    if (horas > 0) {
      periodo = horas + (horas === 1 ? ' hora' : ' horas');
      if (minutosRestantes > 0) {
        periodo += ' y ' + minutosRestantes + (minutosRestantes === 1 ? ' minuto' : ' minutos');
      }
    } else {
      periodo = minutos + (minutos === 1 ? ' minuto' : ' minutos');
    }
    
    return periodo;
  };

  const traducirTexto = async (texto) => {
    // Simulación de traducción
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const traducciones = {
      'Depuración semanal del Centro Autorizador (CAO)': 'Weekly Authorization Center (CAO) Maintenance',
      'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.\n\nDurante la ventana, las transacciones serán procesadas por Standin': 
        'Transactions made in own and external networks using credit/debit cards.\n\nDuring the window, transactions will be processed by Standin'
    };
    
    // Traducir periodo
    if (texto.includes('hora') || texto.includes('minuto')) {
      const match = texto.match(/(\d+)\s+(hora|horas|minuto|minutos)(?:\s+y\s+(\d+)\s+(minuto|minutos))?/);
      if (match) {
        if (match[3]) {
          const horas = match[1];
          const minutos = match[3];
          return `${horas} hour${horas > 1 ? 's' : ''} and ${minutos} minute${minutos > 1 ? 's' : ''}`;
        } else {
          const cantidad = match[1];
          const unidad = match[2];
          if (unidad.includes('hora')) {
            return `${cantidad} hour${cantidad > 1 ? 's' : ''}`;
          } else {
            return `${cantidad} minute${cantidad > 1 ? 's' : ''}`;
          }
        }
      }
    }
    
    return traducciones[texto] || texto;
  };

  const cambiarIdioma = async (nuevoIdioma) => {
    if (nuevoIdioma === idioma) return;
    
    setTraduciendo(true);
    
    if (nuevoIdioma === 'en' && formData.actividad && formData.servicioAfectado) {
      const [actividadTrad, servicioTrad, periodoTrad] = await Promise.all([
        traducirTexto(formData.actividad),
        traducirTexto(formData.servicioAfectado),
        traducirTexto(formData.periodoAfectacion)
      ]);
      
      setTextoTraducido({
        actividad: actividadTrad,
        servicioAfectado: servicioTrad,
        periodoAfectacion: periodoTrad
      });
    } else {
      setTextoTraducido(null);
    }
    
    setIdioma(nuevoIdioma);
    setTraduciendo(false);
  };

  React.useEffect(() => {
    const periodo = calcularPeriodo();
    if (periodo) {
      setFormData(prev => ({ ...prev, periodoAfectacion: periodo }));
    }
  }, [formData.fechaInicioDate, formData.horaInicio, formData.fechaFinDate, formData.horaFin]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generarComunicado = () => {
    const camposRequeridos = ['actividad', 'fechaInicioDate', 'horaInicio', 'fechaFinDate', 'horaFin', 'servicioAfectado', 'periodoAfectacion'];
    
    if (!camposRequeridos.every(campo => formData[campo])) {
      alert('Por favor, complete todos los campos antes de generar el comunicado');
      return;
    }
    
    const inicio = new Date(formData.fechaInicioDate + 'T' + formData.horaInicio);
    const fin = new Date(formData.fechaFinDate + 'T' + formData.horaFin);
    
    if (fin <= inicio) {
      alert('La fecha y hora de fin debe ser posterior a la fecha y hora de inicio');
      return;
    }
    
    setMostrarVista(true);
  };

  const limpiarFormulario = () => {
    setFormData({
      empresa: 'INTERDIN S.A.',
      actividad: '',
      fechaInicioDate: '',
      horaInicio: '',
      fechaFinDate: '',
      horaFin: '',
      servicioAfectado: '',
      periodoAfectacion: ''
    });
    setMostrarVista(false);
    setIdioma('es');
    setTextoTraducido(null);
  };

  const cargarEjemplo = () => {
    setFormData({
      empresa: 'INTERDIN S.A.',
      actividad: 'Depuración semanal del Centro Autorizador (CAO)',
      fechaInicioDate: '2025-06-09',
      horaInicio: '02:00',
      fechaFinDate: '2025-06-09',
      horaFin: '02:45',
      servicioAfectado: 'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.\n\nDurante la ventana, las transacciones serán procesadas por Standin',
      periodoAfectacion: '45 minutos'
    });
  };

  const LogoDiners = () => (
    <div style={{
      width: '68px',
      height: '54px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '68px',
        height: '52px',
        position: 'relative',
        borderRadius: '26px',
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '2px solid white'
      }}>
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '50%',
          height: '100%',
          backgroundColor: '#4db8db'
        }}></div>
        <div style={{
          position: 'absolute',
          right: '0',
          top: '0',
          width: '50%',
          height: '100%',
          backgroundColor: '#004976'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '14px',
          height: '80%',
          backgroundColor: 'white',
          borderRadius: '7px'
        }}></div>
      </div>
    </div>
  );

  const LogoInterdin = () => (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      border: '2.5px solid white',
      borderRadius: '5px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      <div style={{ 
        backgroundColor: '#1b3a5e',
        color: '#ffffff',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ 
          fontWeight: 'bold',
          fontSize: '23px',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2.5px'
        }}>
          INTER
        </span>
      </div>
      <div style={{ 
        backgroundColor: '#e60000',
        color: '#ffffff',
        padding: '0 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ 
          fontWeight: 'bold',
          fontSize: '23px',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '2.5px'
        }}>
          DIN
        </span>
      </div>
    </div>
  );

  const VistaPreviaComunicado = ({ datos, idiomaActual, textosTrad }) => {
    const fechaInicio = formatearFecha(datos.fechaInicioDate, datos.horaInicio, idiomaActual);
    const fechaFin = formatearFecha(datos.fechaFinDate, datos.horaFin, idiomaActual);
    
    const textos = idiomaActual === 'en' ? {
      titulo: 'OFFICIAL STATEMENT',
      empresa: datos.empresa === 'INTERDIN S.A.' ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR',
      intro: `It is reported that ${datos.empresa === 'INTERDIN S.A.' ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR'} will carry out the following scheduled activity`,
      labels: {
        actividad: 'Activity',
        fechaHora: ['Date and Time', 'Execution'],
        servicio: ['Service', 'Affected'],
        periodo: ['Period of', 'Affectation'],
        inicio: 'Start',
        fin: 'End'
      },
      monitoreo: ['Active monitoring is maintained during the activity to ensure', 'service restoration.'],
      contacto: 'For any questions please contact Technology Monitoring',
      correo: '02-2981-300 Ext. 4297 or email'
    } : {
      titulo: 'COMUNICADO OFICIAL',
      empresa: datos.empresa,
      intro: `Se informa que ${datos.empresa} realizará la siguiente actividad programada`,
      labels: {
        actividad: 'Actividad',
        fechaHora: ['Fecha y Hora', 'Ejecución'],
        servicio: ['Servicio', 'Afectado'],
        periodo: ['Periodo de', 'Afectación'],
        inicio: 'Inicio',
        fin: 'Fin'
      },
      monitoreo: ['Se mantiene el monitoreo activo durante la actividad para asegurar el', 'restablecimiento del servicio.'],
      contacto: 'Cualquier duda favor comunicarse con Monitoreo Tecnología',
      correo: '02-2981-300 Ext. 4297 o correo'
    };
    
    const contenido = textosTrad && idiomaActual === 'en' ? {
      actividad: textosTrad.actividad || datos.actividad,
      servicioAfectado: textosTrad.servicioAfectado || datos.servicioAfectado,
      periodoAfectacion: textosTrad.periodoAfectacion || datos.periodoAfectacion
    } : datos;
    
    return (
      <div style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '900px',
        margin: '0 auto'
      }} data-comunicado="preview">
        <div style={{ 
          backgroundColor: '#0d2844',
          position: 'relative',
          paddingTop: '20px',
          paddingBottom: '30px'
        }}>
          <div style={{
            height: '150px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '40px',
              right: '40px',
              height: '2px',
              backgroundColor: 'white'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '40px',
              right: '40px',
              height: '2px',
              backgroundColor: 'white'
            }}></div>
            
            <div style={{
              display: 'flex',
              height: '100%',
              position: 'relative'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '35px 50px'
              }}>
                <h1 style={{ 
                  fontSize: '42px',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  fontFamily: 'Arial, sans-serif',
                  margin: '0',
                  color: 'white',
                  lineHeight: '1.1',
                  textAlign: 'center'
                }}>{textos.titulo}</h1>
                <h2 style={{ 
                  fontSize: '32px',
                  fontWeight: '400',
                  letterSpacing: '1px',
                  fontFamily: 'Arial, sans-serif',
                  margin: '6px 0 0 0',
                  color: 'white',
                  lineHeight: '1.1',
                  textAlign: 'center'
                }}>{textos.empresa}</h2>
              </div>
              
              <div style={{
                width: '2px',
                backgroundColor: 'white',
                position: 'absolute',
                top: '22px',
                bottom: '22px',
                right: '280px',
                zIndex: 1
              }}></div>
              
              <div style={{
                width: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '35px 40px'
              }}>
                {datos.empresa === 'INTERDIN S.A.' ? <LogoInterdin /> : <LogoDiners />}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '50px 80px' }}>
          <p style={{ fontSize: '18px', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
            {textos.intro}
          </p>
          
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                padding: '24px', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                width: '320px', 
                textAlign: 'center', 
                fontFamily: 'Arial, sans-serif' 
              }}>
                {textos.labels.actividad}
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {contenido.actividad}
              </div>
            </div>
            
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                padding: '24px', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                width: '320px', 
                textAlign: 'center', 
                fontFamily: 'Arial, sans-serif', 
                verticalAlign: 'middle',
                lineHeight: '1.3'
              }}>
                <div>{textos.labels.fechaHora[0]}</div>
                <div>{textos.labels.fechaHora[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{textos.labels.inicio}:</strong> {fechaInicio}
                </div>
                <div>
                  <strong>{textos.labels.fin}:</strong> {fechaFin}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                padding: '24px', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                width: '320px', 
                textAlign: 'center', 
                fontFamily: 'Arial, sans-serif', 
                verticalAlign: 'middle',
                lineHeight: '1.3'
              }}>
                <div>{textos.labels.servicio[0]}</div>
                <div>{textos.labels.servicio[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap' }}>
                {contenido.servicioAfectado}
              </div>
            </div>
            
            <div style={{ display: 'table', width: '100%', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#1976d2', 
                color: 'white', 
                padding: '24px', 
                fontSize: '20px', 
                fontWeight: 'bold', 
                width: '320px', 
                textAlign: 'center', 
                fontFamily: 'Arial, sans-serif', 
                verticalAlign: 'middle',
                lineHeight: '1.3'
              }}>
                <div>{textos.labels.periodo[0]}</div>
                <div>{textos.labels.periodo[1]}</div>
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {contenido.periodoAfectacion}
              </div>
            </div>
          </div>
          
          <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
            {textos.monitoreo[0]}<br/>
            {textos.monitoreo[1]}
          </p>
          
          <div style={{ backgroundColor: '#f0f0f0', padding: '24px', borderRadius: '10px', textAlign: 'center', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
            <strong>{textos.contacto}</strong><br/>
            {textos.correo} <a href="mailto:monitoreot@dinersclub.com.ec" style={{ color: '#1976d2' }}>
              monitoreot@dinersclub.com.ec
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (mostrarVista) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#e8f4f8',
            padding: '10px 15px',
            borderRadius: '4px',
            border: '1px solid #b3e0f2',
            maxWidth: '900px',
            margin: '0 auto 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#0d47a1', fontWeight: '500' }}>
              🌐 Idioma del comunicado:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={idioma}
                onChange={(e) => cambiarIdioma(e.target.value)}
                disabled={traduciendo}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  border: '1px solid #1976d2',
                  borderRadius: '4px',
                  cursor: traduciendo ? 'wait' : 'pointer',
                  backgroundColor: 'white',
                  color: '#1976d2',
                  fontWeight: '500'
                }}
              >
                <option value="es">🇪🇨 Español</option>
                <option value="en">🇺🇸 English</option>
              </select>
              {traduciendo && (
                <span style={{ fontSize: '12px', color: '#1976d2' }}>⏳ Traduciendo...</span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ color: '#0f2844', fontSize: '28px', marginBottom: '20px' }}>Vista Previa del Comunicado</h2>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setMostrarVista(false);
                setIdioma('es');
                setTextoTraducido(null);
              }}
              style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
            >
              Volver al Editor
            </button>
            <button
              onClick={exportarPDF}
              style={{ padding: '12px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
        <VistaPreviaComunicado datos={formData} idiomaActual={idioma} textosTrad={textoTraducido} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>Generador de Comunicados Oficiales</h2>
      
      <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', color: '#1565c0' }}>
        ℹ️ Todas las fechas y horas se mostrarán en formato GMT-5 (Ecuador)
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Empresa:</label>
        <select 
          value={formData.empresa} 
          onChange={(e) => updateField('empresa', e.target.value)}
          style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="INTERDIN S.A.">INTERDIN S.A.</option>
          <option value="DINERS CLUB DEL ECUADOR">DINERS CLUB DEL ECUADOR</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Actividad:</label>
        <textarea
          value={formData.actividad}
          onChange={(e) => updateField('actividad', e.target.value)}
          placeholder="Ej: Depuración semanal del Centro Autorizador (CAO)"
          style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', resize: 'vertical' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha y Hora de Inicio:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="date"
            value={formData.fechaInicioDate}
            onChange={(e) => updateField('fechaInicioDate', e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="time"
            value={formData.horaInicio}
            onChange={(e) => updateField('horaInicio', e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {formData.fechaInicioDate && formData.horaInicio && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            Vista previa: {formatearFecha(formData.fechaInicioDate, formData.horaInicio)}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha y Hora de Fin:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="date"
            value={formData.fechaFinDate}
            onChange={(e) => updateField('fechaFinDate', e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="time"
            value={formData.horaFin}
            onChange={(e) => updateField('horaFin', e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {formData.fechaFinDate && formData.horaFin && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            Vista previa: {formatearFecha(formData.fechaFinDate, formData.horaFin)}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicio Afectado:</label>
        <textarea
          value={formData.servicioAfectado}
          onChange={(e) => updateField('servicioAfectado', e.target.value)}
          placeholder="Describa los servicios que se verán afectados..."
          style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '120px', resize: 'vertical' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Periodo de Afectación:</label>
        <input
          type="text"
          value={formData.periodoAfectacion}
          onChange={(e) => updateField('periodoAfectacion', e.target.value)}
          placeholder="Se calcula automáticamente o ingrese manualmente"
          style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: formData.periodoAfectacion && formData.fechaInicioDate && formData.fechaFinDate ? '#f0f7ff' : 'white' }}
        />
        {formData.fechaInicioDate && formData.horaInicio && formData.fechaFinDate && formData.horaFin && (
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#1976d2' }}>
            ⏱️ Calculado automáticamente (puede editarlo si lo desea)
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button
          onClick={generarComunicado}
          style={{ flex: 1, padding: '12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Generar Comunicado
        </button>
        <button
          onClick={limpiarFormulario}
          style={{ padding: '12px 20px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}
        >
          Limpiar
        </button>
      </div>
      
      <button
        onClick={cargarEjemplo}
        style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}
      >
        📝 Cargar Ejemplo
      </button>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL CON LOGIN Y PANEL
// ============================================
const CommandCenter = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('incidentes');

  const handleLogin = () => {
    if (username === 'gestores' && password === 'interdin2025') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoginError('');
    setActiveTab('incidentes');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a2332',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          width: '400px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '28px',
              color: '#0d2844',
              marginBottom: '10px'
            }}>
              DINERS CLUB
            </h1>
            <h2 style={{
              fontSize: '20px',
              color: '#1976d2',
              fontWeight: 'normal'
            }}>
              COMMAND CENTER
            </h2>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#333',
                fontSize: '14px'
              }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#333',
                fontSize: '14px'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {loginError && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {loginError}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            <div>Diseñado por <strong>Luis Alberto Herrera Lara</strong></div>
            <div>Lanzado el 10 de agosto del 2025</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#0d2844',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>COMMAND CENTER</h1>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
            Sistema de Gestión de Comunicados
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px' }}>
            Usuario: <strong>gestores</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid white',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '0 30px'
      }}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => setActiveTab('incidentes')}
            style={{
              padding: '15px 25px',
              backgroundColor: activeTab === 'incidentes' ? '#f5f5f5' : 'white',
              border: 'none',
              borderBottom: activeTab === 'incidentes' ? '3px solid #1976d2' : 'none',
              cursor: 'pointer',
              fontSize: '15px',
              color: activeTab === 'incidentes' ? '#1976d2' : '#666'
            }}
          >
            🚨 Gestión de Incidentes
          </button>
          <button
            onClick={() => setActiveTab('comunicados')}
            style={{
              padding: '15px 25px',
              backgroundColor: activeTab === 'comunicados' ? '#f5f5f5' : 'white',
              border: 'none',
              borderBottom: activeTab === 'comunicados' ? '3px solid #1976d2' : 'none',
              cursor: 'pointer',
              fontSize: '15px',
              color: activeTab === 'comunicados' ? '#1976d2' : '#666'
            }}
          >
            📋 Comunicados Oficiales
          </button>
        </div>
      </div>
      
      <div style={{ padding: '30px', paddingBottom: '100px' }}>
        {activeTab === 'incidentes' ? <HerramientaIncidentes /> : <GeneradorComunicados />}
      </div>
      
      <div style={{
        backgroundColor: '#0d2844',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        fontSize: '12px',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}>
        <div>Command Center © 2025 - Diners Club del Ecuador</div>
        <div style={{ marginTop: '5px', opacity: 0.8 }}>
          Desarrollado por Luis Alberto Herrera Lara | Lanzado el 10 de agosto del 2025
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
