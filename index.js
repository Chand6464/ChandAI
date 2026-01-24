const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const guildConfigFile = 'requests.json';
const ticketFile = 'database.json';
let guildConfigs = new Map();
let tickets = new Map();

function loadGuildConfigs() {
    if (fs.existsSync(guildConfigFile)) {
        const content = fs.readFileSync(guildConfigFile, 'utf8');
        if (content.trim()) {
            const data = JSON.parse(content);
            guildConfigs = new Map(Object.entries(data));
        }
    }
}

function saveGuildConfigs() {
    const data = Object.fromEntries(guildConfigs);
    fs.writeFileSync(guildConfigFile, JSON.stringify(data, null, 2));
}

function loadTickets() {
    if (fs.existsSync(ticketFile)) {
        const content = fs.readFileSync(ticketFile, 'utf8');
        if (content.trim()) {
            const data = JSON.parse(content);
            tickets = new Map(Object.entries(data));
        }
    }
}

function saveTickets() {
    const data = Object.fromEntries(tickets);
    fs.writeFileSync(ticketFile, JSON.stringify(data, null, 2));
}

client.on('clientReady', () => {
    console.log('Bot ready');
    loadGuildConfigs();
    loadTickets();
    client.user.setActivity('Tier Testing');

    const setupCommand = new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Set up request and result channels')
        .addChannelOption(option =>
            option.setName('requestchannel')
                .setDescription('Channel for requests')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('resultchannel')
                .setDescription('Channel for results')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('testerrole')
                .setDescription('Role for testers')
                .setRequired(true)
        );

    const setupticketCommand = new SlashCommandBuilder()
        .setName('setupticket')
        .setDescription('Set up ticket with gamemodes')
        .addStringOption(option =>
            option.setName('gamemode1')
                .setDescription('First gamemode')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('gamemode2')
                .setDescription('Second gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode3')
                .setDescription('Third gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode4')
                .setDescription('Fourth gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode5')
                .setDescription('Fifth gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode6')
                .setDescription('Sixth gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode7')
                .setDescription('Seventh gamemode')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('gamemode8')
                .setDescription('Eighth gamemode')
                .setRequired(false)
        );

    const postresultCommand = new SlashCommandBuilder()
        .setName('postresult')
        .setDescription('Post test result')
        .addUserOption(option =>
            option.setName('player')
                .setDescription('The player')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('tester')
                .setDescription('The tester')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ingamename')
                .setDescription('In game name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('Gamemode')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('previoustier')
                .setDescription('Previous tier')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tierearned')
                .setDescription('Tier earned')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Region')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('playertype')
                .setDescription('Player type')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('comments')
                .setDescription('Comments')
                .setRequired(false)
        );

    const closetestCommand = new SlashCommandBuilder()
        .setName('closetest')
        .setDescription('Close a test ticket')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The test channel to close')
                .setRequired(true)
        );

    const commands = [setupCommand.toJSON(), setupticketCommand.toJSON(), postresultCommand.toJSON(), closetestCommand.toJSON()];

    client.guilds.cache.forEach(guild => {
        guild.commands.set(commands);
    });
});

