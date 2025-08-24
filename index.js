import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Events,
} from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.GuildMember, Partials.User],
});

client.once(Events.ClientReady, (c) => {
  console.log(`😺 Meow~ เข้าสู่ระบบแล้วในชื่อ ${c.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel =
      member.guild.channels.cache.get(channelId) ||
      (await member.guild.channels.fetch(channelId).catch(() => null));

    if (!channel?.isTextBased()) return;

    // avatar (รองรับ gif ถ้ามี)
    const avatarSmall = member.user.displayAvatarURL({
      size: 256,
      dynamic: true,
    });
    const avatarLarge = member.user.displayAvatarURL({
      size: 512,
      dynamic: true,
    });

    // สร้าง embed สไตล์แมว
    const embed = new EmbedBuilder()
      .setTitle("🐾 Meow~ Welcome!")
      .setDescription(
        [
          `เมี้ยว~ ยินดีต้อนรับ ${member} เข้าสู่ **${member.guild.name}** 🐱`,
          process.env.RULES_CHANNEL_ID
            ? `อย่าลืมไปอ่านกฎที่ <#${process.env.RULES_CHANNEL_ID}> นะเมี้ยว~`
            : null,
          `ถ้ามีคำถาม เรียกบอทแมวได้เลยน้า~ ฅ^•ﻌ•^ฅ`,
        ]
          .filter(Boolean)
          .join("\n")
      )
      .setThumbnail(avatarSmall) // รูปเล็ก
      .setImage(avatarLarge) // รูปใหญ่
      .setFooter({
        text: `ตอนนี้เรามีสมาชิก ${member.guild.memberCount} ตัวเหมียวแล้ว!`,
      })
      .setColor(0xffb6c1) // ชมพูอ่อน น่ารัก
      .setTimestamp();

    await channel.send({
      content: `เมี้ยว~ ยินดีต้อนรับ ${member}! 🐾`,
      embeds: [embed],
    });

    // DM ส่วนตัว (optional)
    await member
      .send(
        `เมี้ยว~ ขอบคุณที่เข้ามาเล่นกับพวกเราใน **${member.guild.name}** นะ 🐱`
      )
      .catch(() => {});
  } catch (err) {
    console.error("Error in guildMemberAdd:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
