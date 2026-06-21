const {
  Client,
  GatewayIntentBits,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  REST,
  Routes,
  ApplicationCommandType
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ⚠️ COLOQUE O ID DO SEU BOT AQUI (ESSENCIAL PARA VIRAR APP)
const CLIENT_ID = '1518042580741390437'; 

const ID_DO_SERVIDOR = '1518042580741390437';
const CANAL_APROVACAO = '1518038258922160138';
const CANAL_APROVADOS = '1518038002939461785';
const CANAL_RECUSADOS = '1518038002939461785';
const CARGO_APROVADOR = '1518037419339812955';

const UNIDADES = {
  GAM: { codigo: 'GAMBS53453', cargo: '1474254662583451709' },
  CBMERJ: { codigo: 'CBMERJBS32834', cargo: '1507573577224945844' },
  BOPE: { codigo: 'BOPEBS38457', cargo: '1472933428835123342' },
  RECOM: { codigo: 'RECOMBS23745', cargo: '1472933947074941101' },
  BPCHQ: { codigo: 'CHOQUEBS37238', cargo: '1472933561513283666' },
  PF: { codigo: 'PFBS37284', cargo: '1472933271137423394' },
  PRF: { codigo: 'PRFBS38248', cargo: '1472935135581044889' },
  PMERJ: { codigo: 'PMERJBS37234', cargo: '1472933106381226035' }
};

const PATENTES = {
  "Coronel": { cargo: "1474226455729668156", prefixo: "[✵ ✵ ✵]" },
  "Tenente-Coronel": { cargo: "1474226912934232239", prefixo: "[✵ ✵ ✧]" },
  "Major": { cargo: "1512085315177807882", prefixo: "[✷✧✧]" },
  "Capitão": { cargo: "1474228200694616176", prefixo: "[✧ ✧ ✧]" },
  "1º Tenente": { cargo: "1474228316100886702", prefixo: "[✧ ✧]" },
  "2º Tenente": { cargo: "1474228418420670596", prefixo: "[✧]" },
  "Aspirante": { cargo: "1474228707173601330", prefixo: "[✯]" },
  "Subtenente": { cargo: "1474229761550061629", prefixo: "[▵]" },
  "1º Sargento": { cargo: "1474230092631642215", prefixo: "[❯❯❯ ❯❯]" },
  "2º Sargento": { cargo: "1474230277957222420", prefixo: "[❯❯❯ ❯]" },
  "3º Sargento": { cargo: "1474230429350363166", prefixo: "[❯❯❯]" },
  "Cabo": { cargo: "1474230554453872680", prefixo: "[❯❯]" },
  "Soldado": { cargo: "1474230626231259207", prefixo: "[❯]" },
  "Al Soldado": { cargo: "1474230926836895876", prefixo: "[❯]" },
  "Del.G": { cargo: "1474245562793721997", prefixo: "Del.G" },
  "Delg.": { cargo: "1474245639700221962", prefixo: "Delg." },
  "Esc.": { cargo: "1474245777621782620", prefixo: "Esc." },
  "Insp.": { cargo: "1474245842260197570", prefixo: "Insp." },
  "Agnt 1º Clss": { cargo: "1474246195517063168", prefixo: "Agnt 1º Clss" },
  "Agnt 2º Clss": { cargo: "1474246300085125140", prefixo: "Agnt 2º Clss" },
  "Agnt 3º Clss": { cargo: "1474246381895028847", prefixo: "Agnt 3º Clss" },
  "Aluno": { cargo: "1474249202174263458", prefixo: "Aluno" }
};

let registros = new Map();

if (fs.existsSync('./registros.json')) {
  const dados = JSON.parse(fs.readFileSync('./registros.json', 'utf8'));
  registros = new Map(Object.entries(dados));
}

function salvarRegistros() {
  fs.writeFileSync(
    './registros.json',
    JSON.stringify(Object.fromEntries(registros), null, 2)
  );
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} online montando escopo de App.`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    // Forçando o comando a ser registrado com os novos tipos de integração de UI integrada do Discord
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: [
          {
            name: 'painel',
            description: 'Abre o formulário de liberação corporativa.',
            type: ApplicationCommandType.ChatInput,
            integration_types: [0, 1], 
            contexts: [0, 1, 2]        
          }
        ]
      }
    );
    console.log('✅ Modo de comando integrado injetado globalmente!');
  } catch (error) {
    console.error('Erro no registro global:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'painel') {
      const embed = new EmbedBuilder()
        .setTitle('SOLICITAÇÃO DE LIBERAÇÃO')
        .setDescription(`Clique no botão abaixo para preencher o formulário.`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('abrir_registro_app')
          .setLabel('Solicitar Liberação')
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ETAPA 1: O Bot abre a tela flutuante de coleta textual
    if (interaction.isButton() && interaction.customId === 'abrir_registro_app') {
      const modal = new ModalBuilder()
        .setCustomId('modal_etapa_1')
        .setTitle('Solicitação de Liberação');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('rg').setLabel('Qual é o seu ID na cidade? *').setPlaceholder('Lembrando que são no máximo 8 números, ex: 2').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('nome').setLabel('Qual é o nome e sobrenome do seu personagem? *').setPlaceholder('ex: Freezy Andre').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('recrutador').setLabel('Qual o QRA do seu recrutador? *').setPlaceholder('ex: Freezy Andre | 0000').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    // ETAPA 2: Forçando a transição imediata para o menu de setinha (Dropdown)
    if (interaction.isModalSubmit() && interaction.customId === 'modal_etapa_1') {
      const userId = interaction.user.id;
      
      registros.set(userId, {
        rg: interaction.fields.getTextInputValue('rg'),
        nome: interaction.fields.getTextInputValue('nome'),
        recrutador: interaction.fields.getTextInputValue('recrutador'),
        unidade: "PMERJ", // Define PMERJ como padrão para carregar as patentes militares
        patente: null
      });
      salvarRegistros();

      // Gerando a lista de patentes militares para a setinha (Igual ao seu print)
      const menuPatente = new StringSelectMenuBuilder()
        .setCustomId(`app_select_patente_${userId}`)
        .setPlaceholder('Selecione sua patente')
        .addOptions([
          { label: 'Aluno', value: 'Aluno' },
          { label: 'Soldado', value: 'Soldado' },
          { label: 'Cabo', value: 'Cabo' },
          { label: '3º Sargento', value: '3º Sargento' },
          { label: '2º Sargento', value: '2º Sargento' },
          { label: '1º Sargento', value: '1º Sargento' }
        ]);

      // Responde com o dropdown nativo da API de forma privada e instantânea
      return interaction.reply({
        content: '⬇️ **Selecione abaixo a sua Patente para finalizar o envio:**',
        components: [new ActionRowBuilder().addComponents(menuPatente)],
        ephemeral: true
      });
    }

    // ETAPA 3: Pegou o clique da setinha e despacha tudo direto para a Staff analisar
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('app_select_patente_')) {
      const userId = interaction.customId.split('_')[3];
      const patenteSelecionada = interaction.values[0];

      const dados = registros.get(userId);
      if (!dados) return interaction.reply({ content: 'Sessão perdida, execute o comando de novo.', ephemeral: true });

      dados.patente = patenteSelecionada;
      salvarRegistros();

      const canalAprovacao = interaction.guild.channels.cache.get(CANAL_APROVACAO);
      if (!canalAprovacao) return interaction.reply({ content: 'Canal de Staff não configurado.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('📋 Nova Solicitação de Liberação')
        .setColor('Blue')
        .addFields(
          { name: 'Membro', value: `<@${userId}>` },
          { name: 'ID na Cidade', value: dados.rg },
          { name: 'Nome do Personagem', value: dados.nome },
          { name: 'QRA do Recrutador', value: dados.recrutador },
          { name: 'Patente Escolhida', value: dados.patente }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${userId}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`negar_${userId}`).setLabel('Negar').setStyle(ButtonStyle.Danger)
      );

      await canalAprovacao.send({ embeds: [embed], components: [row] });

      return interaction.update({ content: '✅ **Formulário enviado com sucesso!** Seus dados e sua patente foram registrados e enviados para a DPMH.', components: [] });
    }

    // CONTROLE DE BOTOES DA STAFF (Aprovar / Negar)
    if (interaction.isButton() && interaction.customId.startsWith('aprovar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Você não tem permissão para aprovar.', ephemeral: true });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);
      if (!dados) return interaction.reply({ content: 'Erro ao resgatar dados.', ephemeral: true });

      try {
        const membro = await interaction.guild.members.fetch(userId);
        if (UNIDADES[dados.unidade]?.cargo) await membro.roles.add(UNIDADES[dados.unidade].cargo);
        if (PATENTES[dados.patente]?.cargo) await membro.roles.add(PATENTES[dados.patente].cargo);

        const nick = `${PATENTES[dados.patente].prefixo} ${dados.nome} | ${dados.rg}`;
        await membro.setNickname(nick);
      } catch (err) { console.error("Erro ao aplicar dados:", err); }

      const canalAprovados = interaction.guild.channels.cache.get(CANAL_APROVADOS);
      if (canalAprovados) {
        await canalAprovados.send({
          embeds: [new EmbedBuilder().setColor('Green').setTitle('✅ Liberação Concluída').setDescription(`O policial <@${userId}> foi aprovado e integrado no sistema.`)]
        });
      }
      return interaction.update({ content: `✅ Liberado por ${interaction.user}.`, components: [] });
    }

    if (interaction.isButton() && interaction.customId.startsWith('negar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      const userId = interaction.customId.split('_')[1];
      
      registros.delete(userId);
      salvarRegistros();

      return interaction.update({ content: `❌ Registro de <@${userId}> recusado por ${interaction.user}.`, components: [] });
    }

  } catch (error) {
    console.error("Erro na execução geral:", error);
  }
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(process.env.TOKEN);
