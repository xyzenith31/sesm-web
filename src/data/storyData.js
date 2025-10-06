// Data untuk cerita Kancil dan Buaya
export const kancilStory = {
  // Titik awal cerita
  start: {
    image: 'https://img.freepik.com/free-vector/flat-illustration-kancil-eat-cucumber_1308-117215.jpg?w=740',
    text: "Si Kancil sangat lapar dan melihat banyak buah rambutan di seberang sungai. Tapi, sungai itu dijaga oleh sekawanan buaya ganas. Apa yang harus Kancil lakukan?",
    choices: [
      { text: "Mencoba menipu buaya", leadsTo: 'tipu_buaya' },
      { text: "Mencari jalan lain", leadsTo: 'jalan_lain' }
    ]
  },
  // Alur 1: Menipu buaya
  tipu_buaya: {
    image: 'https://img.freepik.com/free-vector/collection-crocodiles-alligators_53876-85150.jpg?w=996',
    text: "Kancil berteriak, 'Hai para buaya! Raja hutan memintaku menghitung kalian semua untuk diberi hadiah daging!' Para buaya pun tertarik dan berkumpul.",
    choices: [
      { text: "Meminta buaya berbaris", leadsTo: 'ending_berhasil' },
      { text: "Langsung melompati mereka", leadsTo: 'ending_gagal' }
    ]
  },
  // Alur 2: Mencari jalan lain
  jalan_lain: {
    image: 'https://img.freepik.com/free-vector/hand-drawn-forest-landscape_52683-82173.jpg?w=1380',
    text: "Kancil memutuskan untuk tidak mengambil risiko. Ia berjalan menyusuri sungai dan menemukan sebuah jembatan goyang yang sudah tua. Sangat berbahaya untuk dilewati.",
    choices: [
      { text: "Tetap menyeberang lewat jembatan", leadsTo: 'ending_jembatan' },
      { text: "Kembali dan memikirkan cara lain", leadsTo: 'start' }
    ]
  },
  // Akhir Cerita
  ending_berhasil: {
    image: 'https://img.freepik.com/free-vector/deer-character-collection_23-2147743920.jpg?w=740',
    text: "Cerdik! Kancil meminta buaya berbaris rapi hingga ke seberang. Ia melompati punggung mereka satu per satu sambil pura-pura menghitung. Kancil berhasil sampai di seberang dan menikmati buah rambutan. (AKHIR CERITA 1/4)",
    ending: true
  },
  ending_gagal: {
    image: 'https://img.freepik.com/free-vector/predator-prey-cartoon-concept-with-running-scared-deer-wolf-vector-illustration_1284-82500.jpg?w=1060',
    text: "Terlalu gegabah! Kancil langsung melompat tanpa instruksi. Para buaya kaget dan marah, mereka pun mengejar Kancil. Kancil berhasil lolos tapi tidak jadi makan. (AKHIR CERITA 2/4)",
    ending: true
  },
  ending_jembatan: {
    image: 'https://img.freepik.com/free-vector/river-landscape-scene_1308-59363.jpg?w=1380',
    text: "Hampir saja! Kancil berhasil melewati jembatan tua itu dengan selamat, meskipun sangat ketakutan. Ia akhirnya bisa makan buah rambutan dengan tenang. (AKHIR CERITA 3/4)",
    ending: true
  }
};