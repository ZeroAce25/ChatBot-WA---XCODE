const wppconnect = require('@wppconnect-team/wppconnect');

// 🔹 Simpan user supaya menu hanya dikirim sekali
const users = new Set();

// 🔹 Simpan state user setelah pilih menu
// value: "webinar" | "bootcamp"
const userState = new Map();

// 🔹 Fungsi salam sesuai jam
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

// 🔹 Fungsi cek jam operasional bot
function isActiveHour() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // aktif 16:00 - 23:59
  if (hour >= 16) return true;

  // aktif 00:00 - 08:00
  if (hour < 8 || (hour === 8 && minute === 0)) return true;

  return false;
}

// 🔹 Menu awal
function getMenu(name = "") {
  return `${getGreeting()} ${name ? name : ""}!\n\n` +
    "Terima kasih telah menghubungi Admin 1 XCODE. 🙏\n" +
    "Silakan pilih layanan yang Anda butuhkan:\n\n" +
    "1️⃣ Pendaftaran Webinar\n" +
    "2️⃣ Pendaftaran Bootcamp\n\n" +
    "Jam Operasional: 08.00 - 16.00 WIB\n\n" +
    "Ini adalah pesan otomatis.";
}

// 🔹 Start WPPConnect
wppconnect.create({
  session: 'xcode-bot',
  headless: true,
  useChrome: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
})
.then((client) => start(client))
.catch((err) => console.error("❌ Gagal start wppconnect:", err));

function start(client) {
  client.onMessage(async (message) => {
    try {
      // 🔸 Abaikan grup & status
      if (message.isGroupMsg) return;
      if (message.from === "status@broadcast") return;

      // 🔸 Cek jam operasional
      if (!isActiveHour()) return;

      const contactName =
        message.sender?.pushname ||
        message.sender?.name ||
        "";

      // ==================================================
      // 🔹 JIKA USER KIRIM GAMBAR
      // ==================================================
      if (message.type === 'image') {

        // ✅ Sudah pilih menu → terima bukti transfer
        if (userState.has(message.from)) {
          const layanan = userState.get(message.from);

          await client.sendText(
            message.from,
            `✅ Terima kasih, pendaftaran ${layanan === "webinar" ? "Webinar" : "Bootcamp"} XCODE telah kami terima.\n\n` +
            "Silakan menunggu admin untuk proses verifikasi selanjutnya. 🙏\n\n" +
            "Jam Operasional 08.00 - 16.00 WIB\n\n" +
            "Ini adalah pesan otomatis."
          );

          userState.delete(message.from);
          return;
        }

        // ❌ Belum pilih menu → pilihan tidak dikenali
        await client.sendText(
          message.from,
          "❌ Pilihan tidak dikenali.\n\n" +
          getMenu(contactName)
        );
        return;
      }

      // ==================================================
      // 🔹 USER BARU → KIRIM MENU
      // ==================================================
      if (!users.has(message.from)) {
        users.add(message.from);
        await client.sendText(message.from, getMenu(contactName));
        return;
      }

      // ==================================================
      // 🔹 HANDLE MENU TEKS
      // ==================================================
      switch (message.body.trim()) {

        case "1":
          userState.set(message.from, "webinar");
          await client.sendText(
            message.from,
            "📝 Pendaftaran Webinar XCODE\n\n" +
            "Langkah pendaftaran:\n" +
            "1. Peserta mengisi form: bit.ly/PendaftaranXCODE\n" +
            "2. Lakukan pembayaran ke:\n" +
            "   • BCA 4452254135\n" +
            "   • BRI 0240501003046300\n" +
            "3. Kirim bukti transaksi ke nomor ini.\n" +
            "4. Tunggu admin membagikan link grup WA Webinar.\n\n" +
            "Jam Operasional 08.00 - 16.00 WIB\n\n" +
            "Ini adalah pesan otomatis."
          );
          break;

        case "2":
          userState.set(message.from, "bootcamp");
          await client.sendText(
            message.from,
            "📝 Pendaftaran Bootcamp XCODE\n\n" +
            "Langkah pendaftaran:\n" +
            "1. Peserta mengisi form: bit.ly/RegistrasiXCODE\n" +
            "2. Lakukan pembayaran ke:\n" +
            "   • BCA 4452254135\n" +
            "   • BRI 0240501003046300\n" +
            "3. Kirim bukti transaksi ke nomor ini.\n" +
            "4. Tunggu admin membagikan link grup WA Bootcamp.\n\n" +
            "Jam Operasional 08.00 - 16.00 WIB\n\n" +
            "Ini adalah pesan otomatis."
          );
          break;

        default:
          await client.sendText(
            message.from,
            "❌ Pilihan tidak dikenali.\n\n" +
            getMenu(contactName)
          );
          break;
      }

    } catch (err) {
      console.error("❌ Error handler:", err);
    }
  });
}
