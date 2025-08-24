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
// import React from 'react';

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================

const EMPRESAS = {
  INTERDIN: 'INTERDIN S.A.',
  DINERS: 'DINERS CLUB DEL ECUADOR'
};

const IDIOMAS = {
  ES: 'es',
  EN: 'en'
};

// Sistema de traducciones escalable
const TRADUCCIONES = {
  [IDIOMAS.ES]: {
    titulo: 'COMUNICADO OFICIAL',
    introText: (empresa) => `Se informa que ${empresa} realizará la siguiente actividad programada`,
    labels: {
      actividad: 'Actividad',
      fechaHora: 'Fecha y Hora\nEjecución',
      servicio: 'Servicio\nAfectado',
      periodo: 'Afectación',
      inicio: 'Inicio',
      fin: 'Fin'
    },
    monitoreo: 'Se mantiene el monitoreo activo durante la actividad para asegurar el\nrestablecimiento del servicio.',
    contacto: 'Cualquier duda favor comunicarse con Monitoreo',
    correo: '02-2981-300 Ext. 4381 o correo',
    formulario: {
      titulo: 'Generador de Comunicados Oficiales',
      tipoComunicado: 'Tipo de Comunicado:',
      tipoNormal: '📋 Mantenimiento Normal',
      tipoCancelacion: '❌ Cancelación/Aviso',
      mensajeCancelacion: 'Mensaje del comunicado:',
      datosDelComunicado: 'Datos del Comunicado',
      empresa: 'Empresa:',
      actividad: 'Actividad:',
      fechaHoraInicio: 'Fecha y Hora de Inicio:',
      fechaHoraFin: 'Fecha y Hora de Fin:',
      multiplesDias: '📅 Habilitar múltiples días',
      agregarDia: '➕ Agregar otro día',
      eliminarDia: '❌ Eliminar',
      dia: 'Día',
      servicioAfectado: 'Servicio Afectado:',
      periodoAfectacion: 'Periodo de Afectación:',
      notaAfectacion: 'Nota adicional (opcional):',
      mostrarTextoMonitoreo: 'Mostrar texto de monitoreo activo',
      vistaPrevia: 'Vista previa:',
      generarComunicado: 'Generar Comunicado',
      limpiar: 'Limpiar',
      cargarEjemplo: '📝 Cargar Ejemplo',
      vistaPreviaComunicado: 'Vista Previa del Comunicado',
      exportarPDF: '📄 Exportar PDF',
      calculadoAutomaticamente: '⏱️ Calculado automáticamente (puede editarlo si lo desea)',
      infoTimezone: 'ℹ️ Todas las fechas y horas se mostrarán en formato GMT-5 (Ecuador)',
      infoTraduccion: '💡 Traducción automática: Una vez generado el comunicado, podrás traducirlo al inglés usando el selector de idioma.',
      completeCampos: 'Complete los campos y haga clic en "Generar Comunicado" para ver la vista previa',
      procesando: '⏳ Procesando...',
      traduciendo: '⏳ Traduciendo...',
      idiomaComunicado: '🌐 Idioma del comunicado:',
      placeholders: {
        actividad: 'Ej: Depuración semanal del Centro Autorizador (CAO)',
        servicioAfectado: 'Describa los servicios que se verán afectados...',
        periodoAfectacion: 'Se calcula automáticamente o ingrese manualmente',
        notaAfectacion: 'Ej: Durante el mantenimiento se presentará intervalos de indisponibilidad',
        mensajeCancelacion: 'Ej: Se informa que la ventana de trabajo prevista para el 23 y 24 de agosto, ha sido cancelada y será reagendada.\n\nGracias por su comprensión.'
      },
      alertas: {
        camposIncompletos: 'Por favor, complete todos los campos antes de generar el comunicado',
        fechaInvalida: 'La fecha y hora de fin debe ser posterior a la fecha y hora de inicio',
        copiaExitosa: '✅ ¡Imagen copiada al portapapeles!\n\nYa puedes pegarla con Ctrl+V (o Cmd+V en Mac) en WhatsApp, Email, Word, etc.',
        errorCopia: '⚠️ No se pudo copiar al portapapeles.\n\nLa imagen se ha descargado en su lugar. Puede abrirla y copiarla manualmente.',
        descargaExitosa: '✅ Imagen descargada\n\nLa imagen se ha descargado a tu carpeta de descargas.',
        errorGeneral: '❌ Ocurrió un error. Por favor, intente nuevamente.'
      }
    }
  },
  [IDIOMAS.EN]: {
    titulo: 'OFFICIAL STATEMENT',
    introText: (empresa) => `It is reported that ${empresa === EMPRESAS.INTERDIN ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR'} will carry out the following scheduled activity`,
    labels: {
      actividad: 'Activity',
      fechaHora: 'Date and Time\nExecution',
      servicio: 'Affected\nService',
      periodo: 'Affectation',
      inicio: 'Start',
      fin: 'End'
    },
    monitoreo: 'Active monitoring is maintained during the activity to ensure\nservice restoration.',
    contacto: 'For any questions please contact Monitoring',
    correo: '02-2981-300 Ext. 4381 or email'
  }
};

