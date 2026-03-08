
const USER="marcin";
const PASS="marcin2026";

function login(){

let u=document.getElementById("user").value;
let p=document.getElementById("pass").value;

if(u===USER && p===PASS){

localStorage.setItem("admin","1");
location.href="painel.html";

}else{

document.getElementById("erro").innerText="Login inválido";

}

}

function logout(){

localStorage.removeItem("admin");
location.href="login.html";

}

if(location.pathname.includes("painel.html")){

if(localStorage.getItem("admin")!=="1"){

location.href="login.html";

}

carregar();

}

async function carregar(){

let lista=[];

if(window.firebaseDB){

let snap=await firebaseDB.collection("agendamentos").get();

snap.forEach(doc=>{

lista.push(doc.data());

});

}else{

lista=JSON.parse(localStorage.getItem("agendamentos")||"[]");

}

let tbody=document.getElementById("lista");

tbody.innerHTML="";

lista.forEach((a,i)=>{

let tr=document.createElement("tr");

tr.innerHTML=`
<td>${a.nome}</td>
<td>${a.telefone||""}</td>
<td>${a.data}</td>
<td>${a.horario}</td>
<td>${(a.servicos||[]).join(",")}</td>
<td><button onclick="remover(${i})">Cancelar</button></td>
`;

tbody.appendChild(tr);

});

}

function remover(i){

let lista=JSON.parse(localStorage.getItem("agendamentos")||"[]");

lista.splice(i,1);

localStorage.setItem("agendamentos",JSON.stringify(lista));

location.reload();

}

function bloquearHorario() {
  const data = document.getElementById("dataBloqueio").value;
  const hora = document.getElementById("horaBloqueio").value;
  const barbeiro = document.getElementById("barbeiroBloqueio").value;

  db.collection("bloqueios").add({
    data: data,
    hora: hora,
    barbeiro: barbeiro
  });

  alert("Horário bloqueado!");
}


function bloquearDia() {
  const data = document.getElementById("diaBloqueado").value;

  db.collection("diasBloqueados").add({
    data: data
  });

  alert("Dia bloqueado!");
}


async function carregarAgendaHoje(){

const hoje = new Date().toISOString().split("T")[0]

const db = window.firebaseDB

const snap = await db.collection("agendamentos")
.where("data","==",hoje)
.get()

const lista = document.getElementById("agendaHoje")

lista.innerHTML = ""

snap.forEach(doc=>{

const a = doc.data()

lista.innerHTML += `
<div class="itemAgenda">
<b>${a.horario}</b> - ${a.nome} <br>
Barbeiro: ${a.barbeiro}
<button onclick="cancelar('${doc.id}')">Cancelar</button>
</div>
`

})

}

async function cancelar(id){

const db = window.firebaseDB

await db.collection("agendamentos")
.doc(id)
.delete()

alert("Agendamento cancelado")

location.reload()

}
