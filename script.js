const WHATSAPP_NUMBER = '5599999999999';
const servicos = [
  { nome: 'Corte', preco: 30, duracao: 40 },
  { nome: 'Barba', preco: 20, duracao: 30 },
  { nome: 'Corte + barba', preco: 50, duracao: 70 },
  { nome: 'Corte + pigmentação', preco: 50, duracao: 80 },
  { nome: 'Pezinho', preco: 10, duracao: 10 },
  { nome: 'Sobrancelha', preco: 10, duracao: 15 },
  { nome: 'luzes', preco: 90, duracao: 60 },
  { nome: 'platinado', preco: 100, duracao: 80 },
  { nome: 'Pomada modeladora', preco: 25,},
  { nome: 'Gel cola', preco: 30, },
  { nome: 'minoxídil', preco: 30, },
];
const horariosBase = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];
const indisponiveis = {};

const form = document.getElementById('agendamentoForm');
const servicoContainer = document.getElementById('servico');
const erroMsg = document.getElementById('erroMsg');
const btnLimpar = document.getElementById('btnLimpar');
const dateSelector = document.getElementById('dateSelector');
const timeGrid = document.getElementById('timeGrid');
const agendaInfo = document.getElementById('agendaInfo');
const dataInput = document.getElementById('data');
const horarioInput = document.getElementById('horario');
const barbeiroInput = document.getElementById('barbeiro');
const resumoServicos = document.getElementById('resumoServicos');
const resumoBarbeiro = document.getElementById('resumoBarbeiro');
const resumoData = document.getElementById('resumoData');
const resumoHorario = document.getElementById('resumoHorario');
const totalPrice = document.getElementById('totalPrice');
const tempoEstimado = document.getElementById('tempoEstimado');

let selectedDate = '';
let selectedTime = '';

