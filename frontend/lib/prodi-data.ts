export interface ProfilLulusanItem {
  title: string;
  desc: string;
}

export interface CapaianPembelajaranItem {
  title: string;
  desc: string;
}

export interface ProdiDetailData {
  id: string;
  badge: string;
  nama: string;
  title: string;
  jenjang: string;
  gelar: string;
  intro: string;
  profilLulusanIntro: string;
  profilLulusan: ProfilLulusanItem[];
  capaianPembelajaran: CapaianPembelajaranItem[];
  gelarAkademik: string;
}

export const prodiDetailDataBilingual: Record<"id" | "eng", Record<string, ProdiDetailData>> = {
  id: {
    mpi: {
      id: "mpi",
      badge: "MPI",
      nama: "Manajemen Pendidikan Islam",
      title: "Manajemen Pendidikan Islam",
      jenjang: "S1",
      gelar: "Sarjana Pendidikan (S.Pd.)",
      intro:
        "Program Studi S1 Manajemen Pendidikan Islam (MPI) STAI Cendekia Insani Situbondo didirikan untuk melahirkan manajer, pengelola, dan tenaga kependidikan yang profesional, kompeten, serta berintegritas berlandaskan nilai-nilai Islam. Prodi ini memadukan konsep-konsep manajemen modern dengan landasan nilai-nilai keislaman dan kelembagaan pendidikan Islam. Lulusan dipersiapkan untuk merencanakan, mengelola, memimpin, serta mengevaluasi berbagai lembaga pendidikan, baik madrasah, sekolah berasrama (pesantren), maupun instansi kependidikan modern.",
      profilLulusanIntro:
        "Lulusan S1 Manajemen Pendidikan Islam STAI Cendekia Insani Situbondo diproyeksikan untuk mengisi posisi strategis di ranah pendidikan Islam, antara lain:",
      profilLulusan: [
        {
          title: "Manajer / Pengelola Lembaga Pendidikan Islam",
          desc: "Kepala Sekolah/Madrasah, Pengelola Pesantren, Direktur Pendidikan Islam/Yayasan.",
        },
        {
          title: "Administrator & Tenaga Kependidikan",
          desc: "Staf Tata Usaha, Analis Mutu Pendidikan, Pengelola Kurikulum, Supervisor Kependidikan di instansi pemerintah (Kemenag/Dinas Pendidikan) maupun swasta.",
        },
        {
          title: "Konsultan / Evaluator Pendidikan",
          desc: "Pendamping mutu sekolah/madrasah dan pengembang sistem manajemen pendidik.",
        },
        {
          title: "Pengusaha / Entrepreneur Pendidikan",
          desc: "Pendiri atau pengelola lembaga kursus, EdTech, pelatihan kependidikan, serta pondok pesantren modern.",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Integrasi Keilmuan",
          desc: "Menggabungkan teori manajemen tata kelola pendidikan modern dengan spirit akhlakul karimah dan pesantren.",
        },
        {
          title: "Kompetensi Manajerial",
          desc: "Menguasai perencanaan strategis (strategic planning), manajemen SDM kependidikan, manajemen keuangan, hingga supervisi/penjaminan mutu pendidikan.",
        },
        {
          title: "Siap Lapangan Kerja",
          desc: "Pembekalan praktik magang/PPL di berbagai lembaga pendidikan terkemuka dan instansi kependidikan.",
        },
      ],
      gelarAkademik:
        "Lulusan Program Studi S1 Manajemen Pendidikan Islam akan memperoleh gelar akademik Sarjana Pendidikan (S.Pd.).",
    },
    as: {
      id: "hki",
      badge: "HKI (AS)",
      nama: "Hukum Keluarga Islam (Ahwal Al-Syakhsiyah)",
      title: "Hukum Keluarga Islam",
      jenjang: "S1",
      gelar: "Sarjana Hukum (S.H.)",
      intro:
        "Program Studi S1 Hukum Keluarga Islam (HKI) / Ahwal Al-Syakhsiyah STAI Cendekia Insani Situbondo didirikan untuk mencetak sarjana hukum yang ahli di bidang hukum perdata Islam, hukum keluarga, advokasi, serta tata kelola administrasi syariah. Prodi ini memadukan kedalaman literatur keislaman klasik (turats) dengan perundang-undangan positif di Indonesia dan perkembangan hukum keluarga modern. Lulusan dipersiapkan untuk menjadi praktisi hukum, hakim, advokat, konsultan keluarga, hingga akademisi yang berintegritas dan berintelektual tinggi.",
      profilLulusanIntro:
        "Lulusan S1 Hukum Keluarga Islam STAI Cendekia Insani Situbondo memiliki peluang karir yang luas di lembaga peradilan, pemerintahan, maupun swasta:",
      profilLulusan: [
        {
          title: "Praktisi Peradilan & Advokat",
          desc: "Hakim Pengadilan Agama, Advokat/Pengacara Syariah, Panitera, Juru Sita, dan Legal Officer lembaga hukum.",
        },
        {
          title: "Penghulu & Pegawai KUA",
          desc: "Penghulu, Pegawai Pencatat Nikah (PPN), Administrator Hukum Islam di Kementerian Agama.",
        },
        {
          title: "Konsultan & Mediasi Keluarga",
          desc: "Mediator Sengketa Keluarga, Konsultan BP4 (Badan Penasihatan, Pembinaan, dan Pelestarian Perkawinan), dan Pembina Keluarga Sakinah.",
        },
        {
          title: "Akademisi & Peneliti Hukum",
          desc: "Peneliti Hukum Perdata Islam, Tenaga Pengajar/Pendidik, dan Analis Kebijakan Hukum Keagamaan.",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Integrasi Hukum Fiqh & Perundang-undangan",
          desc: "Menguasai Fiqh Munakahat, Mawaris, Jinayah, Kompilasi Hukum Islam (KHI), hingga UU Perkawinan Indonesia.",
        },
        {
          title: "Keahlian Praktis Peradilan",
          desc: "Pembekalan praktik peradilan semu (moot court), penyusunan berkas perkara, teknik mediasi, dan advokasi hukum perdata syariah.",
        },
        {
          title: "Kemitraan Instansional",
          desc: "Pelaksanaan magang/PPL langsung di Pengadilan Agama, KUA, serta Lembaga Bantuan Hukum (LBH).",
        },
      ],
      gelarAkademik:
        "Lulusan Program Studi S1 Hukum Keluarga Islam akan memperoleh gelar akademik Sarjana Hukum (S.H.).",
    },
    kpi: {
      id: "kpi",
      badge: "KPI",
      nama: "Komunikasi dan Penyiaran Islam",
      title: "Komunikasi dan Penyiaran Islam",
      jenjang: "S1",
      gelar: "Sarjana Sosial (S.Sos.)",
      intro:
        "Program Studi S1 Komunikasi dan Penyiaran Islam (KPI) STAI Cendekia Insani Situbondo didirikan untuk melahirkan praktisi media, jurnalis, konten kreator, serta da'i profesional yang adaptif terhadap perkembangan teknologi digital dan media modern berlandaskan nilai-nilai Islam. Prodi ini menggabungkan teori komunikasi massa, keahlian produksi media (penyiaran radio, televisi, dan media digital/cyber), serta teknik dakwah kreatif. Lulusan dipersiapkan untuk merancang, memproduksi, dan menyebarkan pesan-pesan komunikasi yang edukatif, informatif, dan menginspirasi di tengah era transformasi digital.",
      profilLulusanIntro:
        "Lulusan S1 Komunikasi dan Penyiaran Islam STAI Cendekia Insani Situbondo memiliki prospek karir yang luas di industri kreatif, media, dan humas:",
      profilLulusan: [
        {
          title: "Praktisi Penyiaran & Media Digital",
          desc: "Presenter/Broadcaster, Anchor/Pembaca Berita, Reporter, Video Editor, serta Produser Program Radio, Televisi, dan Podcasting.",
        },
        {
          title: "Jurnalis & Penulis Media Digital",
          desc: "Wartawan, Redaktur Media Cyber, Copywriter, dan Content Writer di berbagai media cetak maupun portal berita digital.",
        },
        {
          title: "Konten Kreator & Specialist Media Sosial",
          desc: "Social Media Specialist, Kreator Konten Digital, Digital Marketer, serta Pengelola Media Dakwah Digital.",
        },
        {
          title: "Humas (Public Relations) & Komunikasi Publik",
          desc: "Public Relations Officer (PRO), Staf Humas instansi pemerintah/swasta, dan Praktisi Komunikasi Organisasi.",
        },
        {
          title: "Da'i & Praktisi Dakwah Kreatif",
          desc: "Da'i/Penceramah profesional yang memanfaatkan media modern untuk syiar Islam (Digital Da'i).",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Penguasaan Media Digital",
          desc: "Menguasai teknik produksi konten audio visual, jurnalistik investigasi & cyber, teknik penulisan naskah, hingga manajemen media sosial.",
        },
        {
          title: "Integrasi Dakwah & Industri Kreatif",
          desc: "Mengisi celah kebutuhan industri media modern akan konten-konten Islami yang berkualitas, santun, dan menyejukkan.",
        },
        {
          title: "Praktik Lapangan Khusus",
          desc: "Pembekalan magang/PPL di stasiun radio, televisi, studio produksi, instansi humas, serta portal media berita terkemuka.",
        },
      ],
      gelarAkademik:
        "Lulusan Program Studi S1 Komunikasi dan Penyiaran Islam akan memperoleh gelar akademik Sarjana Sosial (S.Sos.).",
    },
  },
  eng: {
    mpi: {
      id: "mpi",
      badge: "MPI",
      nama: "Islamic Education Management",
      title: "Islamic Education Management",
      jenjang: "S1",
      gelar: "Bachelor of Education (S.Pd.)",
      intro:
        "The Undergraduate Program in Islamic Education Management (MPI) at STAI Cendekia Insani Situbondo is established to produce professional, competent, and ethical educational leaders, managers, and administrators rooted in Islamic values. This program combines modern management concepts with the foundation of Islamic values and educational institutions. Graduates are prepared to plan, manage, lead, and evaluate various educational institutions, including madrasahs, Islamic boarding schools (pesantren), and modern academic institutions.",
      profilLulusanIntro:
        "Graduates of Islamic Education Management at STAI Cendekia Insani Situbondo are projected to hold strategic positions in the field of Islamic education, including:",
      profilLulusan: [
        {
          title: "Islamic Educational Institution Manager / Leader",
          desc: "Principals/Headmasters of Madrasahs, Boarding School Directors, Foundation Education Directors.",
        },
        {
          title: "Administrator & Educational Staff",
          desc: "Administrative Staff, Quality Assurance Analysts, Curriculum Managers, Education Supervisors in government (Ministry of Religious Affairs/Education Office) and private sectors.",
        },
        {
          title: "Educational Consultant / Evaluator",
          desc: "School/Madrasah quality mentors and educator management system developers.",
        },
        {
          title: "Educational Entrepreneur",
          desc: "Founders and operators of training institutions, EdTech startups, educational courses, and modern Islamic schools.",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Scientific Integration",
          desc: "Combining modern governance and management theories with the spirit of Islamic ethics (akhlakul karimah) and pesantren traditions.",
        },
        {
          title: "Managerial Competency",
          desc: "Mastering strategic planning, human resource management, educational finance, and quality assurance/supervision.",
        },
        {
          title: "Career Readiness",
          desc: "Comprehensive practical internship (PPL) in leading educational institutions and government bodies.",
        },
      ],
      gelarAkademik:
        "Graduates of the Undergraduate Program in Islamic Education Management will earn the academic degree of Bachelor of Education (S.Pd.).",
    },
    as: {
      id: "hki",
      badge: "HKI (AS)",
      nama: "Islamic Family Law (Ahwal Al-Syakhsiyah)",
      title: "Islamic Family Law",
      jenjang: "S1",
      gelar: "Bachelor of Laws (S.H.)",
      intro:
        "The Undergraduate Program in Islamic Family Law (HKI / Ahwal Al-Syakhsiyah) at STAI Cendekia Insani Situbondo is established to produce legal scholars specialized in Islamic civil law, family law, advocacy, and Sharia administrative governance. The program integrates the depth of classical Islamic literature (turats) with positive Indonesian statutory laws and contemporary family law developments. Graduates are prepared to become judicial practitioners, judges, advocates, family consultants, and legal scholars with high integrity.",
      profilLulusanIntro:
        "Graduates of Islamic Family Law at STAI Cendekia Insani Situbondo have broad career opportunities in judiciary institutions, government, and private law firms:",
      profilLulusan: [
        {
          title: "Judicial Practitioners & Advocates",
          desc: "Religious Court Judges, Sharia Advocates/Attorneys, Court Registrars, Bailiffs, and Corporate Legal Officers.",
        },
        {
          title: "Registrars & KUA Officials",
          desc: "Islamic Marriage Registrars (Penghulu), Marriage Recording Officials (PPN), Islamic Law Administrators in the Ministry of Religious Affairs.",
        },
        {
          title: "Family Dispute Mediators & Consultants",
          desc: "Family Dispute Mediators, BP4 Marriage Counselors, and Family Life Advisors.",
        },
        {
          title: "Legal Academics & Researchers",
          desc: "Islamic Civil Law Researchers, Lecturers/Educators, and Religious Legal Policy Analysts.",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Fiqh & Statutory Law Integration",
          desc: "Mastering Islamic Marriage Law (Munakahat), Inheritance (Mawaris), Criminal Law (Jinayah), Compilation of Islamic Law (KHI), and Indonesian Marriage Acts.",
        },
        {
          title: "Practical Judicial Skills",
          desc: "Practical training in moot court simulations, legal drafting of case files, mediation techniques, and civil Sharia advocacy.",
        },
        {
          title: "Institutional Partnerships",
          desc: "Direct internship (PPL) programs at Religious Courts, Religious Affairs Offices (KUA), and Legal Aid Institutions (LBH).",
        },
      ],
      gelarAkademik:
        "Graduates of the Undergraduate Program in Islamic Family Law will earn the academic degree of Bachelor of Laws (S.H.).",
    },
    kpi: {
      id: "kpi",
      badge: "KPI",
      nama: "Islamic Communication and Broadcasting",
      title: "Islamic Communication and Broadcasting",
      jenjang: "S1",
      gelar: "Bachelor of Social Science (S.Sos.)",
      intro:
        "The Undergraduate Program in Islamic Communication and Broadcasting (KPI) at STAI Cendekia Insani Situbondo is established to produce media practitioners, journalists, digital content creators, and professional preachers (da'i) who are adaptive to digital technology and modern media, rooted in Islamic values. The program combines mass communication theories, media production skills (radio, television broadcasting, and digital/cyber media), and creative da'wah techniques. Graduates are prepared to design, produce, and broadcast educational, informative, and inspiring messages in the digital transformation era.",
      profilLulusanIntro:
        "Graduates of Islamic Communication and Broadcasting at STAI Cendekia Insani Situbondo have extensive career prospects in the creative industry, broadcasting, and public relations:",
      profilLulusan: [
        {
          title: "Broadcasting & Digital Media Practitioners",
          desc: "Presenters/Broadcasters, News Anchors, Field Reporters, Video Editors, and Radio/TV/Podcast Producers.",
        },
        {
          title: "Journalists & Digital Media Writers",
          desc: "Cyber Media Reporters, Editors, Copywriters, and Content Writers for print and digital news portals.",
        },
        {
          title: "Content Creators & Social Media Specialists",
          desc: "Social Media Specialists, Digital Content Creators, Digital Marketers, and Islamic Da'wah Media Managers.",
        },
        {
          title: "Public Relations (PR) & Corporate Communications",
          desc: "Public Relations Officers (PRO), Corporate Communications Staff in government and private institutions.",
        },
        {
          title: "Creative Da'i & Religious Communicators",
          desc: "Professional religious communicators utilizing digital multimedia platforms (Digital Da'i).",
        },
      ],
      capaianPembelajaran: [
        {
          title: "Digital Media Mastery",
          desc: "Mastering audio-visual content production, investigative & cyber journalism, scriptwriting, and strategic social media management.",
        },
        {
          title: "Da'wah & Creative Industry Integration",
          desc: "Fulfilling modern media industry needs with high-quality, polite, and inspiring Islamic content.",
        },
        {
          title: "Specialized Field Internships",
          desc: "Practical internships (PPL) at radio stations, television channels, production houses, PR agencies, and leading news media.",
        },
      ],
      gelarAkademik:
        "Graduates of the Undergraduate Program in Islamic Communication and Broadcasting will earn the academic degree of Bachelor of Social Science (S.Sos.).",
    },
  },
};

// Aliases for HKI
prodiDetailDataBilingual.id.hki = prodiDetailDataBilingual.id.as;
prodiDetailDataBilingual.eng.hki = prodiDetailDataBilingual.eng.as;

export function getProdiDetail(slug: string, lang: "id" | "eng" = "id"): ProdiDetailData | undefined {
  const normalizedSlug = slug.toLowerCase();
  const dict = prodiDetailDataBilingual[lang] || prodiDetailDataBilingual.id;
  return dict[normalizedSlug];
}

// Backward compatibility map
export const prodiDetailDataMap: Record<string, ProdiDetailData> = prodiDetailDataBilingual.id;
