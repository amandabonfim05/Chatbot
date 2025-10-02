require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const qrcode = require('qrcode-terminal');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const { parse, subDays } = require('date-fns');

// ----------------- SERVIDOR HTTP -----------------
app.get('/health', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`Servidor HTTP rodando na porta ${PORT}`));

// ----------------- FUNÇÃO DE DELAY -----------------
const delay = ms => new Promise(res => setTimeout(res, ms));

// ----------------- LISTA DE FERIADOS FIXOS -----------------
const feriadosFixos = [
  '01-01', '04-21', '05-01', '07-02',
  '09-07', '10-12', '11-02', '11-15',
  '12-08', '12-25'
];

// ----------------- FUNÇÃO DE VERIFICAÇÃO DE DATA -----------------
function verificarDataInvalida(dataStr) {
    try {
        const data = parse(dataStr, 'dd/MM/yyyy', new Date());
        const mesDia = String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');

        if (feriadosFixos.includes(mesDia)) return true;

        for (let i = 1; i <= 2; i++) {
            const anterior = subDays(data, i);
            const mesDiaAnterior = String(anterior.getMonth() + 1).padStart(2, '0') + '-' + String(anterior.getDate()).padStart(2, '0');
            if (feriadosFixos.includes(mesDiaAnterior)) return true;
        }

        return false;
    } catch {
        return true;
    }
}

// ----------------- CONEXÃO COM MONGODB -----------------
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('✅ Conectado ao MongoDB');

    // ----------------- CRIAR MONGOSTORE -----------------
    const store = new MongoStore({ mongoose });

    // ----------------- INICIALIZAÇÃO DO CLIENTE -----------------
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('auth_failure', msg => console.error('❌ Falha na autenticação:', msg));
    client.on('disconnected', reason => console.log('⚠️ Cliente desconectado:', reason));
    client.on('qr', qr => { 
        console.log('QR code gerado, escaneie com o celular.');
        qrcode.generate(qr, { small: true });
    });
    client.on('ready', () => console.log('Cliente pronto e conectado!'));

    client.initialize();

    // ----------------- FUNIL DE MENSAGENS -----------------
    client.on('message', async msg => {
        console.log('Mensagem recebida de:', msg.from, 'corpo:', msg.body);

        if (msg.body.match(/dia|tarde|noite|oi|olá|ola|procont/i) && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000); 
            await chat.sendStateTyping(); 
            await delay(1000); 
            const contact = await msg.getContact(); 
            const name = contact.pushname || "Usuário";
            await client.sendMessage(msg.from,
                `Olá! ${name.split(" ")[0]} Sou o assistente virtual da Procont. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Solicitação rescisão\n2 - Solicitação de férias\n3 - Solicitação Recalculo de imposto\n4 - Solicitação de Faturamento\n5 - Falar diretamente com atendente\n6 - Não precisa mais de atendimento`
            ); 
            await delay(1000); 
            await chat.sendStateTyping(); 
            await delay(2000);
        }

        // ----------------- SOLICITAÇÃO DE RECISÃO -----------------
        if (msg.body === '1' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from,'Aviso prévio: \n\n7 - Aviso prévio trabalhado\n8 - Aviso prévio indenizado');
            
        }
            if (msg.body === '7' && msg.from.endsWith('@c.us')) {
                const chat = await msg.getChat();
                await delay(1000);
                await chat.sendStateTyping();
                await delay(1000);
                await client.sendMessage(msg.from,'Informe nome do funcionário, data de início do aviso, e observações necessárias.');
                await delay(1000);
                await client.sendMessage(msg.from,'Em breve um atendente irá falar com o(a) senhor(a)');
            }
            
            if (msg.body === '8' && msg.from.endsWith('@c.us')) {
                const chat = await msg.getChat();
                await delay(1000);
                await chat.sendStateTyping();
                await delay(1000);
                await client.sendMessage(msg.from,'Informe nome do funcionário, data da demissão, e observações necessárias.');
                await delay(1000);
                await client.sendMessage(msg.from,'Em breve um atendente irá falar com o(a) senhor(a)');
            }

        // ----------------- SOLICITAÇÃO DE FÉRIAS -----------------
        if (msg.body === '2' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Qual a data da solicitação de férias? (Formato: dd/MM/yyyy)');
        }

        if (msg.body.match(/^\d{2}\/\d{2}\/\d{4}$/) && msg.from.endsWith('@c.us')) {
            const data = msg.body;
            if (verificarDataInvalida(data)) {
                await client.sendMessage(msg.from, `A data escolhida (${data}) não pode ser utilizada pois cai em um feriado ou até 2 dias antes de um feriado. Por favor, informe uma nova data (Formato: dd/MM/yyyy).`);
            } else {
                await client.sendMessage(msg.from, `Data registrada com sucesso: ${data}. Vamos prosseguir com a solicitação de férias.`);
                await delay(1000);
                await client.sendMessage(msg.from, 'Qual o nome do funcionário?');
                await delay(1000);
                await client.sendMessage(msg.from, 'Em breve enviaremos a documentação solicitada.');
        
            }
        }

        // ----------------- SOLICITAÇÃO DE RECÁLCULO -----------------
        if (msg.body === '3' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Informe qual o imposto e a data para pagamento.');
            await delay(1000);
            await client.sendMessage(msg.from,'Em breve um atendente irá falar com o(a) senhor(a)');
        }

        // ----------------- SOLICITAÇÃO DE FATURAMENTO -----------------
        if (msg.body === '4' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Qual o período do faturamento?');
            await delay(1000);
            await client.sendMessage(msg.from,'Em breve enviaremos a documentação solicitada.');
        }

        // ----------------- FALAR COM ATENDENTE -----------------
        if (msg.body === '5' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Em breve um atendente irá falar com o(a) senhor(a)');
        }

        // ----------------- CANCELAMENTO -----------------
        if (msg.body === '6' && msg.from.endsWith('@c.us')) {
            const chat = await msg.getChat();
            await delay(1000);
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from,
                'Se você tiver outras dúvidas ou precisar de mais informações, por favor, fale aqui nesse whatsapp. Para acompanhar notícias sobre contabilidade, siga-nos no Instagram: https://www.instagram.com/procont.ba/profilecard/?igsh=NTBrOXBvdjJlcmZs'
            );
        }
    });

})
.catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));