function formatCurrency(v){return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function formatDateLabel(dateStr){if(!dateStr) return 'Selecione'; return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');}
function getServicosMarcados(){return [...document.querySelectorAll('input[name="servico"]:checked')].map(input => servicos.find(item => item.nome === input.value)).filter(Boolean);}

function getDuracaoTotal(){

const servicosMarcados = getServicosMarcados()

return servicosMarcados.reduce((total,s)=>{
return total + Number(s.duracao || 0)
},0)

}

function updateSelectedBarber(){
  const selected = document.querySelector('input[name="barbeiro_card"]:checked');
  const barberName = selected ? selected.value : 'Marcin';
  barbeiroInput.value = barberName;
  resumoBarbeiro.textContent = barberName;
  document.querySelectorAll('.barber-option').forEach(card => {
    const input = card.querySelector('input');
    card.classList.toggle('selected', input.checked);
  });
}

function atualizarResumo(){
  const marcados = getServicosMarcados();
  const total = marcados.reduce((acc, item) => acc + Number(item.preco || 0), 0);
  const duracao = marcados.reduce((acc, item) => acc + Number(item.duracao || 0), 0);
  resumoServicos.textContent = marcados.length ? marcados.map(item => item.nome).join(', ') : 'Nenhum';
  resumoData.textContent = selectedDate ? formatDateLabel(selectedDate) : 'Selecione';
  resumoHorario.textContent = selectedTime || 'Selecione';
  totalPrice.textContent = formatCurrency(total);
  tempoEstimado.textContent = (duracao || 0) + ' min';
}

function preencherServicos(){
  servicoContainer.innerHTML = '';
  servicos.forEach((servico, index) => {
    const label = document.createElement('label');
    label.className = 'service-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'servico';
    input.value = servico.nome;
    input.id = `servico-${index}`;
    const check = document.createElement('div');
    check.className = 'service-check';
    const info = document.createElement('div');
    info.className = 'service-info';
    info.innerHTML = `<strong>${servico.nome}</strong><span>${servico.duracao} min</span>`;
    const price = document.createElement('div');
    price.className = 'service-price';
    price.textContent = formatCurrency(Number(servico.preco || 0));
    input.addEventListener('change', () => {
  label.classList.toggle('selected', input.checked);
  atualizarResumo();
  renderTimeSlots();
});
    label.appendChild(input);
    label.appendChild(check);
    label.appendChild(info);
    label.appendChild(price);
    servicoContainer.appendChild(label);
  });
}

function renderDateSelector(){
  dateSelector.innerHTML = '';
  const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const today = new Date();
  for(let i=0;i<7;i++){
    const date = new Date(today);
    date.setDate(today.getDate()+i);
    const iso = date.toISOString().split('T')[0];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'date-card';
    card.innerHTML = `<small>${weekDays[date.getDay()]}</small><strong>${String(date.getDate()).padStart(2,'0')}</strong><span>${monthNames[date.getMonth()]}</span>`;
    if(selectedDate === iso || (!selectedDate && i === 0)){
      selectedDate = iso;
      dataInput.value = iso;
      card.classList.add('active');
    }
    card.addEventListener('click', () => {
      selectedDate = iso;
      dataInput.value = iso;
      selectedTime = '';
      horarioInput.value = '';
      document.querySelectorAll('.date-card').forEach(el => el.classList.remove('active'));
      card.classList.add('active');
      renderTimeSlots();
      atualizarResumo();
    });
    dateSelector.appendChild(card);
  }
}

function getUnavailableTimes(dateStr){
  if(!dateStr) return [];
  return indisponiveis[new Date(dateStr + 'T00:00:00').getDay()] || [];
}

async function getHorariosOcupados(data){

if(!window.firebaseDB) return [];

let barbeiroSelecionado =
document.querySelector('input[name="barbeiro_card"]:checked')?.value || 'Marcin';

let snap = await firebaseDB
.collection("agendamentos")
.where("data","==",data)
.where("barbeiro","==",barbeiroSelecionado)
.get();

let ocupados=[];

snap.forEach(doc=>{
ocupados.push(doc.data().horario);
});

return ocupados;

}

async function renderTimeSlots(){

  timeGrid.innerHTML = '';

  if(!selectedDate){
    agendaInfo.textContent = 'Escolha um dia para ver os horários.';
    return;
  }

  const unavailable = getUnavailableTimes(selectedDate);
  const ocupados = await getHorariosOcupados(selectedDate);

  agendaInfo.textContent = `Horários disponíveis para ${formatDateLabel(selectedDate)}.`;
const duracaoServico = getDuracaoTotal();

if(duracaoServico === 0){
duracaoServico = 30;
}

const indexAtual = horariosBase.indexOf(hora);

const blocos = Math.ceil(duracaoServico / 30);
  horariosBase.forEach(hora => {

    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';

    const duracaoServico = getDuracaoTotal();

const indexAtual = horariosBase.indexOf(hora);

// calcula quantos blocos de 30min o serviço ocupa
const blocos = Math.ceil(duracaoServico / 30);

let conflito = false;

for(let i=1;i<blocos;i++){

const prox = horariosBase[indexAtual + i];

if(ocupados.includes(prox)){
conflito = true;
}

}

    btn.innerHTML = `<div><strong>${hora}</strong><span>${unavailable.includes(hora) || ocupados.includes(hora) ? 'indisponível' : 'disponível'}</span></div>`;

    // BLOQUEIA horários indisponíveis ou já agendados
    if(unavailable.includes(hora) || ocupados.includes(hora) || conflito){
      btn.classList.add('unavailable');
      btn.disabled = true;
    }

    if(selectedTime === hora) btn.classList.add('selected');

    btn.addEventListener('click', () => {

      if(btn.disabled) return;

      selectedTime = hora;
      horarioInput.value = hora;

      document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));

      btn.classList.add('selected');

      atualizarResumo();

    });

    timeGrid.appendChild(btn);

  });

}

function limparFormulario(){
  form.reset();
  document.querySelectorAll('input[name="servico"]').forEach(input => {
    input.checked = false;
    input.closest('.service-option')?.classList.remove('selected');
  });
  const firstBarber = document.querySelector('input[name="barbeiro_card"]');
  if(firstBarber) firstBarber.checked = true;
  erroMsg.style.display = 'none';
  selectedTime = '';
  horarioInput.value = '';
  selectedDate = '';
  updateSelectedBarber();
  renderDateSelector();
  renderTimeSlots();
  atualizarResumo();
}

