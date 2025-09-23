//servidor HTTP para Render (health check) 
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`Servidor HTTP rodando na porta ${PORT}`));

// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js'); 
const { parse, subDays } = require('date-fns');

const client = new Client({
    authStrategy: new LocalAuth()
});
client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', reason => {
    console.log('⚠️ Cliente desconectado:', reason);
});

// serviço de leitura do qr code
client.on('qr', qr => {
    console.log('📱 QR code gerado, escaneie com o celular.');
    qrcode.generate(qr, { small: true });
});

// apos isso ele diz que foi tudo certo
client.on('ready', () => {
    console.log('Cliente pronto e conectado!');
});

// E inicializa tudo 
client.initialize();
console.log('Cliente inicializando...');

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// ----------------- LISTA DE FERIADOS FIXOS -----------------
const feriadosFixos = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalhador
  '07-02', // Independência do Brasil
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '12-08', // dia de Nossa Senhora da Conceição da Praia
  '12-25'  // Natal
];

// Função para verificar se a data é inválida
function verificarDataInvalida(dataStr) {
  try {
    // Converter string "dd/MM/yyyy" para objeto Date
    const data = parse(dataStr, 'dd/MM/yyyy', new Date());

    // Extrair mês e dia no formato "MM-dd"
    const mesDia = String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');

    // Verificar se é feriado
    if (feriadosFixos.includes(mesDia)) return true;

    // Verificar 1 e 2 dias antes
    for (let i = 1; i <= 2; i++) {
      const anterior = subDays(data, i);
      const mesDiaAnterior = String(anterior.getMonth() + 1).padStart(2, '0') + '-' + String(anterior.getDate()).padStart(2, '0');
      if (feriadosFixos.includes(mesDiaAnterior)) return true;
    }

    return false;
  } catch (e) {
    return true; // caso formato seja inválido, já trata como inválido
  }
}

// ---------------- FUNIL -----------------
client.on('message', async msg => {
    // LOG PARA DEBUG
    console.log('Mensagem recebida de:', msg.from, 'corpo:', msg.body);

    if (msg.body.match(/dia|tarde|noite|oi|olá|ola/i) 
    && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000); 
        const contact = await msg.getContact(); 
        const name = contact.pushname; 
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ' Sou o assistente virtual da Procont. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Solicitação rescisão\n2 - Solicitação de férias\n3 - Solicitação Recalculo de imposto\n4 - Solicitação de Faturamento\n5 - Falar diretamente com atendente\n6 - Não precisa mais de atendimento'); 
        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(2000);   
    }

    // ---------------- SOLICITAÇÃO DE RECISSÃO ----------------
    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from,'Aviso prévio: \n\n7 - Aviso prévio trabalhado\n8 - Aviso prévio indenizado');

        if (msg.body !== null && msg.body === '7' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000); 
            await chat.sendStateTyping(); 
            await delay(1000);
            await client.sendMessage(msg.from, 'Informe nome do funcionário, data de início do aviso, e observações necessárias.');
            await delay(1000);
            await client.sendMessage(msg.from, 'Espere alguns instantes que uma atendente irá falar com o senhor(a)');
        } 
        if (msg.body !== null && msg.body === '8' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000); 
            await chat.sendStateTyping(); 
            await delay(1000);
            await client.sendMessage(msg.from, 'Informe nome do funcionário, data da demissão, e observações necessárias.');
            await delay(1000);
            await client.sendMessage(msg.from, 'Espere alguns instantes que uma atendente irá falar com o senhor(a)');
        } 
    }

    // ---------------- SOLICITAÇÃO DE FÉRIAS ----------------
    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Qual a data da solicitação de férias? (Formato: dd/MM/yyyy)');
    }

    // Quando cliente responder com uma data (dd/MM/yyyy)
    if (msg.body.match(/^\d{2}\/\d{2}\/\d{4}$/) && msg.from.endsWith('@c.us')) {
        const data = msg.body;

        if (verificarDataInvalida(data)) {
            await client.sendMessage(msg.from, `A data escolhida (${data}) não pode ser utilizada pois cai em um feriado ou até 2 dias antes de um feriado. Por favor, informe uma nova data (Formato: dd/MM/yyyy).`);
        } else {
            await client.sendMessage(msg.from, `Data registrada com sucesso: ${data}. Vamos prosseguir com a solicitação de férias.`);
        }
    }
 // ---------------- SOLICITAÇÃO DE RECALCULO DE IMPOSTO----------------
    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Informe qual o imposto e a data para pagamento.');
    }
    // ---------------- SOLICITAÇÃO DE FATURAMENTO----------------
    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Espere alguns instantes que uma atendente irá falar com o senhor(a)');
    }
// ---------------- FALAR DIRETAMENTE COM ATENDENTE----------------
    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Espere alguns instantes que uma atendente irá falar com o senhor(a)');
    }
// ---------------- CANCELOU----------------
    if (msg.body !== null && msg.body === '6' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Se você tiver outras dúvidas ou precisar de mais informações, por favor, fale aqui nesse whatsapp. Para acompanhar notícias sobre contabilidade, siga-nos no Instagram: https://www.instagram.com/procont.ba/profilecard/?igsh=NTBrOXBvdjJlcmZs ');
    }
});
