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
  EmbedBuilder,
  REST,
  Routes
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

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
  console.log(`✅ ${client.user.tag} online`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log('🔄 Atualizando comandos / (slash) no servidor...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, ID_DO_SERVIDOR),
      { body: [{ name: 'painel', description: 'Envia o painel de registro policial.' }] }
    );
    console.log('✅ Comandos / registrados com sucesso no servidor!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // COMANDO /PAINEL
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'painel') {
        const embed = new EmbedBuilder()
          .setTitle('REGISTRO PARA INCORPORAÇÃO')
          .setDescription(`Clique no botão abaixo para iniciar o registro.`);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('abrir_registro')
            .setLabel('Registro Policial')
            .setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    // ABRIR O PAINELZINHO (MODAL) COM ATÉ 5 CAMPOS (MÁXIMO PERMITIDO PELO DISCORD)
    if (interaction.isButton() && interaction.customId === 'abrir_registro') {
      const modal = new ModalBuilder()
        .setCustomId('modal_registro')
        .setTitle('Registro Policial');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('nome').setLabel('Nome de Guerra').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('rg').setLabel('RG').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('unidade_txt').setLabel('Unidade (Ex: PMERJ, BOPE, PF)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('patente_txt').setLabel('Patente (Ex: Soldado, Coronel)').setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('codigo').setLabel('Código de Incorporação').setStyle(TextInputStyle.Short).setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    // QUANDO CLICA EM ENVIAR NO PAINELZINHO
    if (interaction.isModalSubmit() && interaction.customId === 'modal_registro') {
      const nome = interaction.fields.getTextInputValue('nome');
      const rg = interaction.fields.getTextInputValue('rg');
      const codigo = interaction.fields.getTextInputValue('codigo');
      
      // Padroniza o texto digitado pelo usuário para bater com a sua lista (Tira espaços extras e deixa em maiúsculo/correto)
      const unidadeInput = interaction.fields.getTextInputValue('unidade_txt').trim().toUpperCase();
      let patenteInput = interaction.fields.getTextInputValue('patente_txt').trim();
      
      // Pequeno ajuste para achar a patente certa mesmo se digitarem tudo minúsculo
      const patenteChave = Object.keys(PATENTES).find(p => p.toLowerCase() === patenteInput.toLowerCase());
      const patenteFormatada = patenteChave || patenteInput;

      // Valida se a unidade digitada existe no sistema
      if (!UNIDADES[unidadeInput]) {
        return interaction.reply({ content: `❌ A unidade **${unidadeInput}** não existe no sistema. Use uma destas: ${Object.keys(UNIDADES).join(', ')}.`, ephemeral: true });
      }

      // Valida se a patente digitada existe no sistema
      if (!PATENTES[patenteFormatated = patenteFormatada]) {
        return interaction.reply({ content: `❌ A patente **${patenteInput}** não foi reconhecida no sistema. Verifique a grafia correta.`, ephemeral: true });
      }

      // Valida o código da corporação
      if (codigo !== UNIDADES[unidadeInput].codigo) {
        return interaction.reply({ content: '❌ Código de Incorporação incorreto para esta unidade.', ephemeral: true });
      }

      // Salva provisoriamente no Banco de dados JSON
      registros.set(interaction.user.id, {
        nome: nome,
        rg: rg,
        unidade: unidadeInput,
        patente: patenteFormatada,
        codigo: codigo
      });
      salvarRegistros();

      // Envia direto para o canal de aprovação da Staff
      const canalAprovacao = interaction.guild.channels.cache.get(CANAL_APROVACAO);
      if (!canalAprovacao) {
        return interaction.reply({ content: 'Canal de aprovação não encontrado.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Novo Registro')
        .setColor('Blue')
        .addFields(
          { name: 'Usuário', value: `<@${interaction.user.id}>` },
          { name: 'Nome', value: nome },
          { name: 'RG', value: rg },
          { name: 'Unidade', value: unidadeInput },
          { name: 'Patente', value: patenteFormatada }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`negar_${interaction.user.id}`).setLabel('Negar').setStyle(ButtonStyle.Danger)
      );

      await canalAprovacao.send({ embeds: [embed], components: [row] });

      return interaction.reply({ content: '✅ Seu registro foi enviado diretamente para a análise da Staff!', ephemeral: true });
    }

    // BOTÃO DE APROVAR
    if (interaction.isButton() && interaction.customId.startsWith('aprovar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Você não possui permissão.', ephemeral: true });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);

      if (!dados) return interaction.reply({ content: 'Dados do registro não encontrados.', ephemeral: true });

      try {
        const membro = await interaction.guild.members.fetch(userId);

        if (UNIDADES[dados.unidade]?.cargo) await membro.roles.add(UNIDADES[dados.unidade].cargo);
        if (PATENTES[dados.patente]?.cargo) await membro.roles.add(PATENTES[dados.patente].cargo);

        const nick = `${PATENTES[dados.patente].prefixo} ${dados.nome} | ${dados.rg}`;
        await membro.setNickname(nick);
      } catch (err) {
        console.error("Erro ao gerenciar cargos/nickname do usuário:", err);
      }

      const canalAprovados = interaction.guild.channels.cache.get(CANAL_APROVADOS);
      if (canalAprovados) {
        await canalAprovados.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setTitle('✅ Registro Aprovado')
              .addFields(
                { name: 'Usuário', value: `<@${userId}>` },
                { name: 'Nome', value: dados.nome },
                { name: 'RG', value: dados.rg },
                { name: 'Unidade', value: dados.unidade },
                { name: 'Patente', value: dados.patente }
              )
          ]
        });
      }

      return interaction.update({ content: `✅ Registro de <@${userId}> aprovado por ${interaction.user}.`, components: [] });
    }

    // BOTÃO DE NEGAR
    if (interaction.isButton() && interaction.customId.startsWith('negar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Você não possui permissão.', ephemeral: true });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);

      const canalRecusados = interaction.guild.channels.cache.get(CANAL_RECUSADOS);
      if (canalRecusados && dados) {
        await canalRecusados.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setTitle('❌ Registro Recusado')
              .addFields(
                { name: 'Usuário', value: `<@${userId}>` },
                { name: 'Nome', value: dados.nome },
                { name: 'RG', value: dados.rg }
              )
          ]
        });
      }

      registros.delete(userId);
      salvarRegistros();

      return interaction.update({ content: `❌ Registro de <@${userId}> recusado por ${interaction.user}.`, components: [] });
    }

  } catch (error) {
    console.error("Erro na execução da interação:", error);
  }
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(process.env.TOKEN);
