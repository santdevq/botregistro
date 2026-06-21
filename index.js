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
  MessageFlags
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
  GAM: { codigo: 'GAMBS53453', cargo: '1474254662583451709', emoji: '🚁' },
  CBMERJ: { codigo: 'CBMERJBS32834', cargo: '1507573577224945844', emoji: '🚒' },
  BOPE: { codigo: 'BOPEBS38457', cargo: '1472933428835123342', emoji: '💀' },
  RECOM: { codigo: 'RECOMBS23745', cargo: '1472933947074941101', emoji: '⚡' },
  BPCHQ: { codigo: 'CHOQUEBS37238', cargo: '1472933561513283666', emoji: ':bpchq:' },
  PF: { codigo: 'PFBS37284', cargo: '1472933271137423394', emoji: '🦅' },
  PRF: { codigo: 'PRFBS38248', cargo: '1472935135581044889', emoji: '🚔' },
  PMERJ: { codigo: 'PMERJBS37234', cargo: '1472933106381226035', emoji: '👮' }
};


const PATENTES = {
  "Coronel": { cargo: "1474226455729668156", prefixo: "[✵ ✵ ✵]", emoji: "🌟" },
  "Tenente-Coronel": { cargo: "1474226912934232239", prefixo: "[✵ ✵ ✧]", emoji: "✨" },
  "Major": { cargo: "1512085315177807882", prefixo: "[✷✧✧]", emoji: "🌟" },
  "Capitão": { cargo: "1474228200694616176", prefixo: "[✧ ✧ ✧]", emoji: "🎖️" },
  "1º Tenente": { cargo: "1474228316100886702", prefixo: "[✧ ✧]", emoji: "🥇" },
  "2º Tenente": { cargo: "1474228418420670596", prefixo: "[✧]", emoji: "🥈" },
  "Aspirante": { cargo: "1474228707173601330", prefixo: "[✯]", emoji: "🥉" },
  "Subtenente": { cargo: "1474229761550061629", prefixo: "[▵]", emoji: "🔹" },
  "1º Sargento": { cargo: "1474230092631642215", prefixo: "[❯❯❯ ❯❯]", emoji: "🔰" },
  "2º Sargento": { cargo: "1474230277957222420", prefixo: "[❯❯❯ ❯]", emoji: "🔰" },
  "3º Sargento": { cargo: "1474230429350363166", prefixo: "[❯❯❯]", emoji: "🔰" },
  "Cabo": { cargo: "1474230554453872680", prefixo: "[❯ ]", emoji: "🎗️" },
  "Soldado": { cargo: "1474230626231259207", prefixo: "[❯]", emoji: "👣" },
  "Al Soldado": { cargo: "1474230926836895876", prefixo: "[❯]", emoji: "📖" },
  "Del.G": { cargo: "1474245562793721997", prefixo: "Del.G", emoji: "💼" },
  "Delg.": { cargo: "1474245639700221962", prefixo: "Delg.", emoji: "💼" },
  "Esc.": { cargo: "1474245777621782620", prefixo: "Esc.", emoji: "📝" },
  "Insp.": { cargo: "1474245842260197570", prefixo: "Insp.", emoji: "🔍" },
  "Agnt 1º Clss": { cargo: "1474246195517063168", prefixo: "Agnt 1º Clss", emoji: "⚔️" },
  "Agnt 2º Clss": { cargo: "1474246300085125140", prefixo: "Agnt 2º Clss", emoji: "⚔️" },
  "Agnt 3º Clss": { cargo: "1474246381895028847", prefixo: "Agnt 3º Clss", emoji: "⚔️" },
  "Aluno": { cargo: "1474249202174263458", prefixo: "Aluno", emoji: "✏️" }
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

const PATENTES_MILITARES = [
  "Coronel", "Tenente-Coronel", "Major", "Capitão", "1º Tenente", "2º Tenente",
  "Aspirante", "Subtenente", "1º Sargento", "2º Sargento", "3º Sargento",
  "Cabo", "Soldado", "Al Soldado"
];

const PATENTES_PF = [
  "Del.G", "Delg.", "Esc.", "Insp.", "Agnt 1º Clss", "Agnt 2º Clss", "Agnt 3º Clss", "Aluno"
];

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
    console.error('❌ Erro ao registrar comandos:', error.message);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // COMANDO /PAINEL
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'painel') {
        if (!interaction.member.roles.cache.has(CARGO_APROVADOR) && !interaction.member.permissions.has('Administrator')) {
          return interaction.reply({
            content: '❌ **Acesso Negado!** Apenas Oficiais e membros da Staff autorizados podem acionar o painel de registro.',
            flags: [MessageFlags.Ephemeral]
          });
        }

        const embed = new EmbedBuilder()
          .setTitle('🛡️ SISTEMA DE INCORPORAÇÃO POLICIAL')
          .setDescription(`Seja bem-vindo ao departamento de cadastros.\n\nPara iniciar sua solicitação de incorporação e atualizar seus dados na corporação, clique no botão **Iniciar Registro** logo abaixo.`)
          .setColor('#1d4ed8')
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setFooter({ text: 'Departamento de Recursos Humanos', iconURL: client.user.avatarURL() })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('abrir_registro')
            .setLabel('Iniciar Registro')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝')
        );

        return interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    // ABRIR MODAL
    if (interaction.isButton() && interaction.customId === 'abrir_registro') {
      const modal = new ModalBuilder()
        .setCustomId('modal_registro')
        .setTitle('Ficha de Registro Policial');

      modal.addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome de Guerra').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Silva').setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rg').setLabel('Número do RG').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 12345').setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('autorizacao').setLabel('Quem autorizou?').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Cel. Roberto').setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('codigo').setLabel('Código de Incorporação').setStyle(TextInputStyle.Short).setPlaceholder('Insira o código da sua unidade').setRequired(true))
      );

      return interaction.showModal(modal);
    }

    // SUBMETEU MODAL
    if (interaction.isModalSubmit() && interaction.customId === 'modal_registro') {
      registros.set(interaction.user.id, {
        nome: interaction.fields.getTextInputValue('nome'),
        rg: interaction.fields.getTextInputValue('rg'),
        autorizacao: interaction.fields.getTextInputValue('autorizacao'),
        codigo: interaction.fields.getTextInputValue('codigo')
      });

      salvarRegistros();

      // 🔥 MUDANÇA AQUI: O menu agora puxa o emoji customizado definido no objeto UNIDADES
      const unidadeMenu = new StringSelectMenuBuilder()
        .setCustomId('selecionar_unidade')
        .setPlaceholder('Escolha a sua Unidade Atendida...')
        .addOptions(
          Object.keys(UNIDADES).map(u => ({ 
            label: u, 
            value: u, 
            emoji: UNIDADES[u].emoji // Pega o emoji personalizado daquela unidade
          }))
        );

      return interaction.reply({
        content: '↳ **Etapa 2/3:** Selecione a sua corporação/unidade abaixo:',
        flags: [MessageFlags.Ephemeral],
        components: [new ActionRowBuilder().addComponents(unidadeMenu)]
      });
    }

    // SELECIONOU UNIDADE
    if (interaction.isStringSelectMenu() && interaction.customId === 'selecionar_unidade') {
      const unidade = interaction.values[0];
      const dados = registros.get(interaction.user.id);

      if (!dados) return interaction.reply({ content: '❌ Seus dados de registro não foram encontrados. Tente novamente.', flags: [MessageFlags.Ephemeral] });

      dados.unidade = unidade;
      salvarRegistros();

      const lista = (unidade === 'PF' || unidade === 'PRF') ? PATENTES_PF : PATENTES_MILITARES;

      // 🔥 MUDANÇA AQUI: O menu agora puxa o emoji customizado de dentro de PATENTES
      const menuPatente = new StringSelectMenuBuilder()
        .setCustomId('selecionar_patente')
        .setPlaceholder('Escolha a sua Patente/Cargo...')
        .addOptions(
          lista.map(p => ({ 
            label: p, 
            value: p, 
            emoji: PATENTES[p]?.emoji || '🎖️' // Pega o emoji da patente (ou usa 🎖️ como segurança)
          }))
        );

      return interaction.update({
        content: `✅ Unidade selecionada: **${unidade}**\n↳ **Etapa 3/3:** Agora selecione sua respectiva patente abaixo:`,
        components: [new ActionRowBuilder().addComponents(menuPatente)]
      });
    }

    // SELECIONOU PATENTE
    if (interaction.isStringSelectMenu() && interaction.customId === 'selecionar_patente') {
      const patente = interaction.values[0];
      const dados = registros.get(interaction.user.id);

      if (!dados) return interaction.reply({ content: '❌ Seus dados de registro não foram encontrados. Tente novamente.', flags: [MessageFlags.Ephemeral] });

      dados.patente = patente;
      salvarRegistros();

      return interaction.update({
        content: `📋 **Tudo pronto!** Revise as informações principais:\n• Unidade: **${dados.unidade}**\n• Patente: **${patente}**\n\nClique no botão abaixo para despachar sua ficha para a banca avaliadora.`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('confirmar_registro')
              .setLabel('Enviar Ficha para Análise')
              .setStyle(ButtonStyle.Success)
              .setEmoji('🚀')
          )
        ]
      });
    }

    // CONFIRMAR E ENVIAR PARA APROVAÇÃO
    if (interaction.isButton() && interaction.customId === 'confirmar_registro') {
      const dados = registros.get(interaction.user.id);

      if (!dados) return interaction.reply({ content: '❌ Seus dados de registro não foram encontrados.', flags: [MessageFlags.Ephemeral] });

      if (dados.codigo !== UNIDADES[dados.unidade].codigo) {
        return interaction.reply({ content: '❌ **Código de Incorporação Inválido!** O código digitado não confere com a unidade selecionada.', flags: [MessageFlags.Ephemeral] });
      }

      const canal = interaction.guild.channels.cache.get(CANAL_APROVACAO);
      if (!canal) return interaction.reply({ content: '❌ Canal administrativo de aprovação não foi encontrado.', flags: [MessageFlags.Ephemeral] });

      const embed = new EmbedBuilder()
        .setTitle('⏳ AGUARDANDO APROVAÇÃO')
        .setDescription(`Uma nova ficha de incorporação foi enviada e necessita de validação imediata.`)
        .setColor('#eab308')
        .addFields(
          { name: '👤 Policial:', value: `<@${interaction.user.id}> (\`${interaction.user.id}\`)` },
          { name: '🪪 Nome de Guerra:', value: dados.nome, inline: true },
          { name: '📜 RG:', value: dados.rg, inline: true },
          { name: '🔑 Autorizado por:', value: dados.autorizacao, inline: true },
          { name: '🛡️ Unidade Destino:', value: dados.unidade, inline: true },
          { name: '🎖️ Patente Solicitada:', value: dados.patente, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}`).setLabel('Aprovar Registro').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId(`negar_${interaction.user.id}`).setLabel('Recusar Registro').setStyle(ButtonStyle.Danger).setEmoji('❌')
      );

      await canal.send({ embeds: [embed], components: [row] });
      return interaction.update({ content: '✅ **Sua ficha foi enviada com sucesso!** Aguarde a avaliação dos Oficiais Superiores.', components: [] });
    }

    // BOTÃO DE APROVAR
    if (interaction.isButton() && interaction.customId.startsWith('aprovar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Você não tem a atribuição necessária para validar este registro.', flags: [MessageFlags.Ephemeral] });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);

      if (!dados) return interaction.reply({ content: '❌ Dados cadastrais limpos do cache ou inválidos.', flags: [MessageFlags.Ephemeral] });

      let erroGerenciamento = false;

      try {
        const membro = await interaction.guild.members.fetch(userId);
        if (UNIDADES[dados.unidade]?.cargo) await membro.roles.add(UNIDADES[dados.unidade].cargo);
        if (PATENTES[dados.patente]?.cargo) await membro.roles.add(PATENTES[dados.patente].cargo);

        const nick = `${PATENTES[dados.patente].prefixo} ${dados.nome} | ${dados.rg}`;
        await membro.setNickname(nick);
      } catch (err) {
        console.error(err.message);
        erroGerenciamento = true;
      }

      const canalAprovados = interaction.guild.channels.cache.get(CANAL_APROVADOS);
      if (canalAprovados) {
        const embedAprovado = new EmbedBuilder()
          .setTitle('✅ CORPORAÇÃO ATUALIZADA - INCORPORADO')
          .setColor('#22c55e')
          .setDescription(`O cidadão faz parte oficialmente do departamento militar.`)
          .addFields(
            { name: '👤 Operador:', value: `<@${userId}>` },
            { name: '🪪 Identidade (RG):', value: `\`${dados.rg}\``, inline: true },
            { name: '🛡️ Corporação:', value: `**${dados.unidade}**`, inline: true },
            { name: '🎖️ Patente/Cargo:', value: `\`${dados.patente}\``, inline: true }
          )
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setTimestamp();

        await canalAprovados.send({ embeds: [embedAprovado] });
      }

      return interaction.update({ content: `✅ O registro de <@${userId}> foi **aprovado**!`, components: [] });
    }

    // BOTÃO DE NEGAR
    if (interaction.isButton() && interaction.customId.startsWith('negar_')) {
      if (!interaction.member.roles.cache.has(CARGO_APROVADOR)) {
        return interaction.reply({ content: '❌ Você não tem autorização para recusar este registro.', flags: [MessageFlags.Ephemeral] });
      }

      const userId = interaction.customId.split('_')[1];
      const dados = registros.get(userId);

      const canalRecusados = interaction.guild.channels.cache.get(CANAL_RECUSADOS);
      if (canalRecusados && dados) {
        const embedRecusado = new EmbedBuilder()
          .setTitle('❌ SOLICITAÇÃO RECUSADA')
          .setColor('#ef4444')
          .setDescription(`A ficha de incorporação enviada não atende aos parâmetros exigidos.`)
          .addFields(
            { name: '👤 Candidato reprovado:', value: `<@${userId}>` },
            { name: '🪪 Nome enviado:', value: dados.nome, inline: true },
            { name: '📜 RG informado:', value: `\`${dados.rg}\``, inline: true }
          )
          .setTimestamp();

        await canalRecusados.send({ embeds: [embedRecusado] });
      }

      registros.delete(userId);
      salvarRegistros();
      return interaction.update({ content: `❌ O registro de <@${userId}> foi **recusado**.`, components: [] });
    }

  } catch (error) {
    console.error("Erro na execução da interação:", error);
  }
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(process.env.TOKEN);