document.querySelectorAll('input[name="barbeiro_card"]').forEach(input =>
input.addEventListener('change', () => {

updateSelectedBarber();
renderTimeSlots(); // atualiza horários do barbeiro
atualizarResumo();

})
);

btnLimpar.addEventListener('click', limparFormulario);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const pagamento = document.getElementById('pagamento').value;
  const barbeiro = document.querySelector('input[name="barbeiro_card"]:checked')?.value || 'Marcin';
  const observacoes = document.getElementById('observacoes').value.trim();
  const servicosMarcados = getServicosMarcados();
  const total = servicosMarcados.reduce((acc, item) => acc + Number(item.preco || 0), 0);
  const duracao = servicosMarcados.reduce((acc, item) => acc + Number(item.duracao || 0), 0);

  if(!nome || !selectedDate || !selectedTime || !servicosMarcados.length || !pagamento){
    erroMsg.style.display = 'block';
    return;
  }
  erroMsg.style.display = 'none';

  const mensagem = [
    'Olá! Quero fazer um agendamento na Barbearia Du Marcin. ✂️',
    '',
    '*Dados do cliente*',
    `Nome: ${nome}`,
    `Telefone: ${telefone || 'Não informado'}`,
    '',
    '*Agendamento*',
    `Data: ${formatDateLabel(selectedDate)}`,
    `Horário: ${selectedTime}`,
    `Serviços: ${servicosMarcados.map(item => `${item.nome} (${formatCurrency(Number(item.preco || 0))})`).join(', ')}`,
    `Barbeiro: ${barbeiro}`,
    `Tempo estimado: ${duracao} min`,
    `Total estimado: ${formatCurrency(total)}`,
    `Forma de pagamento: ${pagamento}`,
    `Observações: ${observacoes || 'Nenhuma'}`
  ].join('\n');

  
  salvarAgendamento({
    nome,
    telefone,
    data: selectedDate,
    horario: selectedTime,
    barbeiro,
    servicos: servicosMarcados.map(s=>s.nome),
    total,
    pagamento
  });

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, '_blank');

});

updateSelectedBarber();
preencherServicos();
renderDateSelector();
renderTimeSlots();
atualizarResumo();


/* ===============================
SALVAR AGENDAMENTO (Firebase ou LocalStorage)
=============================== */

async function salvarAgendamento(dados){

const db = window.firebaseDB

if(!db){
alert("Erro: Firebase não conectado")
return
}

const check = await db.collection("agendamentos")
.where("data","==",dados.data)
.where("horario","==",dados.horario)
.where("barbeiro","==",dados.barbeiro)
.get()

if(!check.empty){
alert("Esse horário já foi reservado para esse barbeiro.")
return
}

await db.collection("agendamentos").add({
...dados,
criadoEm: new Date()
})

alert("Agendamento realizado!")

renderTimeSlots()

}


// BOTÃO ADMIN OCULTO

let adminVisible = false;

document.addEventListener("keydown", function(e){

// combinação secreta CTRL + SHIFT + A
if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a"){

adminVisible = !adminVisible;

const btn = document.getElementById("adminReset");

btn.style.display = adminVisible ? "block" : "none";

}

});

document.getElementById("adminReset").addEventListener("click", ()=>{

if(!confirm("Deseja apagar todos os agendamentos de teste?")) return;

// limpa localStorage
localStorage.removeItem("agendamentos");

// se tiver Firebase também limpa interface
alert("Agendamentos locais apagados!");

renderTimeSlots();

});



async function carregarHorarios(data, barbeiro){

const db = window.firebaseDB

const snap = await db.collection("agendamentos")
.where("data","==",data)
.where("barbeiro","==",barbeiro)
.get()

const ocupados = []

snap.forEach(doc=>{
ocupados.push(doc.data().horario)
})

return ocupados

}