// ============================================
// ESTILOS CENTRALIZADOS
// ============================================

const styles = {
  // Estilos generales
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  mainTitle: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#0f2844',
    fontSize: '32px',
    fontWeight: 'bold'
  },
  flexContainer: {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start'
  },
  
  // Panel de edición
  editorPanel: {
    flex: '0 0 450px',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#333'
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#1565c0'
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '20px',
    fontSize: '12px',
    color: '#856404',
    border: '1px solid #ffeeba'
  },
  
  // Campos del formulario
  fieldGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  select: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minHeight: '80px',
    resize: 'vertical'
  },
  textareaLarge: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minHeight: '120px',
    resize: 'vertical'
  },
  dateTimeContainer: {
    display: 'flex',
    gap: '10px'
  },
  dateTimeInput: {
    flex: 1,
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  preview: {
    marginTop: '5px',
    fontSize: '12px',
    color: '#666'
  },
  autoCalculated: {
    marginTop: '5px',
    fontSize: '12px',
    color: '#1976d2'
  },
  
  // Botones
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '30px'
  },
  primaryButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '12px 20px',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  exampleButton: {
    width: '100%',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  exportPDFButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: 'bold'
  },
  
  // Vista previa
  previewContainer: {
    flex: 1
  },
  previewHeader: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  previewTitle: {
    margin: 0,
    color: '#0f2844'
  },
  previewWrapper: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px'
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    color: '#999'
  },
  
  // Selector de idioma
  languageSelector: {
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    padding: '10px 15px',
    borderRadius: '4px',
    border: '1px solid #b3e0f2'
  },
  languageLabel: {
    fontSize: '14px',
    color: '#0d47a1',
    fontWeight: '500'
  },
  languageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  languageSelect: {
    padding: '6px 12px',
    fontSize: '14px',
    border: '1px solid #1976d2',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#1976d2',
    fontWeight: '500'
  },
  translatingText: {
    fontSize: '12px',
    color: '#1976d2'
  }
};

// ============================================
// SERVICIOS Y UTILIDADES
// ============================================

class TraduccionService {
  static cache = new Map();
  
