export type KbCategory = "health" | "government" | "agriculture" | "general";

export interface KbSeed {
  title: string;
  content_kashmiri: string;
  content_english: string;
  category: KbCategory;
  source: string;
}

export const SEED_ENTRIES: KbSeed[] = [
  // ---------- Health ----------
  {
    title: "Sehat Sathi Scheme",
    content_kashmiri:
      "سیہت ساتھی اسکیم جموں و کشمیر حکومتُک مفت علاجُک انتظام چھُ۔ ہر خاندانَس ہر سالَس ۵ لاکھ تام مفت علاج ملان چھُ۔",
    content_english:
      "Sehat Sathi is a J&K government scheme providing free health treatment up to 5 lakhs per family per year at empanelled hospitals across Kashmir. Every resident of J&K is eligible. Register at your nearest PHC, CHC or district hospital with your Aadhaar card and address proof.",
    category: "health",
    source: "jkhealth.gov.in",
  },
  {
    title: "Emergency Numbers Kashmir",
    content_kashmiri:
      "ایمرجنسی نمبر: پولیس ۱۰۰، ایمبولینس ۱۰۸، فائر بریگیڈ ۱۰۱، خواتین ہیلپ لائن ۱۰۹۱، چائلڈ ہیلپ لائن ۱۰۹۸۔",
    content_english:
      "Emergency numbers in Kashmir: Police 100, Ambulance 108, Fire 101, Women helpline 1091, Child helpline 1098, Disaster helpline 1077, SMHS Hospital Srinagar 0194-2452018, SKIMS Soura 0194-2401013.",
    category: "health",
    source: "jkpolice.gov.in",
  },
  {
    title: "Common cold and flu",
    content_kashmiri:
      "زُکام تہٕ کھانسی: گرم پانی پیو، شہد تہٕ ادرک وول قہوہ پیو، آرام کٔرو۔ اگر بخار درائے یا سانس تنگ آسِہ، ڈاکٹر ہُنز مدد پرٲو۔",
    content_english:
      "For a common cold, cough or mild fever: drink warm water, kahwa with honey and ginger, rest well and stay warm. See a doctor if fever crosses 102°F, you have chest pain, breathing difficulty, or symptoms last more than 5 days.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Winter joint pain in elderly",
    content_kashmiri:
      "سیٹھاہ زیوٚنہٕ ونٹرَس منٛز جوڑنہٕ ہُنٛد دَرد گژھان چھُ۔ گرم پھیرَن پھیرو، ہلکہ ورزش، تہٕ گرم تیل واریاہ مالِش کٔرو۔ سخت درد آسِہ تہ ڈاکٹر ہُنز صلاح لیو۔",
    content_english:
      "Winter joint pain (arthritis) is common in Kashmir. Wear warm layered clothing, keep the room warm, do gentle stretching, apply warm mustard or sesame oil massage, and take vitamin D rich food. Consult an orthopaedic doctor if pain is severe or joints swell.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Diabetes daily care",
    content_kashmiri:
      "شوگر (ذیابیطس) وول مریض: میٹھی چیز کم کھیو، ہر روز پیدل چلو، وقت پہ دوا کھیو، تہٕ مہینَس اکھ کرت شوگر چیک کٔرو۔",
    content_english:
      "Daily diabetes care: avoid sugary foods and sweets, eat fresh vegetables and whole grains, walk 30 minutes every day, take medicines on time, and check blood sugar at least once a month. Free glucose testing is available at government PHCs.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "High blood pressure",
    content_kashmiri:
      "بلڈ پریشر ہیکہ ونٹرَس زیادہ گژھت۔ نمک کم کھیو، تناؤ کم کٔرو، ورزش کٔرو، تہٕ ہر مہینہ دباو چیک کروٲو۔",
    content_english:
      "High blood pressure often worsens in Kashmir winters. Reduce salt intake, avoid stress, do light daily exercise, quit smoking, and get BP checked monthly at the nearest health centre. Take prescribed medicines regularly — never stop them on your own.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Ayushman Bharat card",
    content_kashmiri:
      "آیوشمان بھارت گولڈن کارڈ ذریعہ مفت علاج ہیکو حاصل کٔرت۔ نزدیک کامن سروس سینٹر یا اسپتال ہُنٛد میں درخواست دیو۔",
    content_english:
      "Ayushman Bharat (PMJAY) golden card gives free hospital treatment up to 5 lakhs per family per year at empanelled hospitals. Apply at your nearest Common Service Centre (CSC), Ayushman Mitra desk in government hospitals, or online at pmjay.gov.in with Aadhaar.",
    category: "health",
    source: "pmjay.gov.in",
  },

  // ---------- Government schemes ----------
  {
    title: "PM Awas Yojana (Rural) Kashmir",
    content_kashmiri:
      "پی ایم آواس یوجنا: غریب خاندانَن مکان بنٲوٕنَس مالی مدد ملان چھِ۔ درخواست بلاک ڈولپمنٹ آفس دیو۔",
    content_english:
      "PM Awas Yojana (Gramin) provides ₹1.3 lakh in J&K to build a pucca house for eligible rural families. Apply at your Block Development Office (BDO) with Aadhaar, ration card, bank passbook and a photograph. Check status at pmayg.nic.in.",
    category: "government",
    source: "pmayg.nic.in",
  },
  {
    title: "Ration Card and PDS Kashmir",
    content_kashmiri:
      "راشن کارڈ ذریعہ سرکاری دکانَن پیٹھٕ سستا چاول، آٹو، چینی تہٕ مٹی تیل ملان چھُ۔ نَو کارڈ تحصیل فوڈ سپلائی آفس دیو۔",
    content_english:
      "PDS ration card holders in J&K get subsidized rice, wheat flour, sugar and kerosene from Fair Price Shops. Apply for a new ration card at the tehsil Food, Civil Supplies & Consumer Affairs (FCS&CA) office with Aadhaar, address proof and family photo. Check status at jkfcsca.gov.in.",
    category: "government",
    source: "jkfcsca.gov.in",
  },
  {
    title: "Old Age Pension J&K",
    content_kashmiri:
      "بوڈھَن ہُنٛد پنشن: ۶۰ ورِیہٕ کھوتہ زیادَٕ ہُنٛد کس، جس ہُنٛد آمدنی کم چھِہ، تِمَن ۱۰۰۰ روپَے ماہانہ پنشن ملان چھِ۔ تحصیل سماجی بہبود آفس دیو درخواست۔",
    content_english:
      "Integrated Social Security Scheme (ISSS) old age pension in J&K: ₹1000/month for citizens aged 60+ from low income households. Apply at the tehsil Social Welfare office with Aadhaar, bank passbook, age proof and income certificate.",
    category: "government",
    source: "jksw.jk.gov.in",
  },
  {
    title: "Widow pension J&K",
    content_kashmiri:
      "بیوہ خواتینَن ہُنٛد پنشن: ماہانہ ۱۰۰۰ روپَے ملان چھِ۔ تحصیل سماجی بہبود آفس درخواست دیو۔",
    content_english:
      "Widow pension under ISSS in J&K provides ₹1000 per month to eligible widows. Apply at the tehsil Social Welfare office with Aadhaar, husband's death certificate, bank passbook and income certificate.",
    category: "government",
    source: "jksw.jk.gov.in",
  },
  {
    title: "Aadhaar card update",
    content_kashmiri:
      "آدھار کارڈ اپڈیٹ: نزدیک آدھار سیوا کیندر یا پوسٹ آفس دیو ۵۰ روپَے فیس۔ نام، پتہ، فون یا فوٹو ہیکِہ اپڈیٹ گژھت۔",
    content_english:
      "Update Aadhaar (name, address, phone or photo) at the nearest Aadhaar Seva Kendra, post office or bank branch with proof documents and a ₹50 fee. Address can also be updated online at myaadhaar.uidai.gov.in.",
    category: "government",
    source: "uidai.gov.in",
  },
  {
    title: "Domicile certificate J&K",
    content_kashmiri:
      "ڈومیسائل سرٹیفکیٹ: تحصیل دار ہُنٛد دفتر دیو درخواست۔ ۱۵ دِنَن اندَر ملان چھُ۔",
    content_english:
      "J&K domicile certificate is required for jobs and admissions. Apply at the Tehsildar's office or online at jk.gov.in with Aadhaar, ration card, birth/school certificate and proof of 15 years residence. Issued within 15 days.",
    category: "government",
    source: "jk.gov.in",
  },
  {
    title: "PM Kisan Samman Nidhi",
    content_kashmiri:
      "پی ایم کسان اسکیم: چھوٹے کسانَن ۶۰۰۰ روپَے سالانہ ۳ قسطَن منٛز بینک اکاؤنٹَس منٛز جمعِ گژھان چھِ۔",
    content_english:
      "PM Kisan Samman Nidhi gives ₹6000 per year (in 3 instalments of ₹2000) directly to small and marginal farmers' bank accounts. Register at your Common Service Centre or online at pmkisan.gov.in with Aadhaar, land records and bank details.",
    category: "government",
    source: "pmkisan.gov.in",
  },
  {
    title: "Ladli Beti scheme J&K",
    content_kashmiri:
      "لاڈلی بیٹی اسکیم: بیٹی جنمنہٕ پتٕہ حکومت جمع کران چھِ ۱۰۰۰ روپَے ماہانہ ۱۴ ورِیہ تام۔",
    content_english:
      "Ladli Beti scheme in J&K deposits ₹1000/month for 14 years for girls born in economically weaker families (income under ₹75,000/year). Apply at the tehsil Social Welfare office with birth certificate, Aadhaar, income and bank details.",
    category: "government",
    source: "jksw.jk.gov.in",
  },

  // ---------- Agriculture / Horticulture ----------
  {
    title: "Apple Orchard Support Scheme",
    content_kashmiri:
      "چھونٹھ باغَن ہُنٛد اسکیم: کسانَن سبسڈی پیٹھ نَو پودَن، دوا تہٕ ٹریننگ ملان چھِ۔ ضلع ہارٹی کلچر افسر ہٕنٛدِ دفتر رابطہ کٔرو۔",
    content_english:
      "The J&K Horticulture Department provides subsidised high-density apple plants, pesticides, anti-hail nets and training to registered orchard farmers. Contact your district Horticulture Officer or visit jkhorticulture.nic.in to register.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Saffron farming support",
    content_kashmiri:
      "زعفران کاشت (پام پور): نیشنل سیفران مشن ذریعہ کسانَن قرن، پانی تہٕ ٹریننگ فراہم گژھان چھِ۔",
    content_english:
      "National Saffron Mission supports Kashmiri saffron farmers (mostly in Pampore, Pulwama) with corms, irrigation via borewells, sprinkler systems and modern drying units. Contact SKUAST-K or the district Agriculture Officer to register.",
    category: "agriculture",
    source: "skuastkashmir.ac.in",
  },
  {
    title: "Walnut and almond subsidy",
    content_kashmiri:
      "دون تہٕ بادام باغَن ہُنٛد سبسڈی: ہارٹی کلچر ڈپارٹمنٹ ذریعہ نَو پودَن پیٹھ ۵۰ فیصد تام سبسڈی ملان چھِ۔",
    content_english:
      "J&K Horticulture Department gives up to 50% subsidy on grafted walnut and almond saplings and drip irrigation to registered growers. Apply at your district Horticulture office.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Kisan Credit Card",
    content_kashmiri:
      "کسان کریڈٹ کارڈ ذریعہ کسان کم سود پیٹھ زرعی قرض ہیکِن گژھت۔ نزدیک بینک شاخَس منٛز درخواست دیو۔",
    content_english:
      "Kisan Credit Card (KCC) offers low-interest loans (4% with subsidy) for crops, fertilizer, horticulture and livestock. Apply at any nationalised bank or J&K Bank branch with land records, Aadhaar and passport photo.",
    category: "agriculture",
    source: "pmkisan.gov.in",
  },
  {
    title: "Soil health card",
    content_kashmiri:
      "مٹی صحت کارڈ: مفت مٹی ٹیسٹ کروٲو ضلع زراعت آفس منٛز، کہنُک کھاد کٔتیام دِیُن چھُ سُ بٲسِٲو۔",
    content_english:
      "Free Soil Health Card scheme tests farmers' soil and recommends the right fertilizer mix. Contact your Block or District Agriculture office to submit a soil sample.",
    category: "agriculture",
    source: "soilhealth.dac.gov.in",
  },
  {
    title: "Sheep rearing scheme",
    content_kashmiri:
      "چھَو پالنَن ہُنٛد اسکیم: شیپ ہسبنڈری ڈپارٹمنٹ ذریعہ سبسڈی پیٹھ چھَو، شیڈ تہٕ ٹریننگ ملان چھِ۔",
    content_english:
      "J&K Sheep Husbandry Department provides subsidy on sheep units, shed construction, feed and veterinary care under the Integrated Sheep Development Scheme. Contact your district Sheep Husbandry office.",
    category: "agriculture",
    source: "jksheephusbandrykmr.gov.in",
  },

  // ---------- General / Culture / Weather ----------
  {
    title: "Kashmir weather winter",
    content_kashmiri:
      "کشمیرَس منٛز ونٹر (دسمبر تا فروری) سیٹھاہ سرد آسان چھِ۔ گرم پھیرَن پھیرو، کانگَری استعمال کٔرو تہٕ برف پیٹھ ہوشیار چلو۔",
    content_english:
      "Kashmir winter (Chillai Kalan, mid-December to end January) is very cold with heavy snow. Wear layered warm clothes, use pheran and kangri safely (never sleep with a lit kangri), keep pipes wrapped to prevent freezing, and check power/water advisories.",
    category: "general",
    source: "jkgad.gov.in",
  },
  {
    title: "Kashmir weather summer",
    content_kashmiri:
      "کشمیرَس منٛز ہارُد (مئی تا اگست) خوشگوار موسم چھُ۔ دن گرم تہٕ راتھ ٹھنڈ آسان چھِ۔ سایہ داوٕ ٹوپی پھیرو تہٕ پانی کٔتیام پیو۔",
    content_english:
      "Kashmir summer (May–August) is pleasant, 15–30°C. Days can be sunny, evenings cool. Carry a hat, sunscreen, drink plenty of water and keep a light jacket for Gulmarg, Sonamarg and Pahalgam trips.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Prayer times Kashmir",
    content_kashmiri:
      "نمازُک وقت مسجد ہٕنٛدِ اعلان پیٹھٕ سُن۔ اللہ توہیہ ہُنٛد عبادت قبول کرِن۔",
    content_english:
      "Prayer times in Kashmir vary daily by ~5 minutes. Listen to your local mosque's azan or check the Auqaf-e-Islamia J&K schedule. Ramzan Sehri and Iftar times are announced on Radio Kashmir and DD Kashir.",
    category: "general",
    source: "auqaf.jk.gov.in",
  },
  {
    title: "Kashmiri Wazwan food",
    content_kashmiri:
      "وازوان چھُ کشمیرُک روایتی کھانا: روگن جوش، گوشتاوہ، رِستہٕ، تہٕ یخنی تام ۳۶ ڈش آسان چھِ۔",
    content_english:
      "Wazwan is the traditional multi-course Kashmiri feast served at weddings, with dishes like Rogan Josh, Gushtaba, Rista, Tabak Maaz, Yakhni and Kahwa. Vegetarian options include Dum Aloo, Nadur Yakhni and Chaman.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Tourism in Kashmir",
    content_kashmiri:
      "کشمیرَس منٛز گلمرگ، پہلگام، سونہ مرگ، ڈل جھیل، تہٕ مغل باغَٕ سیٹھاہ مشہور جگہ چھِ۔",
    content_english:
      "Top places to visit in Kashmir: Dal Lake and shikara ride in Srinagar, Mughal Gardens (Nishat, Shalimar, Chashme Shahi), Gulmarg gondola, Pahalgam Betaab valley, Sonamarg Thajiwas glacier, Doodhpathri, Yusmarg and Aharbal waterfall.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Public transport Srinagar",
    content_kashmiri:
      "سرینگر منٛز مٹادور، منی بس، آٹو تہٕ اولا/راپیڈو دستیاب چھِ۔ لال چوک تہٕ ٹی آر سی چھِ اہم اڈے۔",
    content_english:
      "Srinagar city has Matadors, Sumos, minibuses, autos and app cabs (Ola, Rapido, Uber in limited areas). Main hubs: Lal Chowk, TRC bus stand, Batamaloo and Parimpora. For Jammu, Delhi and airport routes, use JKSRTC buses from TRC.",
    category: "general",
    source: "jksrtc.co.in",
  },
  {
    title: "Kashmiri language greetings",
    content_kashmiri:
      "سلام = ہیلو، خیر = ٹھیک، شکریہ = مہربانی، ہا/آ = ہاں، نہٕ = نہیں، ژھٔ = تم/آپ، بہ = میں۔",
    content_english:
      "Common Kashmiri greetings: 'Assalam alaikum / Salaam' (hello), 'Kya haal chhu?' (how are you), 'Theek chhus' (I'm fine), 'Meherbani / Shukriya' (thank you), 'Khuda hafiz' (goodbye), 'Aa/Ha' (yes), 'Na' (no).",
    category: "general",
    source: "ikashmir.net",
  },
  {
    title: "Electricity complaints KPDCL",
    content_kashmiri:
      "بجلی مسٲلہ: کے پی ڈی سی ایل ہیلپ لائن ۱۹۱۲ پیٹھ فون کٔرو یا نزدیک سب اسٹیشن دیو رپورٹ۔",
    content_english:
      "For power cuts and complaints in Kashmir call KPDCL helpline 1912, or report at your nearest sub-station. Bills can be paid online at kpdcl.in or via BillDesk, Paytm and PhonePe.",
    category: "general",
    source: "kpdcl.in",
  },
  {
    title: "Water supply Jal Shakti",
    content_kashmiri:
      "پانی مسٲلہ: جل شکتی ڈپارٹمنٹ ہیلپ لائن ۰۱۹۴-۲۴۷۹۹۸۸ پیٹھ رابطہ کٔرو۔",
    content_english:
      "For water supply issues in Kashmir contact the Jal Shakti Department at 0194-2479988 or file a complaint at your Zonal PHE office. Report leakages and no-supply promptly, especially in winter when pipes freeze.",
    category: "general",
    source: "jaljk.gov.in",
  },
  {
    title: "Bank account opening J&K Bank",
    content_kashmiri:
      "بینک اکاؤنٹ کھولنَس: نزدیک جے کے بینک شاخ دیو آدھار، پین کارڈ تہٕ اکھ فوٹو۔ زیرو بیلنس اکاؤنٹ چھِ بھی دستیاب۔",
    content_english:
      "Open a bank account at any J&K Bank, SBI, PNB or HDFC branch with Aadhaar, PAN card and a passport-size photo. Zero-balance Jan Dhan accounts are available for low-income holders and include free RuPay debit card and accident insurance.",
    category: "government",
    source: "jkbank.com",
  },
  {
    title: "Scholarship for Kashmiri students",
    content_kashmiri:
      "طالبعلمَن ہُنٛد اسکالرشپ: پری میٹرک، پوسٹ میٹرک تہٕ پی ایم اسپیشل اسکالرشپ اسکیم دستیاب چھِ۔",
    content_english:
      "J&K students can apply for pre-matric and post-matric scholarships at scholarships.gov.in, plus the PM's Special Scholarship Scheme (PMSSS, aicte-jk-scholarship-gov.in) for undergraduates studying outside J&K. Deadlines are usually October–December each year.",
    category: "general",
    source: "scholarships.gov.in",
  },
  {
    title: "Snowfall and road closure",
    content_kashmiri:
      "سیٹھاہ برف پہٕنَن پتٕہ جواہر ٹنل تہٕ سرینگر-جموں ہائی وے بند سپدان چھِ۔ سفر پیوٚل ٹریفک ایڈوائزری چیک کٔرو۔",
    content_english:
      "During heavy snowfall the Srinagar–Jammu NH-44 and Jawahar Tunnel often close. Before travelling check the Kashmir Traffic Police advisory on X (@KashmirPolice) or call 0194-2450022. Keep warm clothes, food and a phone charger in the vehicle.",
    category: "general",
    source: "jkpolice.gov.in",
  },
  {
    title: "Kashmiri music and culture",
    content_kashmiri:
      "کشمیری موسیقی: صوفیانہ کلام، چکری، رَوف تہٕ ہیمل ناگرائے پرانے فن چھِ۔",
    content_english:
      "Kashmiri music traditions include Sufiana Kalam, Chakri, folk Rouf dance, and epic Hemal-Nagray recitals. Modern Kashmiri artists like Waheeda Mir, Rashid Hafiz, and Aabha Hanjura keep the language alive.",
    category: "general",
    source: "sangeetnatak.gov.in",
  },
];
