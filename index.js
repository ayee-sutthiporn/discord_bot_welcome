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

/* ---------- ปูโกะพูดเอง ---------- */
const MASCOT_NAME = "ปูโกะ";
const EMO = { crab: "🦀" };

/* ---------- Utils ---------- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const hour = () => new Date().getHours();

function timeGreeting() {
  const h = hour();
  if (h < 11) return "เช้านี้ลมกำลังดีเลย กี๊บๆ~ โกะชงโกโก้ให้นั่งจิบได้นะ";
  if (h < 16) return "บ่ายนี้แดดอุ่น ๆ โกะปูเสื่อไว้เรียบร้อย มานั่งคุยกัน~";
  if (h < 19) return "เย็นนี้คลื่นนุ่มหูมาก โกะพาเดินเล่นแป๊บหนึ่งไหม";
  return "ดึกแล้วแต่โกะยังไม่ง่วงน้า มานั่งดูดาวกับโกะได้เลย";
}

/* ---------- ข้อความต้อนรับแบบหมวดโทน (ปูโกะเล่าเอง) ---------- */
const welcomeCategories = {
  warm: [
    (u) =>
      `${EMO.crab} โกะดีใจมากเลยที่เจอ **<@${u}>** เข้ามาเถอะ บ้านของพวกเราเอง`,
    (u) =>
      `${EMO.crab} ยินดีต้อนรับนะ **<@${u}>** ถ้าหลงทางบอกโกะได้เลย เดี๋ยวโกะคีบพาไป`,
    (u) => `${EMO.crab} โกะโบกก้ามทักทาย **<@${u}>** แบบอบอุ่นสุด ๆ เลย`,
  ],
  fun: [
    (u) =>
      `${EMO.crab} กี๊บๆ! โกะกระโดดออกจากทรายมาต้อนรับ **<@${u}>** โดยเฉพาะเลย~`,
    (u) => `${EMO.crab} โกะตื่นเต้นมาก เย้ ๆ ได้เพื่อนใหม่ชื่อ **<@${u}>**`,
    (u) => `${EMO.crab} โกะซ้อมโบกก้ามมาทั้งวัน เพื่อทัก **<@${u}>** นี่แหละ!`,
  ],
  goofy: [
    (u) =>
      `${EMO.crab} ไม่ต้องกลัวก้ามโกะน้า โกะใช้คีบอย่างเดียว…คีบความสุขให้ **<@${u}>** 😆`,
    (u) =>
      `${EMO.crab} โกะทำไมค์จากเปลือกหอยแล้วประกาศว่า “ขอต้อนรับ **<@${u}>** ค่า!”`,
    (u) =>
      `${EMO.crab} โกะปูพรมทรายเสร็จพอดี เชิญ **<@${u}>** เดินเข้ามาเลยจ้า`,
  ],
  chill: [
    (u) =>
      `${EMO.crab} วันนี้อากาศชิลมาก โกะนั่งฟังคลื่นอยู่ ขยับมานั่งด้วยกันสิ **<@${u}>**`,
    (u) => `${EMO.crab} ถ้าอยากสำรวจรอบ ๆ เดี๋ยวโกะพาทัวร์ให้เองนะ **<@${u}>**`,
    (u) =>
      `${EMO.crab} โกะพูดไม่เก่ง แต่ตั้งใจฟังเก่งนะ เล่าให้โกะฟังก็ได้ **<@${u}>**`,
  ],
};

/** เลือก “โทน” ตามช่วงเวลาให้ดูธรรมชาติ */
function chooseCategoryByTime() {
  const h = hour();
  const weights =
    h < 11
      ? { warm: 4, chill: 3, fun: 2, goofy: 1 }
      : h < 16
      ? { warm: 2, chill: 2, fun: 4, goofy: 3 }
      : h < 20
      ? { warm: 3, chill: 3, fun: 3, goofy: 2 }
      : { warm: 4, chill: 4, fun: 1, goofy: 2 };

  const bag = [];
  Object.keys(weights).forEach((k) => {
    for (let i = 0; i < weights[k]; i++) bag.push(k);
  });
  return pick(bag);
}

function randomWelcome(uid) {
  const cat = chooseCategoryByTime();
  const line = pick(welcomeCategories[cat]);
  return line(uid);
}

/* ---------- Client Ready ---------- */
client.once(Events.ClientReady, (c) => {
  console.log(`🦀 ${MASCOT_NAME} online as ${c.user.tag}`);
});

/* ---------- Welcome Flow ---------- */
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const rulesId = process.env.RULES_CHANNEL_ID;

    // หาแชนแนลต้อนรับ: ระบุด้วย env > systemChannel
    const fallback = member.guild.systemChannel ?? null;
    const channel =
      (channelId &&
        (member.guild.channels.cache.get(channelId) ||
          (await member.guild.channels.fetch(channelId).catch(() => null)))) ||
      fallback;

    if (!channel?.isTextBased()) return;

    const avatarSmall = member.user.displayAvatarURL({
      size: 256,
      dynamic: true,
    });
    const avatarLarge = member.user.displayAvatarURL({
      size: 512,
      dynamic: true,
    });

    const line = randomWelcome(member.id);
    const desc = [
      timeGreeting(),
      "",
      `**${line}**`,
      rulesId
        ? `ก่อนเริ่ม โกะชวนแวะดู <#${rulesId}> แป๊บเดียว จะได้คุยกันสบายใจ`
        : null,
      "มีอะไรถามได้เลย แท็กหาแอดมิน หรือพิมพ์ /help ก็ได้",
    ]
      .filter(Boolean)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`🦀 โกะมาต้อนรับเพื่อนใหม่แล้ว`)
      .setDescription(desc)
      .setThumbnail(avatarSmall)
      .setImage(avatarLarge)
      .setFooter({
        text: `ตอนนี้พวกเรามี ${member.guild.memberCount} คนแล้ว • จากโกะ ${EMO.crab}`,
      })
      .setColor(0x00bcd4)
      .setTimestamp();

    await channel.send({
      content: `ยินดีต้อนรับ ${member} ${EMO.crab} โกะฝากตัวด้วยน้า`,
      embeds: [embed],
    });

    // DM แบบที่โกะพูดเอง
    await member
      .send(
        [
          `สวัสดีนะ **${member.user.username}** โกะเอง ${EMO.crab}`,
          `ยินดีต้อนรับสู่ **${member.guild.name}** เลย~`,
          rulesId
            ? `แวะดู <#${rulesId}> แป๊บนึงนะ แล้วมาคุยกันต่อ กี๊บๆ!`
            : `ถ้ามีอะไรอยากรู้ โกะพร้อมคีบช่วยเสมอ กี๊บๆ!`,
        ].join("\n")
      )
      .catch(() => {});
  } catch (err) {
    console.error("Error in GuildMemberAdd:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