client.on('guildCreate', guild => {
    // Re-register commands if needed, but since global-ish, maybe not necessary
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const guildId = interaction.guildId;
        if (interaction.commandName === 'setup') {
            const requestChannel = interaction.options.getChannel('requestchannel');
            const resultChannel = interaction.options.getChannel('resultchannel');
            const testerRole = interaction.options.getRole('testerrole');
            guildConfigs.set(guildId, { requestChannel: requestChannel.id, resultChannel: resultChannel.id, testerRole: testerRole.id });
            saveGuildConfigs();
            await interaction.reply({ content: 'Channels and role set!', flags: 64 });
        } else if (interaction.commandName === 'setupticket') {
            const guildChannels = guildConfigs.get(guildId);
            if (!guildChannels) {
                return interaction.reply({ content: 'Please set up channels first with /setup', ephemeral: true });
            }
            const requestChannel = interaction.guild.channels.cache.get(guildChannels.requestChannel);
            if (!requestChannel) {
                return interaction.reply({ content: 'Request channel not found', ephemeral: true });
            }
            const gamemodes = [];
            for (let i = 1; i <= 8; i++) {
                const gm = interaction.options.getString(`gamemode${i}`);
                if (gm) gamemodes.push(gm);
            }
            const embed = new EmbedBuilder()
                .setTitle('Want to get Tier Tested??')
                .setDescription('If you want to get tested click on the gamemode button below and tell your name and your region and wait until a tester is available.\n\nGood Luck for your test <3');
            const row = new ActionRowBuilder()
                .addComponents(
                    ...gamemodes.map(gm =>
                        new ButtonBuilder()
                            .setCustomId(`gamemode_${gm}`)
                            .setLabel(gm)
                            .setStyle(ButtonStyle.Primary)
                    )
                );
            await requestChannel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Ticket setup posted!', flags: 64 });
        } else if (interaction.commandName === 'postresult') {
            const guildChannels = guildConfigs.get(guildId);
            if (!guildChannels) {
                return interaction.reply({ content: 'Please set up channels first with /setup', ephemeral: true });
            }
            const resultChannel = interaction.guild.channels.cache.get(guildChannels.resultChannel);
            if (!resultChannel) {
                return interaction.reply({ content: 'Result channel not found', ephemeral: true });
            }
            const player = interaction.options.getUser('player');
            const tester = interaction.options.getUser('tester');
            const ingamename = interaction.options.getString('ingamename');
            const gamemode = interaction.options.getString('gamemode');
            const previoustier = interaction.options.getString('previoustier');
            const tierearned = interaction.options.getString('tierearned');
            const region = interaction.options.getString('region');
            const playertype = interaction.options.getString('playertype');
            const comments = interaction.options.getString('comments') || '';
            const embed = new EmbedBuilder()
                .setTitle(`${player.username}'s Tier Update 🏆`)
                .setDescription(`**Tester**\n${tester.username}\n\n**Username**\n${ingamename}\n\n**Gamemode**\n${gamemode}\n\n**Previous Tier**\n${previoustier}\n\n**Tier Earned**\n${tierearned}\n\n**Region**\n${region}\n\n**PlayerType**\n${playertype}\n\n**Comments**\n${comments}`);
            await resultChannel.send({ content: `${player}`, embeds: [embed] });
            await interaction.reply({ content: 'Result posted!', flags: 64 });
        } else if (interaction.commandName === 'closetest') {
            const channel = interaction.options.getChannel('channel');
            if (channel.type !== ChannelType.GuildText || !channel.parent || channel.parent.name.toLowerCase() !== 'tests' || !channel.name.startsWith('test-')) {
                return interaction.reply({ content: 'This is not a valid test channel.', flags: 64 });
            }
            const ticketData = tickets.get(channel.id);
            if (!ticketData) {
                return interaction.reply({ content: 'Ticket not found.', flags: 64 });
            }
            const guildChannels = guildConfigs.get(interaction.guildId);
            if (!guildChannels) {
                return interaction.reply({ content: 'Guild not configured.', flags: 64 });
            }
            const isPlayer = interaction.user.id === ticketData.playerId;
            const hasTesterRole = interaction.member.roles.cache.has(guildChannels.testerRole);
            if (!isPlayer && !hasTesterRole) {
                return interaction.reply({ content: 'You do not have permission to close this ticket.', flags: 64 });
            }
            await interaction.reply({ content: 'Test ticket closed.', flags: 64 });
            await channel.delete();
        }
    } else if (interaction.isButton()) {
        const customId = interaction.customId;
        if (customId.startsWith('gamemode_')) {
            const gamemode = customId.split('_')[1];
            const modal = new ModalBuilder()
                .setCustomId(`modal_${gamemode}_${interaction.user.id}`)
                .setTitle(`Request for ${gamemode}`);
            const ingameNameInput = new TextInputBuilder()
                .setCustomId('ingamename')
                .setLabel('In Game Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const regionInput = new TextInputBuilder()
                .setCustomId('region')
                .setLabel('Region')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const firstActionRow = new ActionRowBuilder().addComponents(ingameNameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(regionInput);
            modal.addComponents(firstActionRow, secondActionRow);
            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId;
        if (customId.startsWith('modal_')) {
            const parts = customId.split('_');
            const gamemode = parts[1];
            const userId = parts[2];
            if (interaction.user.id !== userId) return;
            const ingamename = interaction.fields.getTextInputValue('ingamename');
            const region = interaction.fields.getTextInputValue('region');
            const guildChannels = guildConfigs.get(interaction.guildId);
            if (!guildChannels) return;
            await interaction.deferReply({ flags: 64 });
            const embed = new EmbedBuilder()
                .setTitle('New Test Request')
                .setDescription(`**Player:** ${interaction.user}\n**Gamemode:** ${gamemode}\n**In Game Name:** ${ingamename}\n**Region:** ${region}`)
                .setTimestamp();
            let category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === 'tests');
            if (!category) {
                category = await interaction.guild.channels.create({
                    name: 'Tests',
                    type: ChannelType.GuildCategory,
                });
            }
            const channelName = `test-${gamemode}-${ingamename}`.replace(/[^a-zA-Z0-9-_]/g, '-');
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: guildChannels.testerRole,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });
            tickets.set(channel.id, {
                guildId: interaction.guildId,
                playerId: interaction.user.id,
                gamemode,
                ingamename,
                region,
                createdAt: Date.now()
            });
            saveTickets();
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `Request submitted! Check the channel ${channel}` });
        }
    }
});

client.on('channelDelete', (channel) => {
    if (channel.type === ChannelType.GuildText && channel.parent && channel.parent.name.toLowerCase() === 'tests' && channel.name.startsWith('test-')) {
        tickets.delete(channel.id);
        saveTickets();
    }
});

client.login(process.env.TOKEN);
