const discord = require("discord.js");
const Monitor = require('ping-monitor');
const keepAlive = require('./server');
const client = new discord.Client()
const {
    token,
    prefix,
    ServerID
} = require("./config.json")

client.on("ready", () => {
    console.log("Bot ON")


    client.user.setActivity("Uniticraft, u!help")
})


keepAlive();
const monitor = new Monitor({
    website: 'https://sombras-2.markox36.repl.co',
    title: 'Secundario',
    interval: 15 // minutes
});

////////Monitor//////////
monitor.on('up', (res) => console.log(`${res.website} está encedido.`));
monitor.on('down', (res) => console.log(`${res.website} se ha caído - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} se ha parado.`) );
monitor.on('error', (error) => console.log(error));
//////////////////////

client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("Su conversación fue eliminada", client.user.displayAvatarURL())
            .setColor('RED')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("Algun admin/mod elimino su correo y si tiene algún problema con eso, puede abrir el correo nuevamente enviando el mensaje aquí.")
        return person.send(yembed)

    }


})


client.on("message", async message => {
    if (message.author.bot) return;

    let args = message.content.slice(prefix.length).split(' ');
    let command = args.shift().toLowerCase();


    if (message.guild) {
        if (command == "setup") {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("¡Necesita permisos de administrador para configurar el sistema modmail!")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("¡El bot necesita permisos de administrador para configurar el sistema modmail!")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "Tickes")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "Tickes",
                        color: "GREEN"
                    },
                    reason: "Rol necesario para el sistema ModMail"
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "Todo el correo estará aquí :D",
                permissionOverwrites: [{
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("La configuración está completa: D")

        } else if (command == "close") {


            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("No puedo cerrar el canal y este error se produce porque probablemente se cambió el nombre del canal.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("Su conversación fue cerrada", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter("El correo está cerrado por " + message.author.username)
                if (args[0]) yembed.setDescription(args.join(" "))

                return person.send(yembed)

            }
        } else if (command == "open") {
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("El sistema de moderación no está configurado en este servidor, utilice " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "SUPPORTER")) {
                return message.channel.send("Necesitas un rol de partidario para usar este comando")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send("Por favor, proporcione la identificación de la persona.")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send("No se pudo encontrar a esta persona.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "El correo es abierto directamente por **" + message.author.username + "** hacer contacto con " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("Detalles", target.user.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
                .addField("Nombre", target.user.username)
                .addField("Fecha de creación de la cuenta", target.user.createdAt)
                .addField("Contacto directo", "Sí (significa que este correo es abierto por un partidario)");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("DIRECT MAIL OPENED")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Ha sido contactado por un Partidario de **" + message.guild.name + "**, ¡Espere hasta que le envíe otro mensaje!");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Abrió el correo: <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            let embed = new discord.MessageEmbed()
                .setAuthor('Uniticraft', client.user.displayAvatarURL())
                .setColor("RAMDOM")

                .setDescription("Bot hecho por B𝟘rja 𝟘rellaℕa#1313")
                .addField(prefix + "ip", "**Te envia la IP de nuestro server.**", true)

                .addField(prefix + "reglas", '**Te muestra todas las reglas.**', true)
                .setThumbnail(client.user.displayAvatarURL())
                .addField(prefix + "avatar", '**Te muestra tu avatar**', true)
                
                

            return message.channel.send(embed)

        }
    }




    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")
        if(!category) return;

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send('No se puede enviar el mensaje')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setFooter(message.author.username, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)

            return member.send(lembed)
        }


    }




    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => {})
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "Este correo está creado para ayudar **" + message.author.tag + " **"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("Conversación abierta")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("La conversación ha comenzado, pronto los seguidores se comunicarán con usted :D")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
                .addField("Nombre", message.author.username)
                .addField("Fecha de creación de la cuenta", message.author.createdAt)
                .addField("Contacto directo", "No (significa que este correo lo abre una persona que no es un partidario)")


            return mx.send(eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("YELLOW")
            .setFooter(message.author.tag, message.author.displayAvatarURL({
                dynamic: true
            }))
            .setDescription(message.content)


        main.send(xembed)

    }
    




})


client.login(token)
