import{n as l}from"./chunk-OCRCOVDF.js";import{V as s,Z as o}from"./chunk-LG46M2DO.js";import{h as n}from"./chunk-FK42CRUA.js";var c=class a{constructor(i){this.db=i}crearTurno(i){return n(this,null,function*(){let{error:e}=yield this.db.cliente.from("turnos").insert([i]);if(e)throw new Error(e.message);return!0})}obtenerTurnosPorUsuario(i,e){return n(this,null,function*(){let t=null,r=null;if(e==="paciente"?{data:t,error:r}=yield this.db.cliente.from("turnos").select(`
      *,
      especialidades ( nombre ),
      id_especialista ( nombre, apellido )
    `).eq("id_paciente",i):e==="especialista"?{data:t,error:r}=yield this.db.cliente.from("turnos").select(`
      *,
      especialidades ( nombre ),
      id_paciente ( nombre, apellido )
    `).eq("id_especialista",i):{data:t,error:r}=yield this.db.cliente.from("turnos").select(`
        *,
        especialidades ( nombre ),
        id_paciente ( nombre, apellido ),
        id_especialista ( nombre, apellido )
      `),r)throw new Error(r.message);return t||[]})}static \u0275fac=function(e){return new(e||a)(o(l))};static \u0275prov=s({token:a,factory:a.\u0275fac,providedIn:"root"})};export{c as a};