  static async traducir(texto, deIdioma, aIdioma) {
    const cacheKey = `${texto}_${deIdioma}_${aIdioma}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Simulamos la traducción con un delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultado = this.traduccionFallback(texto, deIdioma, aIdioma);
      this.cache.set(cacheKey, resultado);
      return resultado;
    } catch (error) {
      console.error('Error al traducir:', error);
      return this.traduccionFallback(texto, deIdioma, aIdioma);
    }
  }
  
  static traduccionFallback(texto, deIdioma, aIdioma) {
    const traducciones = {
      'Depuración semanal del Centro Autorizador (CAO)': 'Weekly Authorization Center (CAO) Maintenance',
      'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.': 'Transactions made in own and external networks using credit/debit cards.',
      'Durante la ventana, las transacciones serán procesadas por Standin': 'During the window, transactions will be processed by Standin',
      'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.\n\nDurante la ventana, las transacciones serán procesadas por Standin': 'Transactions made in own and external networks using credit/debit cards.\n\nDuring the window, transactions will be processed by Standin'
    };
    
    // Traducir periodos de tiempo
    const periodoMatch = texto.match(/(\d+)\s+(hora|horas|minuto|minutos)(?:\s+y\s+(\d+)\s+(minuto|minutos))?/);
    if (periodoMatch && aIdioma === 'en') {
      if (periodoMatch[3]) {
        const horas = periodoMatch[1];
        const minutos = periodoMatch[3];
        return `${horas} hour${horas > 1 ? 's' : ''} and ${minutos} minute${minutos > 1 ? 's' : ''}`;
      } else {
        const cantidad = periodoMatch[1];
        const unidad = periodoMatch[2];
        if (unidad.includes('hora')) {
          return `${cantidad} hour${cantidad > 1 ? 's' : ''}`;
        } else {
          return `${cantidad} minute${cantidad > 1 ? 's' : ''}`;
        }
      }
    }
    
    return traducciones[texto] || texto;
  }
}

class FormatoService {
  static formatearFecha(fecha, hora, idioma) {
    if (!fecha || !hora) return '';
    
    // Formato simplificado: DD/MM/YYYY HH:MM
    const [year, month, day] = fecha.split('-');
    const formattedDate = `${day}/${month}/${year} ${hora}`;
    
    return formattedDate;
  }
  
  static formatearFechaMultiple(periodos, idioma) {
    if (!periodos || periodos.length === 0) return { inicio: '', fin: '' };
    
    if (periodos.length === 1) {
      const periodo = periodos[0];
      return {
        inicio: periodo.fechaInicioDate && periodo.horaInicio ? 
          this.formatearFecha(periodo.fechaInicioDate, periodo.horaInicio, idioma) : '',
        fin: periodo.fechaFinDate && periodo.horaFin ? 
          this.formatearFecha(periodo.fechaFinDate, periodo.horaFin, idioma) : ''
      };
    }
    
    // Para múltiples días
    const fechasFormateadas = periodos.map((periodo, index) => {
      const inicio = periodo.fechaInicioDate && periodo.horaInicio ? 
        this.formatearFecha(periodo.fechaInicioDate, periodo.horaInicio, idioma) : '';
      const fin = periodo.fechaFinDate && periodo.horaFin ? 
        this.formatearFecha(periodo.fechaFinDate, periodo.horaFin, idioma) : '';
      
      const diaLabel = idioma === IDIOMAS.EN ? `DAY ${index + 1}` : `DÍA ${index + 1}`;
      return {
        dia: diaLabel,
        inicio,
        fin
      };
    });
    
    return fechasFormateadas;
  }
  
  static calcularPeriodo(fechaInicio, horaInicio, fechaFin, horaFin) {
    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return '';
    
    const inicio = new Date(fechaInicio + 'T' + horaInicio);
    const fin = new Date(fechaFin + 'T' + horaFin);
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
  }
  
  static calcularPeriodoTotal(periodos) {
    if (!periodos || periodos.length === 0) return '';
    
    let totalMinutos = 0;
    
    periodos.forEach(periodo => {
      if (periodo.fechaInicioDate && periodo.horaInicio && periodo.fechaFinDate && periodo.horaFin) {
        const inicio = new Date(periodo.fechaInicioDate + 'T' + periodo.horaInicio);
        const fin = new Date(periodo.fechaFinDate + 'T' + periodo.horaFin);
        const diferencia = fin - inicio;
        
        if (diferencia > 0) {
          totalMinutos += Math.floor(diferencia / 60000);
        }
      }
    });
    
    if (totalMinutos === 0) return '';
    
    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    
    let periodo = '';
    if (horas > 0) {
      periodo = horas + (horas === 1 ? ' hora' : ' horas');
      if (minutosRestantes > 0) {
        periodo += ' y ' + minutosRestantes + (minutosRestantes === 1 ? ' minuto' : ' minutos');
      }
    } else {
      periodo = totalMinutos + (totalMinutos === 1 ? ' minuto' : ' minutos');
    }
    
    return periodo;
  }
}

// ============================================
// COMPONENTES
// ============================================

// Componente Logo Diners
const LogoDiners = () => (
  <div style={{
    width: '75px',
    height: '60px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      width: '75px',
      height: '58px',
      position: 'relative',
      borderRadius: '29px',
      overflow: 'hidden',
      backgroundColor: 'white',
      border: '1px solid #ddd'
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
        width: '16px',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: '8px'
      }}></div>
    </div>
  </div>
);

// Componente Logo INTERDIN para fondo azul
const LogoInterdinWhite = () => {
  return (
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
};

// Componente Logo Diners para fondo azul
const LogoDinersWhite = () => (
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

// Componente Logo INTERDIN
const LogoInterdin = () => {
  const [imagenError, setImagenError] = React.useState(false);
  
  if (imagenError) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        border: '2px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          backgroundColor: '#1b3a5e',
          color: '#ffffff',
          padding: '0 20px',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontWeight: 'bold',
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '3px'
          }}>
            INTER
          </span>
        </div>
        <div style={{ 
          backgroundColor: '#e60000',
          color: '#ffffff',
          padding: '0 20px',
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontWeight: 'bold',
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '3px'
          }}>
            DIN
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <img 
      src="https://dl.dropboxusercontent.com/scl/fi/68ijsay36q6arzipbihqs/interdin.png?rlkey=l3q4yzutnit6b6s3sq7hi93k2&dl=1"
      alt="INTERDIN"
      style={{
        height: '60px',
        width: 'auto',
        display: 'block'
      }}
      onError={() => setImagenError(true)}
    />
  );
};

// Componente Selector de Idioma
const SelectorIdioma = ({ idioma, onChange, cargando }) => {
  const textos = TRADUCCIONES[IDIOMAS.ES].formulario;
  
  return (
    <div className="no-print" style={styles.languageSelector}>
      <span style={styles.languageLabel}>
        {textos.idiomaComunicado}
      </span>
      <div style={styles.languageControls}>
        <select
          value={idioma}
          onChange={(e) => onChange(e.target.value)}
          disabled={cargando}
          style={{
            ...styles.languageSelect,
            cursor: cargando ? 'wait' : 'pointer'
          }}
        >
          <option value={IDIOMAS.ES}>🇪🇨 Español</option>
          <option value={IDIOMAS.EN}>🇺🇸 English</option>
        </select>
        {cargando && (
          <span style={styles.translatingText}>{textos.traduciendo}</span>
        )}
      </div>
    </div>
  );
};

// Componente Vista Previa del Comunicado
const VistaPreviaComunicado = ({ datos }) => {
  const [idioma, setIdioma] = React.useState(IDIOMAS.ES);
  const [textoTraducido, setTextoTraducido] = React.useState(null);
  const [cargandoTraduccion, setCargandoTraduccion] = React.useState(false);
  
  const cambiarIdioma = async (nuevoIdioma) => {
    if (nuevoIdioma === idioma) return;
    
    setCargandoTraduccion(true);
    
    if (nuevoIdioma === IDIOMAS.EN) {
      try {
        const [actividad, servicioAfectado, periodoAfectacion] = await Promise.all([
          TraduccionService.traducir(datos.actividad, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(datos.servicioAfectado, IDIOMAS.ES, IDIOMAS.EN),
          TraduccionService.traducir(datos.periodoAfectacion, IDIOMAS.ES, IDIOMAS.EN)
        ]);
        
        setTextoTraducido({ actividad, servicioAfectado, periodoAfectacion });
      } catch (error) {
        console.error('Error en traducción:', error);
      }
    } else {
      setTextoTraducido(null);
    }
    
    setIdioma(nuevoIdioma);
    setCargandoTraduccion(false);
  };
  
  const obtenerTextos = () => {
    const traducciones = TRADUCCIONES[idioma];
    
    const fechasFormateadas = FormatoService.formatearFechaMultiple(datos.periodos, idioma);
    
    if (idioma === IDIOMAS.ES || !textoTraducido) {
      return {
        ...traducciones,
        empresa: datos.empresa,
        introText: traducciones.introText(datos.empresa),
        actividad: datos.actividad,
        servicioAfectado: datos.servicioAfectado,
        periodoAfectacion: datos.periodoAfectacion,
        notaAfectacion: datos.notaAfectacion,
        mostrarMonitoreo: datos.mostrarMonitoreo,
        fechasFormateadas: fechasFormateadas,
        multiplesDias: datos.multiplesDias,
        tipoComunicado: datos.tipoComunicado,
        mensajeCancelacion: datos.mensajeCancelacion
      };
    }
    
    return {
      ...traducciones,
      empresa: datos.empresa === EMPRESAS.INTERDIN ? 'INTERDIN S.A.' : 'DINERS CLUB OF ECUADOR',
      introText: traducciones.introText(datos.empresa),
      actividad: textoTraducido.actividad,
      servicioAfectado: textoTraducido.servicioAfectado,
      periodoAfectacion: textoTraducido.periodoAfectacion,
      notaAfectacion: textoTraducido.notaAfectacion || datos.notaAfectacion,
      mostrarMonitoreo: datos.mostrarMonitoreo,
      fechasFormateadas: fechasFormateadas,
      multiplesDias: datos.multiplesDias,
      tipoComunicado: datos.tipoComunicado,
      mensajeCancelacion: datos.mensajeCancelacion
    };
  };
  
  const textos = obtenerTextos();
  
  return (
    <div>
      <SelectorIdioma 
        idioma={idioma}
        onChange={cambiarIdioma}
        cargando={cargandoTraduccion}
      />
      
      <div id="vista-comunicado-inner" style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '900px',
        margin: '0 auto'
      }}>
        {/* Header con diseño corporativo */}
        <div style={{ 
          backgroundColor: '#0d2844',
          position: 'relative',
          paddingTop: '20px',
          paddingBottom: '30px' // Más espacio azul abajo
        }}>
          {/* Contenedor principal */}
          <div style={{
            height: '150px',
            position: 'relative'
          }}>
            {/* Línea horizontal superior - metida desde los bordes */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '40px',  // Metida 40px desde la izquierda
              right: '40px', // Metida 40px desde la derecha
              height: '2px',
              backgroundColor: 'white'
            }}></div>
            
            {/* Línea horizontal inferior - metida desde los bordes */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '40px',  // Metida 40px desde la izquierda
              right: '40px', // Metida 40px desde la derecha
              height: '2px',
              backgroundColor: 'white'
            }}></div>
            
            {/* Contenedor flex */}
            <div style={{
              display: 'flex',
              height: '100%',
              position: 'relative'
            }}>
              {/* Sección de texto */}
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
              
              {/* Línea vertical divisoria */}
              <div style={{
                width: '2px',
                backgroundColor: 'white',
                position: 'absolute',
                top: '22px',
                bottom: '22px',
                right: '280px',
                zIndex: 1
              }}></div>
              
              {/* Sección del logo */}
              <div style={{
                width: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '35px 40px'
              }}>
                {datos.empresa === EMPRESAS.INTERDIN ? <LogoInterdinWhite /> : <LogoDinersWhite />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenido */}
        <div style={{ padding: '50px 80px' }}>
          {textos.tipoComunicado === 'CANCELACION' ? (
            // Comunicado de cancelación - solo mensaje central
            <div style={{ 
              padding: '60px 40px', 
              textAlign: 'center',
              fontSize: '20px',
              lineHeight: '1.8',
              fontFamily: 'Arial, sans-serif'
            }}>
              {textos.mensajeCancelacion.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < textos.mensajeCancelacion.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            // Comunicado normal con todos los campos
            <>
              <p style={{ fontSize: '18px', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
                {textos.introText}
              </p>
              
              {/* Campos */}
              <div style={{ marginBottom: '40px' }}>
            {/* Actividad */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#0065A6', 
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
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {textos.actividad}
              </div>
            </div>
            
            {/* Fecha y Hora */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#0065A6', 
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
                {textos.labels.fechaHora.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {textos.multiplesDias && Array.isArray(textos.fechasFormateadas) ? (
                  textos.fechasFormateadas.map((fecha, index) => (
                    <div key={index} style={{ marginBottom: index < textos.fechasFormateadas.length - 1 ? '15px' : '0' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#0065A6' }}>{fecha.dia}:</div>
                      <div style={{ paddingLeft: '20px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>{textos.labels.inicio}:</strong> {fecha.inicio}
                        </div>
                        <div>
                          <strong>{textos.labels.fin}:</strong> {fecha.fin}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>{textos.labels.inicio}:</strong> {textos.fechasFormateadas.inicio}
                    </div>
                    <div>
                      <strong>{textos.labels.fin}:</strong> {textos.fechasFormateadas.fin}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Servicio Afectado */}
            <div style={{ display: 'table', width: '100%', marginBottom: '12px', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#0065A6', 
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
                {textos.labels.servicio.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: '#f9f9f9', fontSize: '18px', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap' }}>
                {textos.servicioAfectado}
              </div>
            </div>
            
            {/* Periodo */}
            <div style={{ display: 'table', width: '100%', border: '1px solid #ddd' }}>
              <div style={{ 
                display: 'table-cell', 
                backgroundColor: '#0065A6', 
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
                {textos.labels.periodo}
              </div>
              <div style={{ display: 'table-cell', padding: '24px', backgroundColor: 'white', fontSize: '18px', fontFamily: 'Arial, sans-serif' }}>
                {textos.periodoAfectacion}{textos.notaAfectacion ? ` (${textos.notaAfectacion})` : ''}
              </div>
            </div>
          </div>
          
          {textos.mostrarMonitoreo && textos.tipoComunicado !== 'CANCELACION' && (
            <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px', fontFamily: 'Arial, sans-serif' }}>
              {textos.monitoreo.split('\n')[0]}<br/>
              {textos.monitoreo.split('\n')[1]}
            </p>
          )}
            </>
          )}
          
          <div style={{ backgroundColor: '#f0f0f0', padding: '24px', borderRadius: '10px', textAlign: 'center', fontSize: '18px', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {textos.contacto}<br/>
            {textos.correo} <span style={{ color: '#000000', textDecoration: 'none' }}>
              monitoreot@dinersclub.com.ec
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Campo de Formulario
const CampoFormulario = ({ label, children, style = {} }) => (
  <div style={{ ...styles.fieldGroup, ...style }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

// Componente Principal
const GeneradorComunicados = () => {
  const [formData, setFormData] = React.useState({
    empresa: EMPRESAS.INTERDIN,
    tipoComunicado: 'NORMAL', // NORMAL o CANCELACION
    actividad: '',
    periodos: [{
      fechaInicioDate: '',
      horaInicio: '',
      fechaFinDate: '',
      horaFin: ''
    }],
    servicioAfectado: '',
    periodoAfectacion: '',
    notaAfectacion: '',
    mostrarMonitoreo: true,
    multiplesDias: false,
    mensajeCancelacion: ''
  });
  const [mostrarVista, setMostrarVista] = React.useState(false);
  const [copiando, setCopiando] = React.useState(false);
  
  const textos = TRADUCCIONES[IDIOMAS.ES].formulario;
  
  // Agregar estilos de impresión
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #vista-comunicado-inner, #vista-comunicado-inner * {
          visibility: visible;
        }
        #vista-comunicado-inner {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Auto-calcular periodo
  React.useEffect(() => {
    if (formData.multiplesDias) {
      const periodoTotal = FormatoService.calcularPeriodoTotal(formData.periodos);
      if (periodoTotal) {
        setFormData(prev => ({ ...prev, periodoAfectacion: periodoTotal }));
      }
    } else {
      const periodo = formData.periodos[0];
      const periodoCalculado = FormatoService.calcularPeriodo(
        periodo.fechaInicioDate,
        periodo.horaInicio,
        periodo.fechaFinDate,
        periodo.horaFin
      );
      if (periodoCalculado) {
        setFormData(prev => ({ ...prev, periodoAfectacion: periodoCalculado }));
      }
    }
  }, [formData.periodos, formData.multiplesDias]);
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const updatePeriodo = (index, field, value) => {
    setFormData(prev => {
      const newPeriodos = [...prev.periodos];
      newPeriodos[index] = { ...newPeriodos[index], [field]: value };
      return { ...prev, periodos: newPeriodos };
    });
  };
  
  const agregarPeriodo = () => {
    setFormData(prev => ({
      ...prev,
      periodos: [...prev.periodos, {
        fechaInicioDate: '',
        horaInicio: '',
        fechaFinDate: '',
        horaFin: ''
      }]
    }));
  };
  
  const eliminarPeriodo = (index) => {
    if (formData.periodos.length > 1) {
      setFormData(prev => ({
        ...prev,
        periodos: prev.periodos.filter((_, i) => i !== index)
      }));
    }
  };
  
  const toggleMultiplesDias = (checked) => {
    if (!checked && formData.periodos.length > 1) {
      // Si se desmarca, mantener solo el primer periodo
      setFormData(prev => ({
        ...prev,
        multiplesDias: false,
        periodos: [prev.periodos[0]]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        multiplesDias: checked
      }));
    }
  };
  
  const validarFormulario = () => {
    if (formData.tipoComunicado === 'CANCELACION') {
      if (!formData.mensajeCancelacion) {
        alert('Por favor, ingrese el mensaje de cancelación');
        return false;
      }
      return true;
    }
    
    const camposRequeridos = ['actividad', 'servicioAfectado', 'periodoAfectacion'];
    
    if (!camposRequeridos.every(campo => formData[campo])) {
      alert(textos.alertas.camposIncompletos);
      return false;
    }
    
    // Validar periodos
    for (let i = 0; i < formData.periodos.length; i++) {
      const periodo = formData.periodos[i];
      if (!periodo.fechaInicioDate || !periodo.horaInicio || !periodo.fechaFinDate || !periodo.horaFin) {
        alert(`Por favor, complete todos los campos de fecha y hora del ${formData.multiplesDias ? `Día ${i + 1}` : 'periodo'}`);
        return false;
      }
      
      const inicio = new Date(periodo.fechaInicioDate + 'T' + periodo.horaInicio);
      const fin = new Date(periodo.fechaFinDate + 'T' + periodo.horaFin);
      
      if (fin <= inicio) {
        alert(`La fecha y hora de fin debe ser posterior a la fecha y hora de inicio en el ${formData.multiplesDias ? `Día ${i + 1}` : 'periodo'}`);
        return false;
      }
    }
    
    return true;
  };
  
  const generarComunicado = () => {
    if (validarFormulario()) {
      setMostrarVista(true);
    }
  };
  
  const limpiarFormulario = () => {
    setFormData({
      empresa: EMPRESAS.INTERDIN,
      tipoComunicado: 'NORMAL',
      actividad: '',
      periodos: [{
        fechaInicioDate: '',
        horaInicio: '',
        fechaFinDate: '',
        horaFin: ''
      }],
      servicioAfectado: '',
      periodoAfectacion: '',
      notaAfectacion: '',
      mostrarMonitoreo: true,
      multiplesDias: false,
      mensajeCancelacion: ''
    });
    setMostrarVista(false);
  };
  
  const cargarEjemplo = () => {
    if (formData.tipoComunicado === 'CANCELACION') {
      setFormData(prev => ({
        ...prev,
        mensajeCancelacion: 'Se informa que la ventana de trabajo prevista para el 23 y 24 de agosto, ha sido cancelada y será reagendada.\n\nGracias por su comprensión.'
      }));
    } else {
      setFormData({
        empresa: EMPRESAS.INTERDIN,
        tipoComunicado: 'NORMAL',
        actividad: 'Depuración semanal del Centro Autorizador (CAO)',
        periodos: [{
          fechaInicioDate: '2025-04-11',
          horaInicio: '23:00',
          fechaFinDate: '2025-04-12',
          horaFin: '03:00'
        }],
        servicioAfectado: 'Consumos realizados en redes propias y ajenas mediante el uso de tarjetas de crédito/débito.\n\nDurante la ventana, las transacciones serán procesadas por Standin',
        periodoAfectacion: '4 horas',
        notaAfectacion: 'Durante el mantenimiento se presentará intervalos de indisponibilidad en el servicio',
        mostrarMonitoreo: true,
        multiplesDias: false,
        mensajeCancelacion: ''
      });
    }
  };
  
  const exportarPDF = () => {
    setCopiando(true);
    
    // Usar la función print del navegador que permite guardar como PDF
    window.print();
    
    // Mostrar un mensaje de ayuda
    setTimeout(() => {
      alert(
        '📄 Exportar a PDF\n\n' +
        '1. En el diálogo de impresión, seleccione "Guardar como PDF" como destino\n' +
        '2. Ajuste las opciones si es necesario:\n' +
        '   • Orientación: Vertical\n' +
        '   • Márgenes: Ninguno o Mínimos\n' +
        '   • Escala: Ajustar a página\n' +
        '3. Haga clic en "Guardar" y elija la ubicación\n\n' +
        '💡 Tip: Una vez guardado el PDF, puede abrirlo y copiar la imagen desde allí para pegarla en WhatsApp, Email, etc.'
      );
      setCopiando(false);
    }, 100);
  };
  
  const fechaInicio = FormatoService.formatearFecha(
    formData.fechaInicioDate, 
    formData.horaInicio, 
    IDIOMAS.ES
  );
  const fechaFin = FormatoService.formatearFecha(
    formData.fechaFinDate, 
    formData.horaFin, 
    IDIOMAS.ES
  );
  
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.mainTitle}>{textos.titulo}</h1>
        
        <div style={styles.flexContainer}>
          {/* Panel de edición */}
          <div style={styles.editorPanel}>
            <h2 style={styles.sectionTitle}>{textos.datosDelComunicado}</h2>
            
            <div style={styles.infoBox}>
              {textos.infoTimezone}
            </div>
            
            <CampoFormulario label={textos.tipoComunicado}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: formData.tipoComunicado === 'NORMAL' ? '2px solid #0065A6' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: formData.tipoComunicado === 'NORMAL' ? '#e8f4f8' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name="tipoComunicado"
                    value="NORMAL"
                    checked={formData.tipoComunicado === 'NORMAL'}
                    onChange={(e) => updateField('tipoComunicado', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>{textos.tipoNormal}</span>
                </label>
                
                <label style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: formData.tipoComunicado === 'CANCELACION' ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: formData.tipoComunicado === 'CANCELACION' ? '#ffe8e8' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name="tipoComunicado"
                    value="CANCELACION"
                    checked={formData.tipoComunicado === 'CANCELACION'}
                    onChange={(e) => updateField('tipoComunicado', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>{textos.tipoCancelacion}</span>
                </label>
              </div>
            </CampoFormulario>
            
            <CampoFormulario label={textos.empresa}>
              <select 
                value={formData.empresa} 
                onChange={(e) => updateField('empresa', e.target.value)}
                style={styles.select}
              >
                <option value={EMPRESAS.INTERDIN}>{EMPRESAS.INTERDIN}</option>
                <option value={EMPRESAS.DINERS}>{EMPRESAS.DINERS}</option>
              </select>
            </CampoFormulario>
            
            {formData.tipoComunicado === 'CANCELACION' ? (
              <CampoFormulario label={textos.mensajeCancelacion}>
                <textarea
                  value={formData.mensajeCancelacion}
                  onChange={(e) => updateField('mensajeCancelacion', e.target.value)}
                  placeholder={textos.placeholders.mensajeCancelacion}
                  style={{ ...styles.textareaLarge, minHeight: '150px' }}
                />
              </CampoFormulario>
            ) : (
              <>
                <CampoFormulario label={textos.actividad}>
              <textarea
                value={formData.actividad}
                onChange={(e) => updateField('actividad', e.target.value)}
                placeholder={textos.placeholders.actividad}
                style={styles.textarea}
              />
            </CampoFormulario>
            
            <div style={{ ...styles.fieldGroup, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="multiplesDias"
                checked={formData.multiplesDias}
                onChange={(e) => toggleMultiplesDias(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="multiplesDias" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#0065A6' }}>
                {textos.multiplesDias}
              </label>
            </div>
            
            {formData.periodos.map((periodo, index) => (
              <div key={index} style={{ 
                marginBottom: '30px', 
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: formData.multiplesDias ? '2px solid #0065A6' : 'none'
              }}>
                {formData.multiplesDias && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#0065A6' }}>{textos.dia} {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => eliminarPeriodo(index)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {textos.eliminarDia}
                      </button>
                    )}
                  </div>
                )}
                
                <CampoFormulario label={textos.fechaHoraInicio}>
                  <div style={styles.dateTimeContainer}>
                    <input
                      type="date"
                      value={periodo.fechaInicioDate}
                      onChange={(e) => updatePeriodo(index, 'fechaInicioDate', e.target.value)}
                      style={styles.dateTimeInput}
                    />
                    <input
                      type="time"
                      value={periodo.horaInicio}
                      onChange={(e) => updatePeriodo(index, 'horaInicio', e.target.value)}
                      style={styles.dateTimeInput}
                    />
                  </div>
                  {periodo.fechaInicioDate && periodo.horaInicio && (
                    <div style={styles.preview}>
                      {textos.vistaPrevia} {FormatoService.formatearFecha(periodo.fechaInicioDate, periodo.horaInicio, IDIOMAS.ES)}
                    </div>
                  )}
                </CampoFormulario>
                
                <CampoFormulario label={textos.fechaHoraFin}>
                  <div style={styles.dateTimeContainer}>
                    <input
                      type="date"
                      value={periodo.fechaFinDate}
                      onChange={(e) => updatePeriodo(index, 'fechaFinDate', e.target.value)}
                      style={styles.dateTimeInput}
                    />
                    <input
                      type="time"
                      value={periodo.horaFin}
                      onChange={(e) => updatePeriodo(index, 'horaFin', e.target.value)}
                      style={styles.dateTimeInput}
                    />
                  </div>
                  {periodo.fechaFinDate && periodo.horaFin && (
                    <div style={styles.preview}>
                      {textos.vistaPrevia} {FormatoService.formatearFecha(periodo.fechaFinDate, periodo.horaFin, IDIOMAS.ES)}
                    </div>
                  )}
                </CampoFormulario>
              </div>
            ))}
            
            {formData.multiplesDias && (
              <button
                type="button"
                onClick={agregarPeriodo}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                {textos.agregarDia}
              </button>
            )}
            
            <CampoFormulario label={textos.servicioAfectado}>
              <textarea
                value={formData.servicioAfectado}
                onChange={(e) => updateField('servicioAfectado', e.target.value)}
                placeholder={textos.placeholders.servicioAfectado}
                style={styles.textareaLarge}
              />
            </CampoFormulario>
            
            <CampoFormulario label={textos.periodoAfectacion}>
              <input
                type="text"
                value={formData.periodoAfectacion}
                onChange={(e) => updateField('periodoAfectacion', e.target.value)}
                placeholder={textos.placeholders.periodoAfectacion}
                style={{
                  ...styles.input,
                  backgroundColor: formData.periodoAfectacion && formData.fechaInicioDate && formData.fechaFinDate ? '#f0f7ff' : 'white'
                }}
              />
              {formData.fechaInicioDate && formData.horaInicio && formData.fechaFinDate && formData.horaFin && (
                <div style={styles.autoCalculated}>
                  {textos.calculadoAutomaticamente}
                </div>
              )}
            </CampoFormulario>
              </>
            )}
            
            <CampoFormulario label={textos.notaAfectacion}>
              <input
                type="text"
                value={formData.notaAfectacion}
                onChange={(e) => updateField('notaAfectacion', e.target.value)}
                placeholder={textos.placeholders.notaAfectacion}
                style={styles.input}
              />
            </CampoFormulario>
            
            <div style={{ ...styles.fieldGroup, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="mostrarMonitoreo"
                checked={formData.mostrarMonitoreo}
                onChange={(e) => updateField('mostrarMonitoreo', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="mostrarMonitoreo" style={{ cursor: 'pointer', fontSize: '14px' }}>
                {textos.mostrarTextoMonitoreo}
              </label>
            </div>
            
            <div style={styles.buttonContainer}>
              <button
                onClick={generarComunicado}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                style={styles.primaryButton}
              >
                {textos.generarComunicado}
              </button>
              <button
                onClick={limpiarFormulario}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}
                style={styles.secondaryButton}
              >
                {textos.limpiar}
              </button>
            </div>
            
            <button
              onClick={cargarEjemplo}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              style={styles.exampleButton}
            >
              {textos.cargarEjemplo}
            </button>
            
            <div style={styles.warningBox}>
              {textos.infoTraduccion}
            </div>
          </div>
          
          {/* Panel de vista previa */}
          <div style={styles.previewContainer}>
            {mostrarVista ? (
              <>
                <div className="no-print" style={styles.previewHeader}>
                  <h3 style={styles.previewTitle}>{textos.vistaPreviaComunicado}</h3>
                  <button
                    onClick={exportarPDF}
                    disabled={copiando}
                    onMouseEnter={(e) => !copiando && (e.target.style.backgroundColor = '#1976d2')}
                    onMouseLeave={(e) => !copiando && (e.target.style.backgroundColor = '#2196F3')}
                    style={{
                      ...styles.exportPDFButton,
                      cursor: copiando ? 'wait' : 'pointer',
                      opacity: copiando ? 0.7 : 1
                    }}
                  >
                    {copiando ? textos.procesando : '📄 Exportar PDF'}
                  </button>
                </div>
                <div style={styles.previewWrapper}>
                  <VistaPreviaComunicado datos={formData} />
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                <h3>{textos.vistaPreviaComunicado}</h3>
                <p>{textos.completeCampos}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneradorComunicados;
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
