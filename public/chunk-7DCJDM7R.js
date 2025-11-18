import{o as p}from"./chunk-UGTTAIU5.js";import{Z as g,ba as m}from"./chunk-KP5MESBS.js";import{a as l,b as u,h as r}from"./chunk-FK42CRUA.js";var f=class d{constructor(a){this.db=a}crearTurno(a){return r(this,null,function*(){let{error:i}=yield this.db.cliente.from("turnos").insert([a]);if(i)throw new Error(i.message);return!0})}obtenerTurnosPorUsuario(a,i){return r(this,null,function*(){let e=null,t=null;if(i==="paciente"?{data:e,error:t}=yield this.db.cliente.from("turnos").select(`
      *,
      especialidad:especialidades ( * ),
      especialista:id_especialista ( * ),
      paciente:id_paciente ( * ),
      encuesta:id_encuesta (*),
      historia_clinica:id_historia_clinica (*)
    `).eq("id_paciente",a).order("dia",{ascending:!1}).order("hora",{ascending:!0}):i==="especialista"?{data:e,error:t}=yield this.db.cliente.from("turnos").select(`
      *,
      especialidad:especialidades ( * ),
      especialista:id_especialista ( * ),
      paciente:id_paciente ( * ),
      encuesta:id_encuesta (*),
      historia_clinica:id_historia_clinica (*)
    `).eq("id_especialista",a).order("dia",{ascending:!1}).order("hora",{ascending:!0}):{data:e,error:t}=yield this.db.cliente.from("turnos").select(`
        *,
        especialidad:especialidades ( * ),
        paciente:id_paciente ( * ),
        especialista:id_especialista ( * ),
        encuesta:id_encuesta (*),
        historia_clinica:id_historia_clinica (*)
      `).order("dia",{ascending:!1}).order("hora",{ascending:!0}),t)throw new Error(t.message);return e||[]})}actualizarEstadoTurno(a,i){return r(this,null,function*(){let{error:e}=yield this.db.cliente.from("turnos").update({estado:i}).eq("id",a);if(e)throw new Error(e.message);return!0})}actualizarTurnoCancelado(a,i,e){return r(this,null,function*(){let{error:t}=yield this.db.cliente.from("turnos").update({estado:i,motivo_cancelacion:e}).eq("id",a);if(t)throw new Error(t.message);return!0})}actualizarTurnoRechazado(a,i,e){return r(this,null,function*(){let{error:t}=yield this.db.cliente.from("turnos").update({estado:i,motivo_rechazo:e}).eq("id",a);if(t)throw new Error(t.message);return!0})}actualizarCalificarAtencion(a,i){return r(this,null,function*(){let{error:e}=yield this.db.cliente.from("turnos").update({calificar_atencion:i}).eq("id",a);if(e)throw new Error(e.message);return!0})}actualizarEncuesta(a,i){return r(this,null,function*(){let{error:e}=yield this.db.cliente.from("turnos").update({id_encuesta:i}).eq("id",a);if(e)throw new Error(e.message);return!0})}actualizarHistoriaClinica(a,i){return r(this,null,function*(){let{error:e}=yield this.db.cliente.from("turnos").update({id_historia_clinica:i}).eq("id",a);if(e)throw new Error(e.message);return!0})}actualizarTurnoFinalizado(a,i,e){return r(this,null,function*(){let{error:t}=yield this.db.cliente.from("turnos").update({estado:i,resena:e}).eq("id",a);if(t)throw new Error(t.message);return!0})}obtenerTurnosProx15Dias(a,i){return r(this,null,function*(){let e=new Date,t=new Date(e),o=new Date(e);o.setDate(e.getDate()+15);let n="id_especialista";i==="paciente"&&(n="id_paciente");let{data:s,error:c}=yield this.db.cliente.from("turnos").select("dia, hora").eq(n,a).gte("dia",t.toISOString().slice(0,10)).lte("dia",o.toISOString().slice(0,10));if(c)throw new Error(c.message);return s??[]})}obtenerPacientesDeEspecialista(a){return r(this,null,function*(){let{data:i,error:e}=yield this.db.cliente.from("turnos").select("paciente:id_paciente ( * )").eq("id_especialista",a).eq("estado","finalizado").order("dia",{ascending:!1}).order("hora",{ascending:!0});if(e)throw new Error(e.message);let t=[],o=new Set;for(let n of i??[]){let s=n.paciente;if(s&&!o.has(s.id)){o.add(s.id);let c=u(l({},s),{imagen_1_path:s.imagen_1_path?this.db.cliente.storage.from("images").getPublicUrl(s.imagen_1_path).data.publicUrl:null,imagen_2_path:s.imagen_2_path?this.db.cliente.storage.from("images").getPublicUrl(s.imagen_2_path).data.publicUrl:null});t.push(c)}}return t})}obtenerTurnosFinalizadosPaciente(a){return r(this,null,function*(){let{data:i,error:e}=yield this.db.cliente.from("turnos").select(`
      *,
      especialidad:especialidades ( * ),
        paciente:id_paciente ( * ),
        especialista:id_especialista ( * ),
        historia_clinica:id_historia_clinica (*)
    `).eq("id_paciente",a).eq("estado","finalizado").not("id_historia_clinica","is",null).order("dia",{ascending:!0}).order("hora",{ascending:!0});if(e)throw new Error(e.message);return i??[]})}obtenerCantidadTurnosPorEspecialidad(){return r(this,null,function*(){let{data:a,error:i}=yield this.db.cliente.from("turnos").select("especialidad:especialidades ( * )").eq("estado","finalizado");if(i)throw new Error(i.message);let e=a,t=new Map;for(let o of e??[]){let n=o.especialidad.nombre;t.set(n,(t.get(n)??0)+1)}return Array.from(t,([o,n])=>({nombre:o,cantidad:n}))})}obtenerCantidadTurnosPorDia(){return r(this,null,function*(){let{data:a,error:i}=yield this.db.cliente.from("turnos").select("dia").eq("estado","finalizado").order("dia",{ascending:!0});if(i)throw new Error(i.message);let e=a,t=new Map;for(let o of e??[]){let n=o.dia;t.set(n,(t.get(n)??0)+1)}return Array.from(t,([o,n])=>{let s=new Date(o);return{dia:`${s.getDate().toString().padStart(2,"0")}/${(s.getMonth()+1).toString().padStart(2,"0")}/${s.getFullYear()}`,cantidad:n}})})}static \u0275fac=function(i){return new(i||d)(m(p))};static \u0275prov=g({token:d,factory:d.\u0275fac,providedIn:"root"})};export{f as a};
