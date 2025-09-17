const wppconnect = require('@wppconnect-team/wppconnect');

// 🔹 Simpan user supaya menu hanya dikirim sekali
const users = new Set();

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

  return false; // di luar itu → diam
}

// 🔹 Fungsi menu awal
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
  headless: true, // bisa false kalau mau lihat Chrome terbuka
  useChrome: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // pakai Chrome lokal
})
.then((client) => start(client))
.catch((err) => console.error("❌ Gagal start wppconnect:", err));

function start(client) {
  client.onMessage(async (message) => {
    try {
      // 🔸 Abaikan pesan dari grup
      if (message.isGroupMsg) {
        console.log("📵 Pesan dari grup diabaikan.");
        return;
      }
      if (message.from === "status@broadcast") {
        console.log("📵 Pesan status WA diabaikan.");
        return;
      }

      // 🔸 Cek jam operasional bot → kalau bukan jam aktif, diam saja
      if (!isActiveHour()) {
        console.log("⏰ Pesan masuk di luar jam operasional bot, diabaikan.");
        return;
      }

      const contactName = message.sender?.pushname || message.sender?.name || "";

      // Jika user baru → kirim menu
      if (!users.has(message.from)) {
        users.add(message.from);
        await client.sendText(message.from, getMenu(contactName));
        return;
      }

      // 🔸 Cek input menu
      switch (message.body.trim()) {
        case "1":
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
            "❌ Pilihan tidak dikenali.\n\n" + getMenu(contactName)
          );
          break;
      }
    } catch (err) {
      console.error("❌ Error handler:", err);
    }
  });
}


