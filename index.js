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

// ⚠️ NÃO ESQUEÇA DE COLOCAR O ID DO SEU BOT AQUI
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
  console.log(`✅ ${client.user.tag} rodando com suporte a componentes de App.`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    // Registro global preparado para interações em janelas flutuantes nativas
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: [
          {
            name: 'painel',
            description: 'Envia o painel com suporte a menus suspensos nativos.',
            type: ApplicationCommandType.ChatInput,
            integration_types: [0, 1], 
            contexts: [0, 1, 2]        
          }
        ]
      }
    );
    console.log('✅ Comando com suporte a Dropdown de App registrado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comando avançado:', error);
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

    // PASSO 1: Abre a janela coletando os textos obrigatórios primários
    if (interaction.isButton() && interaction.customId === 'abrir_registro_app') {
      const modal = new ModalBuilder()
        .setCustomId('modal_etapa_1')
        .setTitle('Solicitação de Liberação');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('nome').setLabel('Qual o nome e sobrenome do personagem? *').setPlaceholder('ex: Freezy Andre').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('rg').setLabel('Qual é o seu ID na cidade? *').setPlaceholder('Lembrando que são no máximo 8 números').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('codigo').setLabel('Qual o Código de Incorporação? *').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    // PASSO 2: Assim que ele envia o modal, o App atualiza a janela transformando instantaneamente nas SETINHAS (Dropdown)
    if (interaction.isModalSubmit() && interaction.customId === 'modal_etapa_1') {
      const userId = interaction.user.id;
      
      registros.set(userId, {
        nome: interaction.fields.getTextInputValue('nome'),
        rg: interaction.fields.getTextInputValue('rg'),
        codigo: interaction.fields.getTextInputValue('codigo'),
        unidade: null,
        patente: null
      });
      salvarRegistros();

      // Cria a "setinha" para selecionar a Unidade
      const menuUnidade = new StringSelectMenuBuilder()
        .setCustomId(`app_select_unidade_${userId}`)
        .setPlaceholder('Selecione sua unidade ▼')
        .addOptions(
          Object.keys(UNIDADES).map(u => ({ label: u, value: u }))
        );

      // Manda a tela com o menu de setinha nativo de forma privada (ephemeral)
      return interaction.reply({
        content: '➡️ **Etapa Final:** Use a setinha abaixo para definir sua corporação:',
        components: [new ActionRowBuilder().addComponents(menuUnidade)],
        ephemeral: true
      });
    }

    // PASSO 3: O usuário escolheu a Unidade na setinha -> Muda o dropdown para as Patentes
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('app_select_unidade_')) {
      const userId = interaction.customId.split('_')[3];
      const unidadeSelecionada = interaction.values[0];
      
      const dados = registros.get(userId);
      if (!dados) return interaction.reply({ content: 'Sessão expirada. Tente novamente.', ephemeral: true });

      dados.unidade = unidadeSelecionada;
      salvarRegistros();

      // Filtra patentes baseado na escolha
      const listaPatentes = (unidadeSelecionada === 'PF' || unidadeSelecionada === 'PRF') 
        ? ["Del.G", "Delg.", "Esc.", "Insp.", "Agnt 1º Clss", "Agnt 2º Clss", "Aluno"]
        : ["Coronel", "Tenente-Coronel", "Major", "Capitão", "1º Tenente", "Subtenente", "1º Sargento", "Cabo", "Soldado", "Aluno"];

      // Cria a segunda "setinha" dinamicamente baseada na unidade dele
      const menuPatente = new StringSelectMenuBuilder()
        .setCustomId(`app_select_patente_${userId}`)
        .setPlaceholder('Selecione sua patente ▼')
        .addOptions(
          listaPatentes.map(p => ({ label: p, value: p }))
        );

      return interaction.update({
        content: `Unidade definida: **${unidadeSelecionada}**\nAgora escolha a sua patente na lista abaixo:`,
        components: [new ActionRowBuilder().addComponents(menuPatente)]
      });
    }

    // PASSO 4: Escolheu a patente na setinha -> Valida o código e manda para a aprovação dos Oficiais
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('app_select_patente_')) {
      const userId = interaction.customId.split('_')[3];
      const patenteSelecionada = interaction.values[0];

      const dados = registros.get(userId);
      if (!dados) return interaction.reply({ content: 'Erro nos dados.', ephemeral: true });

      dados.patente = patenteSelecionada;
      salvarRegistros();

      // Validação automática do código de segurança da corporação escolhida
      if (dados.codigo !== UNIDADES[dados.unidade].codigo) {
        return interaction.update({ content: '❌ **Envio cancelado:** Seu Código de Incorporação não bate com essa Unidade!', components: [] });
      }

      const canalAprovacao = interaction.guild.channels.cache.get(CANAL_APROVACAO);
      if (!canalAprovacao) return interaction.reply({ content: 'Canal de Staff ausente.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('📋 Nova Solicitação (Menu de Setinhas)')
        .setColor('DarkBlue')
        .addFields(
          { name: 'Policial', value: `<@${userId}>` },
          { name: 'Nome de Guerra', value: dados.nome },
          { name: 'ID / RG', value: dados.rg },
          { name: 'Unidade Escolhida', value: dados.unidade },
          { name: 'Patente Selecionada', value: dados.patente }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${userId}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`negar_${userId}`).setLabel('Negar').setStyle(ButtonStyle.Danger)
      );

      await canalAprovacao.send({ embeds: [embed], components: [row] });

      return interaction.update({ content: '✅ **Perfeito!** Seus dados foram coletados através das opções selecionadas e enviados para a DPMH!', components: [] });
    }

    // SISTEMA DE APROVAÇÃO DA STAFF (Mantido idêntico para segurança e logs)
    if (interaction.isButton() && interaction.customId.startsWith('aprovar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);
      if (!dados) return interaction.reply({ content: 'Dados inválidos.', ephemeral: true });

      try {
        const membro = await interaction.guild.members.fetch(userId);
        if (UNIDADES[dados.unidade]?.cargo) await membro.roles.add(UNIDADES[dados.unidade].cargo);
        if (PATENTES[dados.patente]?.cargo) await membro.roles.add(PATENTES[dados.patente].cargo);

        const nick = `${PATENTES[dados.patente].prefixo} ${dados.nome} | ${dados.rg}`;
        await membro.setNickname(nick);
      } catch (err) { console.error(err); }

      const canalAprovados = interaction.guild.channels.cache.get(CANAL_APROVADOS);
      if (canalAprovados) {
        await canalAprovados.send({
          embeds: [new EmbedBuilder().setColor('Green').setTitle('✅ Cadastro Aprovado via App').setDescription(`O policial <@${userId}> teve seus cargos e prefixos aplicados.`)]
        });
      }
      return interaction.update({ content: `✅ Liberado por ${interaction.user}.`, components: [] });
    }

    if (interaction.isButton() && interaction.customId.startsWith('negar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      const userId = interaction.customId.split('_')[1];
      
      registros.delete(userId);
      salvarRegistros();

      return interaction.update({ content: `❌ Recusado por ${interaction.user}.`, components: [] });
    }

  } catch (error) {
    console.error("Erro interno na execução do App:", error);
  }
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(process.env.TOKEN);
