export type KbCategory =
  | "health"
  | "government"
  | "agriculture"
  | "general"
  | "schemes"
  | "weather"
  | "transport"
  | "tourism"
  | "culture";


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
  // ---------- Extended Health ----------
  {
    title: "Pregnancy care Kashmir",
    content_kashmiri:
      "حاملہ خواتین: ہر مہینہ نزدیک پی ایچ سی منٛز چیک اپ کروٲو، آئرن تہٕ فولک ایسڈ گولی کھیو، تہٕ گرم غذا کھیو۔ جننی سرکشا یوجنا ذریعہ اسپتالَس منٛز مفت ڈلیوری تہٕ ۱۴۰۰ روپَے مدد ملان چھِ۔",
    content_english:
      "Pregnant women in Kashmir should attend monthly antenatal checkups at the nearest PHC, take iron and folic acid tablets, eat warm nutritious food and avoid heavy lifting. Janani Suraksha Yojana gives free hospital delivery and ₹1400 cash assistance. Contact your ASHA worker.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "Child vaccination schedule",
    content_kashmiri:
      "شیرخوارَن ہُنٛد ٹیکہ: بی سی جی، پولیو، ہیپاٹائٹس بی، ڈی پی ٹی، خسرہ تہٕ روٹا وائرس ٹیکہ نزدیک آنگن واڑی یا پی ایچ سی منٛز مفت ملان چھِ۔",
    content_english:
      "Free childhood immunisation in J&K (Mission Indradhanush): BCG at birth, OPV, Hepatitis B, Pentavalent (DPT+HepB+Hib), Rotavirus, PCV, Measles-Rubella and JE. Available at every PHC, sub-centre and Anganwadi. Bring the Mother-Child Protection card.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "Mental health helpline",
    content_kashmiri:
      "ذہنی صحت: اگر تناؤ، اداسی یا خودکشی خیال آسِن، تیلی ٹیلی مانس ہیلپ لائن ۱۴۴۱۶ پیٹھ فون کٔرو (چوبیس گھنٹہ مفت)۔ آئی ایم ایچ اے این ایس سرینگر منٛز چھُ مفت کاؤنسلنگ۔",
    content_english:
      "Free mental health helpline Tele-MANAS 14416 (24×7, all Indian languages). In Kashmir, IMHANS-K Srinagar (Rainawari) offers free counselling, psychiatry OPD and de-addiction services. Do not hesitate — stress and depression are treatable.",
    category: "health",
    source: "telemanas.mohfw.gov.in",
  },
  {
    title: "COVID vaccination",
    content_kashmiri:
      "کووڈ ٹیکہ: مفت بوسٹر ڈوز نزدیک اسپتال یا پی ایچ سی منٛز ملان چھِ۔ کوون ایپ پیٹھ سرٹیفکیٹ ڈاؤن لوڈ کٔرو۔",
    content_english:
      "Free COVID-19 vaccine boosters are available at government hospitals and PHCs in J&K. Register on CoWIN (cowin.gov.in) or Aarogya Setu app with Aadhaar or phone number. Download vaccination certificate from CoWIN.",
    category: "health",
    source: "cowin.gov.in",
  },
  {
    title: "Dental care in Kashmir",
    content_kashmiri:
      "دَنٛدَن ہُنٛد خیال: دوہا دوہا دَنٛد صاف کٔرو، میٹھی چیز کم کھیو، تہٕ ۶ مہینَن پتہٕ ڈینٹسٹ منٛز چیک اپ کروٲو۔ گورنمنٹ ڈینٹل کالج شہید گنج سرینگر منٛز چھُ مفت علاج۔",
    content_english:
      "Free dental treatment at Government Dental College Shaheed Gunj Srinagar and SMHS. Brush twice a day, avoid sugary tea and sweets, and get a dental checkup every 6 months. For tooth pain use warm salt water rinse and see a dentist.",
    category: "health",
    source: "gdcsrinagar.edu.in",
  },
  {
    title: "Eye care and cataract",
    content_kashmiri:
      "اکھَن ہُنٛد خیال: بوڈھَس منٛز موتیا بند عام چھُ۔ نزدیک اسپتالَس منٛز مفت آپریشن ملان چھُ۔ اکھ درد آسِہ تہ فوراً ڈاکٹر ہیو۔",
    content_english:
      "Cataract is common in elderly Kashmiris. Free cataract surgery is available under the National Programme for Control of Blindness at SMHS Srinagar, ASCOMS Jammu and district hospitals. For eye pain, redness or sudden vision loss see an ophthalmologist immediately.",
    category: "health",
    source: "npcb.nhp.gov.in",
  },
  {
    title: "Tuberculosis treatment",
    content_kashmiri:
      "ٹی بی: کھانسی ۲ ہفتہ کھوتہ زیادَٕ آسِہ تہ ٹی بی ٹیسٹ کروٲو۔ علاج تہٕ دوا حکومت پیٹھٕ چھِ مفت، تہٕ نکش شپت یوجنا ذریعہ ۵۰۰ روپَے ماہانہ ملان چھِ۔",
    content_english:
      "If cough lasts more than 2 weeks, get free TB test at any government hospital. TB treatment is completely free under RNTCP/NTEP, and Ni-kshay Poshan Yojana pays ₹500/month to TB patients for nutrition. Do not stop medicines midway — complete the full 6 months.",
    category: "health",
    source: "tbcindia.gov.in",
  },
  {
    title: "Skin problems in winter",
    content_kashmiri:
      "ونٹرَس منٛز جِلد خشک تہٕ پھٹنِس چھِ۔ روزانہ موئسچرائزر یا ناریلٕک تیل لگٲو، گرم پانی سیٹھ نہ نہاو، تہٕ کانگَری سیٹھ زیادَٕ نزدیک مہ بہو۔",
    content_english:
      "Kashmir winter causes dry, cracked skin and 'kangri cancer' from prolonged kangri use. Apply moisturiser or coconut oil daily, avoid very hot baths, drink plenty of water, and do not hold the kangri too close to the skin for long hours. For persistent rashes see a dermatologist.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Cancer treatment SKIMS",
    content_kashmiri:
      "کینسر علاج: ایس کے آئی ایم ایس صورَٕ منٛز چھُ مفت کیموتھراپی تہٕ ریڈی ایشن۔ آیوشمان کارڈ ذریعہ ۵ لاکھ تام مفت علاج ملان چھُ۔",
    content_english:
      "SKIMS Soura in Srinagar offers cancer treatment (chemotherapy, radiotherapy, surgery) with free/subsidised care. Ayushman Bharat card gives up to ₹5 lakh free treatment. State Illness Assistance Fund covers additional costs — apply through your district hospital.",
    category: "health",
    source: "skims.ac.in",
  },
  {
    title: "First aid burns",
    content_kashmiri:
      "جلنے پیٹھ: فوراً ٹھنڈ پانی ۱۰-۱۵ منٹ تام ڈیو۔ ٹوتھ پیسٹ یا مکھن مہ لگٲو۔ چھالٕہ پھوٹٲو نَہٕ۔ سخت جلن آسِہ تہ اسپتال ہیو۔",
    content_english:
      "For minor burns: run cool (not ice) water over the area for 10–15 minutes, cover with clean cloth, do NOT apply toothpaste, butter or oil, do NOT pop blisters. For serious burns (larger than palm-size, on face or from electricity), go to hospital immediately or call 108.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Snake and dog bite",
    content_kashmiri:
      "سانپ یا کتہٕ کاٹنَس پتٕہ: زخم صابن سیٹھ دھو، خون بند کٔرو، تہٕ فوراً اسپتال ہیو۔ ریبیز تہٕ اینٹی وینم ٹیکہ گورنمنٹ اسپتالَن منٛز مفت چھِ۔",
    content_english:
      "For snake bite: keep the victim calm, immobilise the limb below heart level, and rush to hospital. For dog/cat bite: wash the wound with soap and running water for 15 minutes, then go to hospital for free anti-rabies vaccine (5 doses) available at all government hospitals in J&K.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Iron deficiency anaemia",
    content_kashmiri:
      "خون کم گژھنَس: ہفتہ منٛز اکھ کرت آئرن گولی کھیو۔ ہری سبزیاں، دال، گوشت، تہٕ گڑ کھیو۔ آنگن واڑی منٛز مفت گولی ملان چھِ۔",
    content_english:
      "Anaemia is common in Kashmiri women and children. Eat iron-rich foods: green leafy vegetables, dal, meat, jaggery, dates. Free IFA (iron-folic acid) tablets available at Anganwadi, schools and PHCs under Anaemia Mukt Bharat programme.",
    category: "health",
    source: "anemiamuktbharat.info",
  },
  {
    title: "Asthma and breathing",
    content_kashmiri:
      "دَمَٕ ہٕنٛد بیمار: ونٹرَس منٛز زیادَٕ گژھان چھُ۔ انہیلر ہمیشہ ہیو، دھواں تہٕ ٹھنڈ ہوا پیٹھٕ ہوشیار رٲو۔ سانس تنگ آسِہ تہ فوراً اسپتال ہیو۔",
    content_english:
      "Asthma flares up in Kashmir winter due to cold air, wood smoke and dust. Always carry your inhaler, avoid smoke from bukhari/kangri fumes in closed rooms, keep the house ventilated. Free inhalers available at government hospital chest OPD.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Kidney stone prevention",
    content_kashmiri:
      "گردَٕ منٛز پتھر: کٔتیام پانی پیو (دوہس ۳-۴ لیٹر)، نمک تہٕ گوشت کم کھیو، لیمو پانی پیو۔ کَمرَٕ درد آسِہ تہ الٹراساؤنڈ کروٲو۔",
    content_english:
      "Kidney stones are common in Kashmir due to low water intake in winter. Drink 3–4 litres of water daily, reduce salt and red meat, drink lemon water, avoid holding urine. For sudden severe back or side pain get an ultrasound. Free lithotripsy at SMHS and SKIMS.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Thyroid problems",
    content_kashmiri:
      "تھائرائڈ مسٲلہ: کشمیرَس منٛز عام چھُ۔ آیوڈین والا نمک کھیو، سالانہ ٹی ایس ایچ ٹیسٹ کروٲو۔ دوا ہمیشہ صبح خالی پیٹ کھیو۔",
    content_english:
      "Thyroid disorders are common in Kashmir (iodine deficiency belt). Use iodised salt, get an annual TSH test after age 30 (especially women), take thyroid medicine on empty stomach in the morning with water, and repeat TSH every 6 months.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Heart attack warning signs",
    content_kashmiri:
      "دِلَس ہُنٛد حملہ: سینَس درد، بایاں کن پیٹھ درد، پسینَٕ، سانس تنگ، تہٕ چکر آسِن تہ فوراً ۱۰۸ فون کٔرو۔ اسپرن گولی چبٲو اگر گژھِ دستیاب۔",
    content_english:
      "Heart attack warning signs: chest pain or heaviness, pain radiating to left arm/jaw, cold sweat, breathlessness, dizziness. Call 108 immediately, chew one aspirin if available, and get to SKIMS, SMHS or the nearest hospital fast. Do NOT drive yourself.",
    category: "health",
    source: "nhp.gov.in",
  },
  {
    title: "Stroke FAST symptoms",
    content_kashmiri:
      "فالج (سٹروک): چہرہ ٹیڑھ، ہتھ نہٕ اُٹھِنَس، بولنَس دشواری، تہ فوراً ۱۰۸ فون کٔرو۔ پہلی ۳ گھنٹہ سیٹھاہ اہم چھِ۔",
    content_english:
      "Recognise stroke with FAST: Face drooping, Arm weakness, Speech slurred, Time to call 108. The first 3 hours are critical. Rush to SKIMS Soura or SMHS Srinagar which have stroke units. Do not give food or water.",
    category: "health",
    source: "nhp.gov.in",
  },

  // ---------- Extended Government ----------
  {
    title: "Passport application Srinagar",
    content_kashmiri:
      "پاسپورٹ: passportindia.gov.in پیٹھ درخواست دیو، فیس بھرو تہٕ سرینگر پی ایس کے (پوسٹ آفس) منٛز اپوائنٹمنٹ ہیو۔ عام پاسپورٹ ۱۵۰۰ روپَے چھِ۔",
    content_english:
      "Apply for passport online at passportindia.gov.in, pay ₹1500 (36-page) or ₹2000 (60-page), and book appointment at POPSK GPO Srinagar or PSK Jammu. Bring Aadhaar, birth certificate, address proof and police verification. Tatkal fee is extra.",
    category: "government",
    source: "passportindia.gov.in",
  },
  {
    title: "Driving licence J&K",
    content_kashmiri:
      "ڈرائیونگ لائسنس: ARTO آفس منٛز لرنر لائسنس ہیو، ۳۰ دِنَن پتہٕ ڈرائیونگ ٹیسٹ ڈیو تہٕ پرمننٹ لائسنس ہیو۔ parivahan.gov.in پیٹھ آن لائن درخواست چھِ دستیاب۔",
    content_english:
      "Apply for driving licence at parivahan.gov.in or your ARTO office (Srinagar, Anantnag, Baramulla etc.). Get Learner's Licence first (₹200), then take driving test after 30 days. Bring Aadhaar, address proof, medical certificate (for age 40+) and passport photo.",
    category: "government",
    source: "parivahan.gov.in",
  },
  {
    title: "Vehicle registration RC",
    content_kashmiri:
      "گاڑی رجسٹریشن (آر سی): نوٕ گاڑی خرٕٔیتھ ڈیلر ذریعہ رجسٹریشن گژھِ۔ آر سی بک تہٕ HSRP نمبر پلیٹ لازمی چھِ۔ ایڈریس تبدیل کرنَس ARTO منٛز درخواست دیو۔",
    content_english:
      "New vehicle registration is done by the dealer at your ARTO. RC book and HSRP (High Security Number Plate) are mandatory in J&K. For address change, transfer of ownership or duplicate RC apply at parivahan.gov.in or ARTO office with Form 29/30 and Aadhaar.",
    category: "government",
    source: "parivahan.gov.in",
  },
  {
    title: "Voter ID card",
    content_kashmiri:
      "ووٹر کارڈ: ۱۸ ورِیہ کھوتہ زیادَٕ عمر آسِہ تہ voters.eci.gov.in پیٹھ یا Form 6 ذریعہ بی ایل او سیٹھ درخواست دیو۔ مفت چھِ۔",
    content_english:
      "Voter ID (EPIC): Indian citizens aged 18+ can apply free at voters.eci.gov.in or through BLO with Form 6. Bring Aadhaar, address and age proof. Digital e-EPIC can be downloaded after registration. For correction use Form 8.",
    category: "government",
    source: "eci.gov.in",
  },
  {
    title: "Income certificate J&K",
    content_kashmiri:
      "آمدنی سرٹیفکیٹ: تحصیل دار ہٕنٛد دفتر یا jkservices.jk.gov.in پیٹھ درخواست دیو۔ اسکالرشپ، داخلہ تہٕ ای ڈبلیو ایس کیٹگری خاطرٕ اہم چھُ۔",
    content_english:
      "J&K income certificate is needed for scholarships, EWS reservation and admissions. Apply at the Tehsildar's office or online at jkservices.jk.gov.in with Aadhaar, ration card, salary slip / affidavit and address proof. Issued in 15–30 days.",
    category: "government",
    source: "jkservices.jk.gov.in",
  },
  {
    title: "Category certificate SC/ST/OBC",
    content_kashmiri:
      "کیٹگری سرٹیفکیٹ (ایس سی، ایس ٹی، آر بی اے، او ایس سی): تحصیل دار سیٹھ درخواست دیو۔ ملازمت تہٕ داخلَس منٛز ریزرویشن ملان چھُ۔",
    content_english:
      "J&K category certificates (SC, ST, OBC, RBA, ALC, PSP) for reservation in jobs and admissions: apply at Tehsildar office with Aadhaar, ration card, parents' certificate and residence proof. Also available online at jkservices.jk.gov.in.",
    category: "government",
    source: "jkservices.jk.gov.in",
  },
  {
    title: "Birth certificate",
    content_kashmiri:
      "پیدائشُک سرٹیفکیٹ: ۲۱ دِنَن اندَر مقامی میونسپلٹی یا پنچایت منٛز رجسٹر کروٲو۔ ۲۱ دِنَن کھوتہ پتٕہ تحصیل دار سیٹھ درخواست گژھِ۔",
    content_english:
      "Register birth within 21 days at Srinagar Municipal Corporation, town committee or panchayat office (free). Late registration (up to 1 year) requires Tehsildar approval and small fee. Apply online at crsorgi.gov.in or in person with hospital discharge, Aadhaar and address proof.",
    category: "government",
    source: "crsorgi.gov.in",
  },
  {
    title: "Death certificate",
    content_kashmiri:
      "موت سرٹیفکیٹ: ۲۱ دِنَن اندَر میونسپلٹی یا پنچایت منٛز رجسٹر کٔرو۔ بینک، انشورنس تہٕ وراثت خاطرٕ ضروری چھُ۔",
    content_english:
      "Register death within 21 days at the local municipal/panchayat office (free). Required for bank, insurance, pension, property inheritance and remarriage. Bring hospital certificate or doctor's letter, Aadhaar of deceased and informant. Apply at crsorgi.gov.in or in person.",
    category: "government",
    source: "crsorgi.gov.in",
  },
  {
    title: "PAN card apply",
    content_kashmiri:
      "پین کارڈ: onlineservices.nsdl.com یا utiitsl.com پیٹھ آدھار ذریعہ درخواست دیو۔ ای پین مفت چھِ، پلاسٹک کارڈ ۱۰۷ روپَے۔",
    content_english:
      "PAN card: Apply online at onlineservices.nsdl.com or utiitsl.com using Aadhaar-based instant e-PAN (free, in 10 minutes) or physical card (₹107). Required for bank accounts, tax filing, mutual funds and any transaction above ₹50,000.",
    category: "government",
    source: "incometax.gov.in",
  },
  {
    title: "Ujjwala LPG gas connection",
    content_kashmiri:
      "اجولا اسکیم: غریب خواتینَن مفت گیس کنکشن، چولہا تہٕ پہلی ریفل ملان چھِ۔ نزدیک گیس ڈیلر سیٹھ درخواست دیو۔",
    content_english:
      "PM Ujjwala Yojana gives free LPG connection, stove and first refill to women from BPL/PMAY/AAY families. Apply at any Indane, HP or Bharat Gas distributor with Aadhaar, ration card, bank passbook and photo. Free refills also available under Ujjwala 2.0.",
    category: "government",
    source: "pmuy.gov.in",
  },
  {
    title: "MGNREGA rural jobs",
    content_kashmiri:
      "مہاتما گاندھی نریگا: دیہی گھرَن ۱۰۰ دن گارنٹی روزگار ملان چھُ۔ جاب کارڈ خاطرٕ پنچایت منٛز درخواست دیو۔",
    content_english:
      "MGNREGA guarantees 100 days of wage employment per rural household per year in J&K. Apply for a Job Card at your Gram Panchayat with Aadhaar and photo. Current daily wage in J&K is around ₹244. Payment goes directly to bank account.",
    category: "government",
    source: "nrega.nic.in",
  },
  {
    title: "PM SVANidhi street vendor loan",
    content_kashmiri:
      "پی ایم سونیدھی: چھوٹے دکاندارَن ۱۰،۰۰۰ روپَے تام بلا سود قرض ملان چھُ۔ نزدیک بینک یا SUDA آفس منٛز درخواست دیو۔",
    content_english:
      "PM SVANidhi provides collateral-free loans of ₹10,000 → ₹20,000 → ₹50,000 to street vendors, repayable in 1 year with 7% interest subsidy. Apply through Common Service Centres, J&K Bank, SBI or SUDA/JKUDA office with vendor certificate and Aadhaar.",
    category: "government",
    source: "pmsvanidhi.mohua.gov.in",
  },
  {
    title: "Sukanya Samriddhi girl child",
    content_kashmiri:
      "سکنیا سمرِدھی یوجنا: ۱۰ ورِیہ کھوتہ کم عمر بیٹی ہٕنٛد پوسٹ آفس یا بینک منٛز اکاؤنٹ کھولو۔ ۸ فیصد سود ملان چھُ تہٕ ٹیکس چھوٹ چھِ۔",
    content_english:
      "Sukanya Samriddhi Yojana: open account for a girl child under age 10 at post office or bank. Deposit ₹250–₹1.5 lakh per year for 15 years, currently earns ~8% interest tax-free, matures at age 21. Great for daughter's education and marriage savings.",
    category: "government",
    source: "nsiindia.gov.in",
  },
  {
    title: "Atal Pension Yojana",
    content_kashmiri:
      "اٹل پنشن یوجنا: ۱۸-۴۰ ورِیہ ہُنٛد ہر شخص نزدیک بینک منٛز اکاؤنٹ کھولن ہیکِہ۔ ۶۰ ورِیہ پتٕہ ۱۰۰۰-۵۰۰۰ روپَے ماہانہ پنشن ملان چھِ۔",
    content_english:
      "Atal Pension Yojana: anyone aged 18–40 with a bank account can enrol. Monthly contribution (as low as ₹42) gives guaranteed pension of ₹1000–₹5000 from age 60. Apply at any J&K Bank / SBI / PNB branch with Aadhaar.",
    category: "government",
    source: "npscra.nsdl.co.in",
  },
  {
    title: "PM Jeevan Jyoti insurance",
    content_kashmiri:
      "پی ایم جیون جیوتی بیمہ: ۴۳۶ روپَے سالانہ پریمیم ذریعہ ۲ لاکھ لائف انشورنس۔ ۱۸-۵۰ ورِیہ کس بینک اکاؤنٹ ہولڈر خاطرٕ چھُ۔",
    content_english:
      "PMJJBY life insurance: ₹436/year premium gives ₹2 lakh coverage for any cause of death. Available for bank account holders aged 18–50. PMSBY accident insurance: ₹20/year for ₹2 lakh accident cover. Enrol via your bank auto-debit.",
    category: "government",
    source: "jansuraksha.gov.in",
  },
  {
    title: "Free legal aid J&K",
    content_kashmiri:
      "مفت قانونی مدد: J&K Legal Services Authority ذریعہ غریبَن، خواتینَن تہٕ بچَن مفت وکیل ملان چھُ۔ ہیلپ لائن ۱۵۱۰۰ پیٹھ فون کٔرو۔",
    content_english:
      "Free legal aid in J&K: JKSLSA provides free lawyers and advice to women, children, SC/ST and low-income persons (income under ₹1 lakh). Call NALSA helpline 15100 or visit your district court Legal Services Committee. Lok Adalats settle disputes quickly.",
    category: "government",
    source: "jkslsa.org",
  },
  {
    title: "Consumer complaint",
    content_kashmiri:
      "دکاندار یا کمپنی سیٹھ شکایت: قومی صارف ہیلپ لائن ۱۹۱۵ پیٹھ فون کٔرو یا consumerhelpline.gov.in پیٹھ درخواست دیو۔ ضلع صارف کمیشن منٛز کیس دائر گژھِ۔",
    content_english:
      "For consumer complaints (defective goods, service issues, online fraud) call National Consumer Helpline 1915 or file at consumerhelpline.gov.in / edaakhil.nic.in. Free e-filing at District Consumer Commission for claims up to ₹1 crore.",
    category: "government",
    source: "consumerhelpline.gov.in",
  },
  {
    title: "Right to Information RTI",
    content_kashmiri:
      "معلومات کا حق (آر ٹی آئی): سرکاری آفس سیٹھ ۱۰ روپَے فیس دِتِتھ کوٚنہ معلومات ہیکِو۔ ۳۰ دِنَن اندَر جواب ملان چھُ۔",
    content_english:
      "Right to Information (RTI): Any citizen can request information from any J&K government office by paying ₹10 fee (BPL free). Response within 30 days. Apply online at rtionline.gov.in or file with the Public Information Officer of the concerned department.",
    category: "government",
    source: "rti.gov.in",
  },

  // ---------- Extended Agriculture ----------
  {
    title: "Cherry farming",
    content_kashmiri:
      "چرو کاشت: کشمیرَس منٛز جون تہٕ جولائی چرو موسم چھُ۔ ہارٹی کلچر ذریعہ ہائی ڈینسٹی چرو پودَن پیٹھ سبسڈی ملان چھِ۔",
    content_english:
      "Kashmir cherry season is June–July with mostly Misri, Double and Makhmali varieties. J&K Horticulture Department gives subsidised high-density cherry saplings, drip irrigation and anti-bird nets. Contact your district Horticulture Officer.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Rice paddy Kashmir",
    content_kashmiri:
      "برنج کاشت (شالیمار، کے ۳۹، جہلم): مئی-جون منٛز بوٲو، ستمبر-اکتوبر منٛز کاٹو۔ SKUAST-K منٛز مفت بیج تہٕ ٹریننگ ملان چھِ۔",
    content_english:
      "Kashmir rice varieties: Shalimar Rice-1/2/3, K-39, Jhelum, Chenab. Sow nursery in April, transplant in May–June, harvest in September–October. SKUAST-K provides certified seeds, training and free advisory. Register with your Block Agriculture Officer.",
    category: "agriculture",
    source: "skuastkashmir.ac.in",
  },
  {
    title: "Vegetable farming polyhouse",
    content_kashmiri:
      "پولی ہاؤس کاشت: ٹماٹر، شملہ مرچ، ککری، پتہ گوبی۔ ہارٹی کلچر ذریعہ پولی ہاؤس بنانَس ۵۰ فیصد سبسڈی ملان چھِ۔",
    content_english:
      "Polyhouse vegetable farming (capsicum, tomato, cucumber, cabbage, lettuce) is profitable in Kashmir. J&K Horticulture gives 50% subsidy on polyhouse construction (up to 4000 m²), drip irrigation and quality seeds. Apply at district Horticulture office.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Beekeeping honey",
    content_kashmiri:
      "شہدُک کاروبار: ہارٹی کلچر ذریعہ مکھی باکسَن پیٹھ ۸۰ فیصد سبسڈی ملان چھِ۔ کشمیری اکاسیا تہٕ کارپا مکھی مقبول چھِ۔",
    content_english:
      "Beekeeping in Kashmir is highly profitable (Apis mellifera and Apis cerana). J&K Horticulture provides 80% subsidy on bee boxes, honey extractors and training. Contact the Directorate of Horticulture or KVK Malangpora. Kashmir honey has strong export demand.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Poultry farming subsidy",
    content_kashmiri:
      "مرغی پالنَٕ اسکیم: پولٹری ڈپارٹمنٹ ذریعہ چوزَن، شیڈ تہٕ فیڈ پیٹھ سبسڈی ملان چھِ۔ خواتینَن خاطرٕ خصوصی اسکیمَٕ چھِ۔",
    content_english:
      "J&K Animal Husbandry runs poultry subsidy schemes: 40–60% subsidy on chicks, sheds, feed and equipment. Special schemes for women (Kashmir Broiler and Layer schemes) and SC/ST/BPL families. Register at your district Poultry Development Office.",
    category: "agriculture",
    source: "jkanimalhusbandrykmr.gov.in",
  },
  {
    title: "Fish farming trout",
    content_kashmiri:
      "ٹراؤٹ فش فارمنگ: کشمیر ٹھنڈ پانی خاطرٕ بہترین چھُ۔ فشریز ڈپارٹمنٹ ذریعہ تالاب بنانَس، بیج تہٕ فیڈ پیٹھ مالی مدد ملان چھِ۔",
    content_english:
      "Rainbow trout farming thrives in Kashmir's cold streams. J&K Fisheries Department gives financial assistance for raceway construction, trout seed (fingerlings) and feed under PMMSY. Contact district Fisheries Officer or Kokernag Trout Farm.",
    category: "agriculture",
    source: "jkfisheries.jk.gov.in",
  },
  {
    title: "Mushroom cultivation",
    content_kashmiri:
      "کھمبَٕ کاشت (مشروم): بٹن مشروم کشمیر ونٹرَس منٛز بہترین گژھان چھِ۔ SKUAST-K ذریعہ ٹریننگ تہٕ اسپان (بیج) ملان چھُ۔",
    content_english:
      "Button mushroom cultivation is ideal for Kashmir winters. SKUAST-K Shalimar and Directorate of Agriculture provide training, quality spawn and 50% subsidy on cropping units. Ideal side income for small farmers and women SHGs.",
    category: "agriculture",
    source: "skuastkashmir.ac.in",
  },
  {
    title: "Dairy cow subsidy",
    content_kashmiri:
      "دودَٕ فارم: ہولسٹن یا جرسی گائیک یونٹ پیٹھ NABARD تہٕ Animal Husbandry ذریعہ ۳۳-۵۰ فیصد سبسڈی ملان چھِ۔",
    content_english:
      "Dairy farming subsidy in J&K: 33–50% subsidy on cross-bred cow units (Holstein Friesian, Jersey), milking machines and chaff cutters under NABARD Dairy Entrepreneurship Development Scheme. Apply at your Block Animal Husbandry office or J&K Bank.",
    category: "agriculture",
    source: "jkanimalhusbandrykmr.gov.in",
  },
  {
    title: "Anti-hail nets orchards",
    content_kashmiri:
      "اولے مخالف جال (اینٹی ہیل نیٹ): چھونٹھ باغَن ہُنٛد حفاظت خاطرٕ ہارٹی کلچر ذریعہ ۵۰ فیصد سبسڈی ملان چھِ۔",
    content_english:
      "Anti-hail nets for apple, pear and cherry orchards get 50% subsidy under HADP (Holistic Agriculture Development Programme) in J&K. Nets prevent devastating hail damage. Apply at your district Horticulture office with land documents.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Cold storage subsidy",
    content_kashmiri:
      "کولڈ سٹور: چھونٹھ تہٕ سبزیاں ذخیرَٕ کرنَس ہارٹی کلچر ذریعہ ۳۵ فیصد کیپیٹل سبسڈی ملان چھِ۔",
    content_english:
      "Cold storage / CA store subsidy in Kashmir: 35% capital subsidy under Mission for Integrated Development of Horticulture (MIDH) for apple, pear and vegetables. Apply through J&K Horticulture Planning & Marketing Department.",
    category: "agriculture",
    source: "jkhorticulture.nic.in",
  },
  {
    title: "Weather forecast farmers",
    content_kashmiri:
      "کسانَن خاطرٕ موسم پیشگوئی: میگھدوت ایپ ڈاؤن لوڈ کٔرو یا Kisan SMS خدمت خاطرٕ رجسٹر کٔرو۔ ۵ دِنَن ہُنٛد پیشگوئی مفت ملان چھِ۔",
    content_english:
      "Farmers can get free 5-day weather forecast and agri-advisory via Meghdoot app (IMD), Kisan Suvidha app, or Kisan Call Centre 1800-180-1551. Register on mkisan.gov.in for free SMS alerts on weather, pest and market prices in your area.",
    category: "agriculture",
    source: "imdagrimet.gov.in",
  },
  {
    title: "PMFBY crop insurance",
    content_kashmiri:
      "پردھان منتری فصل بیمہ یوجنا: کم پریمیم پیٹھ فصلَن ہُنٛد بیمہ۔ اولے، سیلاب یا خشک سالی سیٹھ نقصان آسِہ تہ معاوضہ ملان چھُ۔",
    content_english:
      "PM Fasal Bima Yojana insures crops against hail, flood, drought and pest attack at very low premium (1.5–2% for kharif/rabi). Enrol through your bank, PACS or CSC with land record, Aadhaar and sowing certificate. Claims paid to bank account.",
    category: "agriculture",
    source: "pmfby.gov.in",
  },

  // ---------- Extended Tourism & Transport ----------
  {
    title: "Gulmarg gondola booking",
    content_kashmiri:
      "گلمرگ گنڈولا: فیز ۱ (کھلن مرگ) تہٕ فیز ۲ (اپروات) ٹکٹ jktdc.co.in پیٹھ آن لائن یا سائٹ منٛز ملان چھِ۔ ونٹرَس منٛز اسکیئنگ خاطرٕ مشہور چھُ۔",
    content_english:
      "Gulmarg Gondola (Asia's highest cable car): Phase-1 to Kongdoori ₹740, Phase-2 to Apharwat ₹950. Book online at jktdc.co.in or Gulmarg counter. Best snow December–March for skiing, best flowers April–June. Reach via 50 km road from Srinagar.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Pahalgam attractions",
    content_kashmiri:
      "پہلگام: بیتاب ویلی، ارو ویلی، چندنواڑی تہٕ لِدر دریا مشہور چھُ۔ گرمَٕ منٛز ٹھنڈ تہٕ خوبصورت جگہ چھِ۔",
    content_english:
      "Pahalgam (95 km from Srinagar) is famous for Betaab Valley, Aru Valley, Chandanwari (Amarnath yatra base), Lidder River rafting and pony rides. Best May–October. Local taxis around ₹2500 for full-day sightseeing. Stay in Pahalgam market or Aru village.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Sonamarg Thajiwas glacier",
    content_kashmiri:
      "سونہ مرگ (سُنَٕ مرگ): تھاجیواس گلیشیئر پیٹھ ٹٹو یا پیدل چلو۔ زوجی لَٕ پاس ذریعہ لدّاخ گژھِن۔",
    content_english:
      "Sonamarg (80 km from Srinagar, 2800 m) is the base for Thajiwas Glacier trek (pony ride ~₹1000). Also gateway to Ladakh via Zoji La Pass (open May–October). Best visit May–September. Stay in Sonamarg market or JKTDC huts.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Doodhpathri meadow",
    content_kashmiri:
      "دودھ پتری (بڈگام): سیٹھاہ خوبصورت میدان، پنڈرک وسٕو، تہٕ صاف پانی۔ سرینگر پیٹھٕ ۴۲ کلومیٹر دور چھُ۔",
    content_english:
      "Doodhpathri (42 km from Srinagar in Budgam) is a stunning alpine meadow with crystal streams (name means 'valley of milk'). Best April–October. Day trip by taxi (~₹2500) or shared sumo from Srinagar. Very few hotels — best as a day trip.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Yusmarg meadow",
    content_kashmiri:
      "یوسمرگ: بڈگامَس منٛز واقع، پہاڑَن سیٹھ گھری میدان۔ گرمَٕ منٛز ٹریک تہٕ پکنک خاطرٕ بہترین چھُ۔",
    content_english:
      "Yusmarg (47 km from Srinagar) is a pine-ringed meadow ideal for family picnics and short treks to Nilnag Lake and Doodh Ganga. Best April–October. Reach by taxi or shared sumo from Chadoora. Basic JKTDC accommodation available.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Amarnath yatra",
    content_kashmiri:
      "امرناتھ یاترا: جولائی-اگست منٛز شری امرناتھجی شرائن بورڈ (شراب) ذریعہ رجسٹریشن کٔرو۔ پہلگام تہٕ بلتال چھِ دو راستے۔",
    content_english:
      "Amarnath Yatra runs July–August. Register online at jkyatri.jk.gov.in / shriamarnathjishrine.com. Two routes: Pahalgam (48 km, 5 days) and Baltal (14 km, 2 days). Medical certificate mandatory (age 13–70). Helicopter services from Neelgrath and Pahalgam.",
    category: "general",
    source: "shriamarnathjishrine.com",
  },
  {
    title: "Vaishno Devi from Srinagar",
    content_kashmiri:
      "ویشنو دیوی: سرینگر پیٹھٕ جموں تہٕ اُتہٕ کترا تام بس یا ٹیکسی۔ آن لائن یاترا پرچی maavaishnodevi.org پیٹھ ملان چھِ۔",
    content_english:
      "For Mata Vaishno Devi from Kashmir: travel Srinagar → Jammu (JKSRTC bus or shared taxi, 8 hrs) → Katra (2 hrs). Register free yatra parchi at maavaishnodevi.org or Katra. 12 km trek or pony/palki/helicopter available. Best avoided in July–August rains.",
    category: "general",
    source: "maavaishnodevi.org",
  },
  {
    title: "Srinagar airport IXR",
    content_kashmiri:
      "سرینگر ایئرپورٹ (SXR): بدگام منٛز واقع چھُ۔ دلی، ممبئی، بنگلور تہٕ جموں خاطرٕ روزانہ فلائٹ چھِ۔ ونٹرَس منٛز کہرَٕ پاٹھِ فلائٹ لیٹ گژھن چھِ۔",
    content_english:
      "Srinagar International Airport (SXR, Budgam) has daily flights to Delhi, Mumbai, Bangalore, Jammu, Leh and Chandigarh (IndiGo, Air India, SpiceJet, Vistara). Winter fog often delays flights — book morning flights. Taxi to Lal Chowk ~₹700, Ola available.",
    category: "general",
    source: "aai.aero",
  },
  {
    title: "Srinagar Jammu highway NH44",
    content_kashmiri:
      "سرینگر-جموں ہائی وے (این ایچ-۴۴): ۲۷۰ کلومیٹر، ۸-۱۰ گھنٹہ۔ ونٹرَس منٛز برف پیٹھٕ بند گژھن ہیکہ۔ ٹریفک پولیس ایڈوائزری پہلٕ چیک کٔرو۔",
    content_english:
      "Srinagar–Jammu NH-44 highway is 270 km via Jawahar Tunnel / Banihal Tunnel, taking 8–10 hours. Frequent closures in winter for snow clearance and landslides. Check @KashmirPolice on X or dial 0194-2450022 before travel. Chenani-Nashri tunnel bypasses old road.",
    category: "general",
    source: "jkpolice.gov.in",
  },
  {
    title: "Srinagar Ladakh road",
    content_kashmiri:
      "سرینگر-لیہ روڈ: زوجی لَٕ پاس ذریعہ ۴۳۴ کلومیٹر۔ صرف مئی-اکتوبر کھلا آسان چھُ۔ SUV یا شیئرڈ ٹیکسی کارگل ذریعہ گژھِن۔",
    content_english:
      "Srinagar–Leh via Zoji La Pass and Kargil is 434 km, taking 2 days (overnight in Kargil or Drass). Road open only May–October. Take shared Innova/Sumo from Srinagar TRC (₹1500 to Kargil), or bike / self-drive. Inner Line Permit not needed for Indian citizens.",
    category: "general",
    source: "jksrtc.co.in",
  },
  {
    title: "Houseboat Dal Lake",
    content_kashmiri:
      "ڈل جھیل ہاؤس بوٹ: ڈی لکس، A/B/C کیٹگری۔ MakeMyTrip یا Booking.com پیٹھ بک کٔرو۔ شکارَٕ سیر تہٕ فلوٹنگ سبزی مارکیٹ چھِ مشہور۔",
    content_english:
      "Kashmiri houseboats on Dal and Nigeen Lake are categorised Deluxe / A / B / C by J&K Tourism (rates from ₹2500–₹15000 per night with food). Book via booking.com or KHOA. Don't miss the sunrise shikara to floating vegetable market and Nishat/Shalimar gardens.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Kheer Bhawani temple",
    content_kashmiri:
      "کھیر بھوانی مندر (تُلمُل، گاندربل): کشمیری پنڈتَن ہُنٛد مقدس مقام۔ جیشٹھ اشٹمی میلَٕ منٛز ہزارَن یاتری وسان چھِ۔",
    content_english:
      "Kheer Bhawani Mata Temple at Tulmul, Ganderbal is the holiest shrine for Kashmiri Pandits. The Jyeshtha Ashtami mela (May–June) draws thousands. Located 25 km from Srinagar; reach by taxi or JKSRTC bus. Sacred spring water changes colour with events.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Hazratbal shrine",
    content_kashmiri:
      "حضرت بل درگاہ: ڈل جھیلُک کنارٕ پیٹھ، رسول اکرم صلی اللہ علیہ وسلمُک موٚے مقدس چھُ اتہٕ۔ جمعرات تہٕ خاص دِنَن نمائش گژھان چھِ۔",
    content_english:
      "Hazratbal Dargah on the shores of Dal Lake houses the Moi-e-Muqaddas (holy relic of Prophet Muhammad ﷺ). Special displays on Mi'raj-un-Nabi, Eid Milad, and other Islamic occasions. Open daily. Please dress modestly and cover head.",
    category: "general",
    source: "auqaf.jk.gov.in",
  },
  {
    title: "Shankaracharya temple",
    content_kashmiri:
      "شنکراچاریہ مندر: سرینگر شہرَس منٛز پہاڑ پیٹھ واقع۔ سرینگر شہر تہٕ ڈل جھیلُک بہترین نظارہ اتہٕ چھُ۔",
    content_english:
      "Shankaracharya (Jyeshteshwara) Temple sits on Gopadari Hill overlooking Srinagar, dedicated to Shiva. Drive up or climb 250 steps. Great sunset views of Dal Lake and city. Open 8am–5pm. Cameras deposit at gate for security.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Charar-e-Sharief shrine",
    content_kashmiri:
      "چرار شریف: شیخ نور الدین نورانی (نُنٛد ریشی) ہُنٛد درگاہ۔ بڈگامَس منٛز واقع، سرینگر پیٹھٕ ۲۸ کلومیٹر۔",
    content_english:
      "Charar-i-Sharief in Budgam (28 km from Srinagar) is the shrine of Sheikh Noor-ud-din Wali (Nund Rishi), patron saint of Kashmir. Beautifully rebuilt after the 1995 fire. Open daily. Combine with Yusmarg visit.",
    category: "general",
    source: "auqaf.jk.gov.in",
  },
  {
    title: "Pampore saffron fields",
    content_kashmiri:
      "پام پور زعفران کھیت: اکتوبر-نومبر منٛز بنفشی زعفران پھول کھلن چھِ۔ سرینگر پیٹھٕ ۱۵ کلومیٹر دور چھُ۔",
    content_english:
      "Pampore (15 km from Srinagar on NH-44) is the saffron capital of India. Purple crocus fields bloom late October–early November — best time to visit. Buy authentic Kashmiri saffron from KVIC or GI-tagged stores; beware of adulterated versions in tourist markets.",
    category: "general",
    source: "jktdc.co.in",
  },

  // ---------- Extended Daily Life / Culture ----------
  {
    title: "Ramzan in Kashmir",
    content_kashmiri:
      "رمضان کشمیرَس منٛز: سحری تہٕ افطارُک وقت اردو نیوز پیپر یا مسجد اعلان پیٹھ چیک کٔرو۔ حرمل، مورمور، کاواب چھِ خاص افطاری کھانا۔",
    content_english:
      "Ramzan in Kashmir: check daily Sehri and Iftar times in Greater Kashmir, Kashmir Reader or your local mosque. Traditional iftar includes harissa, khormani, dates, kahwa, phirni and fruit chaat. Special taraweeh and shab-e-qadr prayers at Jama Masjid and Hazratbal.",
    category: "general",
    source: "auqaf.jk.gov.in",
  },
  {
    title: "Eid celebrations",
    content_kashmiri:
      "عید: عید الفطر تہٕ عید الاضحیٰ خوشی سیٹھ منٲو۔ نَو کپڑَٕ، وازوان، تہٕ عیدی چھِ روایت۔ عیدگاہ سرینگر تہٕ حضرت بل منٛز خاص نماز چھِ۔",
    content_english:
      "Eid in Kashmir: Eid-ul-Fitr and Eid-ul-Adha with new clothes, wazwan feasts, kahwa and eidi to children. Main Eid prayers at Idgah Srinagar, Hazratbal, and Jamia Masjid Nowhatta. Meat prices controlled by J&K government during Eid — check DoT rate list.",
    category: "general",
    source: "auqaf.jk.gov.in",
  },
  {
    title: "Nowruz Persian new year",
    content_kashmiri:
      "نوروز: ۲۱ مارچ تام کشمیرَس منٛز شیعہ برادری منٲن چھِ۔ نَو سالُک شروع تہٕ بہارُک استقبال چھُ۔",
    content_english:
      "Nowruz (21 March) is celebrated by the Shia community in Kashmir, marking spring equinox and Persian New Year. Special prayers at Imambaras in Zadibal, Budgam and Hassanabad. Families gather with haft-seen table, sweets and fruits.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Kashmiri pheran clothing",
    content_kashmiri:
      "پھیرَن: کشمیرُک روایتی گرم لباس۔ ونٹرَس منٛز اُو تہٕ کاشمیرِ اون سیٹھ بنن چھِ۔ اندر کانگَری استعمال گژھِ۔",
    content_english:
      "Pheran is the traditional loose Kashmiri robe worn in winter, made of wool, tweed or cashmere. Under it people use a kangri (portable clay firepot in wicker basket) for warmth. Modern pheran styles are popular fashion — available at Lal Chowk and Polo View.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Kangri safety",
    content_kashmiri:
      "کانگَری استعمال: کبھی کبار برنِنَس ہُنٛد خطرہ چھُ، خصوصاً بچَن تہٕ بوڈھَن خاطرٕ۔ سونَن سیٹھ کانگَری دور رٲو تہٕ کھلا کمرَٕ منٛز استعمال کٔرو۔",
    content_english:
      "Kangri safety: hold the kangri away from skin, never sleep with a lit kangri (risk of burns and 'kangri cancer'), and never use in a fully closed room (carbon monoxide risk). Keep children and elderly supervised. Empty ashes only in a metal bucket.",
    category: "general",
    source: "nhp.gov.in",
  },
  {
    title: "Kahwa traditional tea",
    content_kashmiri:
      "قہوہ: کشمیری روایتی چائے۔ سبز چائے، دار چینی، الائچی، زعفران تہٕ بادام سیٹھ بنِس۔ سردی، ہاضمَٕ تہٕ زُکامَس مفید چھُ۔",
    content_english:
      "Kahwa is the classic Kashmiri green tea brewed with cinnamon, cardamom, saffron, cloves and topped with slivered almonds. Great for winter warmth, digestion and cold relief. Served after every meal. Nun chai (pink salt tea) is the everyday tea, drunk with baker's kandur bread.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Kandur bakery breads",
    content_kashmiri:
      "کاندُر: کشمیرُک نان بائی۔ چوچور، لواز، شیرمال، بقرخانی، تہٕ کلچَٕ چھِ مشہور۔ صبح تہٕ شام تازہ ملان چھِ۔",
    content_english:
      "Kandur (traditional Kashmiri baker) makes fresh breads morning and evening: girda (breakfast), tsot / tsochvor (sesame bread), lavasa, sheermal, baqerkhani, kulcha and telvor. Best with nun chai. Every neighbourhood has its kandur.",
    category: "general",
    source: "jktdc.co.in",
  },
  {
    title: "Kashmir carpets shopping",
    content_kashmiri:
      "کشمیری قالین: ہاتہٕ سیٹھ بُنن چھِ، اُو تہٕ ریشم سیٹھ۔ سرکاری کشمیر ایمپوریم یا KHK پیٹھٕ خرٕو، جہاں GI ٹیگ چھِ گارنٹی۔",
    content_english:
      "Kashmir hand-knotted carpets (wool, silk, silk-on-silk) are world-famous. Buy from government J&K Kashmir Emporium (Bund), KHK, or GI-tagged dealers who provide authenticity certificate. Prices vary by knots-per-inch (KPI) — 400+ KPI silk is finest.",
    category: "general",
    source: "kashmirtoday.com",
  },
  {
    title: "Pashmina shawls",
    content_kashmiri:
      "پشمینہ شال: چانگتھنگی بکری اُو سیٹھ بنن چھِ۔ اصل پشمینہ GI ٹیگ سیٹھ آسان چھُ۔ کانی شال چھِ سیٹھاہ قیمتی۔",
    content_english:
      "Original Kashmiri Pashmina shawls are woven from Changthangi goat wool (Ladakh). Look for the GI tag and Sozni or Kani embroidery. Buy from J&K Kashmir Emporium, Craft Development Institute or trusted showrooms — beware of mixed viscose fakes in tourist areas.",
    category: "general",
    source: "kashmirtoday.com",
  },
  {
    title: "Papier mache handicraft",
    content_kashmiri:
      "پیپر ماشے: کشمیرُک روایتی دستکاری۔ بکس، پلیٹ، اورنامنٹ پیپر پیٹھ بنن چھِ تہٕ سونا رنگ سیٹھ سجٲوَن چھِ۔",
    content_english:
      "Papier-mâché is Kashmir's iconic handicraft — decorative boxes, plates, Christmas ornaments, hand-painted in gold and floral designs. Buy from J&K Kashmir Emporium, Zaina Kadal, or Craft Development Institute. Great gifts and souvenirs.",
    category: "general",
    source: "kashmirtoday.com",
  },
  {
    title: "Kashmir SIM card and mobile",
    content_kashmiri:
      "کشمیرَس منٛز موبائل: صرف پوسٹ پیڈ SIM سرکاری پاٹھِ کام کران چھُ۔ Jio، Airtel، BSNL تہٕ VI دستیاب چھِ۔ آدھار سیٹھ نَو SIM ہیکِو گژھت۔",
    content_english:
      "In J&K prepaid SIMs work fully, but tourists should carry ID (Aadhaar/passport + visa) when buying. Jio, Airtel, BSNL and Vi have good coverage in Srinagar, but network gets weak in Gulmarg/Sonamarg/Pahalgam. BSNL has best rural coverage.",
    category: "general",
    source: "trai.gov.in",
  },
  {
    title: "Internet and Wi-Fi",
    content_kashmiri:
      "انٹرنیٹ: JioFiber، Airtel Xstream، BSNL FTTH تہٕ Excitel سرینگر منٛز دستیاب چھِ۔ ونٹرَس منٛز کبھی کبار سست گژھن چھُ۔",
    content_english:
      "Home broadband in Srinagar: JioFiber, Airtel Xstream Fiber, BSNL FTTH and Excitel offer 100 Mbps+ plans from ~₹500/month. Speeds can drop during heavy snow. Most cafes, hotels and JKTDC properties have free Wi-Fi.",
    category: "general",
    source: "trai.gov.in",
  },
  {
    title: "ATM and money",
    content_kashmiri:
      "کشمیرَس منٛز اے ٹی ایم: J&K Bank، SBI، PNB، HDFC تہٕ ICICI ATM ہر شہرَس منٛز چھِ۔ گلمرگ تہٕ سونہ مرگ منٛز کم چھِ، اسلئے پہلٕ نقد ہیو۔",
    content_english:
      "ATMs in Kashmir: J&K Bank, SBI, PNB, HDFC and ICICI are common in Srinagar, Anantnag, Baramulla, Kupwara etc. Fewer ATMs in Gulmarg, Sonamarg, Pahalgam — carry enough cash. UPI (Paytm, PhonePe, Google Pay) works in most shops and hotels.",
    category: "general",
    source: "rbi.org.in",
  },
  {
    title: "Post office services",
    content_kashmiri:
      "ڈاک خانہ: خطوط، پارسل، سُکنیا سمرِدھی، NSC تہٕ RD اسکیم دستیاب چھِ۔ سرینگر GPO لال چوک نزدیک چھُ۔",
    content_english:
      "India Post in Kashmir offers speed post, parcels, money order, and small savings (POSB, RD, NSC, Sukanya Samriddhi, KVP). Srinagar GPO is near Lal Chowk. Track post at indiapost.gov.in. IPPB (India Post Payments Bank) accounts open with just Aadhaar.",
    category: "general",
    source: "indiapost.gov.in",
  },
  {
    title: "Local newspaper Kashmir",
    content_kashmiri:
      "اخبار: Greater Kashmir، Rising Kashmir، Kashmir Reader، Kashmir Observer، تہٕ اردو منٛز Uqab، Chattan، Aftab پرن ہیکِو۔",
    content_english:
      "Local newspapers in Kashmir: English — Greater Kashmir, Rising Kashmir, Kashmir Observer, Kashmir Reader. Urdu — Aftab, Chattan, Uqab, Srinagar Times. Available at kandur / roadside stalls and online. DD Kashir and Radio Kashmir Srinagar are public broadcasters.",
    category: "general",
    source: "greaterkashmir.com",
  },
  {
    title: "Electricity load shedding winter",
    content_kashmiri:
      "ونٹرَس منٛز بجلی کٹنَٕ: KPDCL شیڈول jkpdd.gov.in پیٹھ اعلان کران چھِ۔ اِنورٹر، بخاری یا سولر بیک اپ رٲو۔",
    content_english:
      "Winter power cuts (load shedding) in Kashmir follow published KPDCL schedules — check jkpdd.gov.in or KPDCL Twitter (@kpdclofficial). Prepare with inverter, kerosene bukhari, blankets, and phone power banks. Metered areas usually have fewer cuts.",
    category: "general",
    source: "kpdcl.in",
  },
  {
    title: "Waste garbage SMC",
    content_kashmiri:
      "کچرَٕ: سرینگر میونسپل کارپوریشن (SMC) دوہس دوہس کچرَٕ اُٹھٲن چھِ۔ گِیلہ تہٕ سوکہ کچرَٕ الگ رَٲو۔ کمپلینٹ SMC ہیلپ لائن ۰۱۹۴-۲۴۵۹۹۳۲ پیٹھ کٔرو۔",
    content_english:
      "SMC (Srinagar Municipal Corporation) collects household waste daily. Separate wet (kitchen) and dry (paper, plastic) garbage. For missed collection or open dumping report to SMC helpline 0194-2459932 or Swachhata app. Do not burn plastic — it worsens winter smog.",
    category: "general",
    source: "smcsrinagar.in",
  },
  {
    title: "Property registration J&K",
    content_kashmiri:
      "زمین یا مکان رجسٹریشن: سب رجسٹرار آفس منٛز دستاویز رجسٹر کروٲو۔ اسٹامپ ڈیوٹی ۵-۷ فیصد چھِ۔ خواتینَن خاطرٕ رعایت چھِ۔",
    content_english:
      "Property (land/house) registration in J&K: pay stamp duty (5–7%) and registration fee at the Sub-Registrar's office. Women pay reduced stamp duty. NOC, mutation and jamabandi records needed. Check jkigrs.jk.gov.in for online services.",
    category: "government",
    source: "jkigrs.jk.gov.in",
  },
  {
    title: "GST for small business J&K",
    content_kashmiri:
      "چھوٹے کاروبار GST: سالانہ ٹرن اوور ۴۰ لاکھ کھوتہ زیادَٕ آسِہ تہ GST رجسٹریشن لازمی چھُ۔ gst.gov.in پیٹھ مفت آن لائن رجسٹر کٔرو۔",
    content_english:
      "Small businesses in J&K must register GST if turnover crosses ₹40 lakh (goods) or ₹20 lakh (services). Composition scheme (1% tax) for turnover under ₹1.5 crore. Register free at gst.gov.in with PAN, Aadhaar, business proof and bank details.",
    category: "government",
    source: "gst.gov.in",
  },
  {
    title: "MSME Udyam registration",
    content_kashmiri:
      "چھوٹے کارخانَٕ (MSME) رجسٹریشن: udyamregistration.gov.in پیٹھ مفت اکھ منٹَس منٛز آدھار سیٹھ گژھِ۔ قرض، سبسڈی تہٕ ٹینڈر منٛز فائدہ ملان چھُ۔",
    content_english:
      "MSMEs (small businesses) in J&K should register free at udyamregistration.gov.in using Aadhaar and PAN — done in 5 minutes. Benefits: priority sector loans, subsidised interest, protection from delayed payments, government tender preferences and PMEGP scheme access.",
    category: "government",
    source: "udyamregistration.gov.in",
  },
  {
    title: "PMEGP self-employment loan",
    content_kashmiri:
      "پی ایم ای جی پی: نوجوان کاروبار خاطرٕ ۵۰ لاکھ تام قرض تہٕ ۱۵-۳۵ فیصد سبسڈی۔ KVIC، KVIB یا DIC ذریعہ درخواست دیو۔",
    content_english:
      "PM Employment Generation Programme (PMEGP): loans up to ₹50 lakh (manufacturing) / ₹20 lakh (service) with 15–35% subsidy for new enterprises. Apply online at kviconline.gov.in. In J&K, contact KVIB / DIC (District Industries Centre) or J&K Bank.",
    category: "government",
    source: "kviconline.gov.in",
  },
  {
    title: "Cyber crime complaint",
    content_kashmiri:
      "سائبر کرائم: آن لائن فراڈ، دھوکہ یا ہراسانی آسِہ تہ ۱۹۳۰ پیٹھ فون کٔرو یا cybercrime.gov.in پیٹھ رپورٹ کٔرو۔",
    content_english:
      "For cyber crime (online fraud, phishing, UPI scam, social media harassment): dial 1930 immediately (helps freeze the money) or file at cybercrime.gov.in. In Srinagar, the Cyber Police Station is at Police HQ Batamaloo (0194-2452087).",
    category: "general",
    source: "cybercrime.gov.in",
  },
  {
    title: "Women safety helpline",
    content_kashmiri:
      "خواتینَن خاطرٕ حفاظت: ۱۸۱ ویمن ہیلپ لائن، ۱۰۹۱ پولیس ہیلپ لائن۔ سرینگر منٛز خصوصی ویمن پولیس اسٹیشن رام باغ تہٕ رامبن منٛز چھِ۔",
    content_english:
      "Women's helplines in J&K: 181 (Women Helpline, 24×7), 1091 (Police), 112 (all emergencies). Dedicated Women Police Stations at Rambagh Srinagar and Rambagh Jammu handle harassment, domestic violence and dowry cases. Legal aid free from JKSLSA (15100).",
    category: "general",
    source: "wcd.nic.in",
  },
  {
    title: "Child helpline",
    content_kashmiri:
      "بچَن ہُنٛد ہیلپ لائن: ۱۰۹۸ چائلڈ لائن پیٹھ فون کٔرو۔ چائلڈ لیبر، بچَن پیٹھ ظلم یا لاپتہ آسِہ تہ فوراً اطلاع دیو۔",
    content_english:
      "Childline 1098 (24×7 free) for any child in distress — abuse, missing, labour, trafficking, medical emergency. J&K State Commission for Protection of Child Rights also intervenes. Anganwadi and school teachers are trained to escalate.",
    category: "general",
    source: "childlineindia.org",
  },
  {
    title: "Blood donation Kashmir",
    content_kashmiri:
      "خون عطیہ: SMHS بلڈ بینک، SKIMS، تہٕ لال دید اسپتالَن منٛز عطیہ ہیکَو۔ صحت مند ۱۸-۶۵ ورِیہ عمر ہُنٛد شخص ۳ مہینَس اکھ کرت خون دیہ ہیکہ۔",
    content_english:
      "Donate blood at SMHS, SKIMS, Lal Ded, SDH Sopore and district hospital blood banks. Healthy adults 18–65 can donate every 3 months. Register at eraktkosh.mohfw.gov.in. For urgent blood needs use Kashmir Volunteer Force or eRaktKosh emergency listings.",
    category: "health",
    source: "eraktkosh.mohfw.gov.in",
  },
  {
    title: "Organ donation pledge",
    content_kashmiri:
      "اعضاء عطیہ: NOTTO ذریعہ آن لائن پلج کٔرو (notto.abdm.gov.in)۔ گردَٕ، دل، جگر تہٕ اکھ ہیکَن دان گژھت۔",
    content_english:
      "Pledge organ donation online at notto.abdm.gov.in (NOTTO) — free e-pledge card issued. In J&K, SKIMS has kidney transplant programme. Inform family about your wish; consent from next-of-kin is required after death for organ retrieval.",
    category: "health",
    source: "notto.abdm.gov.in",
  },
  {
    title: "Air quality winter smog",
    content_kashmiri:
      "ہوا معیار: ونٹرَس منٛز سرینگر منٛز کہرَٕ تہٕ دھواں سیٹھ ہوا خراب گژھان چھِ۔ اَمر یا مریض شخص گھر ہوے، N95 ماسک استعمال کٔرو۔",
    content_english:
      "Kashmir winter air quality (AQI) often becomes 'poor' or 'very poor' due to smog, wood/kangri smoke and vehicular pollution. Check aqi.in or CPCB Sameer app for Srinagar. Wear N95 mask outdoors, run air purifier if you have asthma or heart disease.",
    category: "health",
    source: "cpcb.nic.in",
  },
  {
    title: "Kashmir earthquake safety",
    content_kashmiri:
      "زلزلَٕ ہنگام: میز تلہٕ چھپٲو، کھڑکی تہٕ الماری پیٹھٕ دور رٲو۔ زلزلَٕ روزَنَس پتٕہ باہر کھلا میدان منٛز نکل۔",
    content_english:
      "Kashmir is in seismic zone V (highest risk). During an earthquake: drop, cover under sturdy table, hold on; stay away from windows and heavy furniture. After the shaking stops, evacuate to open ground. Keep an emergency kit (water, torch, radio, ID copies) ready.",
    category: "general",
    source: "ndma.gov.in",
  },
  {
    title: "Kashmir flood preparedness",
    content_kashmiri:
      "سیلاب: جہلم دریا اُبل ہیکہ خصوصاً بہارَس منٛز۔ IMD تہٕ Kashmir Traffic Police الرٹ چیک کٔرو تہٕ نچہٕ منزلَٕ منٛز اہم چیز اُچہٕ منزل ہیو۔",
    content_english:
      "Kashmir (especially Srinagar low areas like Rajbagh, Jawahar Nagar, Bemina) faces flood risk when Jhelum crosses danger level. Track alerts on IMD Srinagar and I&FC J&K. Move valuables to upper floor, keep documents in waterproof bag, and know your local relief centre.",
    category: "general",
    source: "ifcjk.jk.gov.in",
  },
  {
    title: "COVID or flu symptoms",
    content_kashmiri:
      "بخار، کھانسی تہٕ سانس تنگ: نزدیک PHC منٛز مفت ٹیسٹ کروٲو۔ گھرَس منٛز آرام کٔرو، گرم پانی پیو، تہٕ ماسک پھیرو۔",
    content_english:
      "For fever, cough, sore throat or breathlessness: get free rapid antigen or RT-PCR test at nearest PHC or district hospital. Rest, drink warm fluids, use paracetamol, and wear mask around family. See doctor immediately if breathing difficulty or SpO2 below 94%.",
    category: "health",
    source: "mohfw.gov.in",
  },
  {
    title: "Kashmir postal PIN codes",
    content_kashmiri:
      "پن کوڈ: سرینگر 190001-190025، اننت ناگ 192101، بارہمولہ 193101، پلوامہ 192301، کپوارہ 193222۔",
    content_english:
      "Main PIN codes in Kashmir: Srinagar 190001–190025, Anantnag 192101, Baramulla 193101, Pulwama 192301, Kupwara 193222, Budgam 191111, Ganderbal 191201, Kulgam 192231, Shopian 192303, Bandipora 193502. Full list at indiapost.gov.in.",
    category: "general",
    source: "indiapost.gov.in",
  },
  {
    title: "Aadhaar card services in Kashmir",
    content_kashmiri:
      "آدھار: نزدیک آدھار سینٹر (پوسٹ آفس یا بینک) منٛز گژھِو۔ نو آدھار چھُ مفت، اپڈیٹ خٲطرٕ ₹50 لگان چھُ۔",
    content_english:
      "New Aadhaar enrolment is free at any Aadhaar Seva Kendra, post office or bank branch in J&K. Demographic update costs about Rs 50, biometric update Rs 100. Carry proof of identity and address. Check status or download e-Aadhaar at uidai.gov.in with your enrolment ID.",
    category: "schemes",
    source: "uidai.gov.in",
  },
  {
    title: "Ayushman Bharat SEHAT card J&K",
    content_kashmiri:
      "سحت اسکیم: ہر جموں و کشمیر خاندانَس پیٹھ سالانہ ₹5 لاکھ مفت علاج۔ کارڈ بناوِو نزدیک CSC یا اسپتال ہیلپ ڈیسک پؠٹھ۔",
    content_english:
      "Ayushman Bharat PM-JAY SEHAT covers every J&K family for Rs 5 lakh of free hospital treatment per year, at all empanelled government and private hospitals. Make the golden card free of cost at any CSC, empanelled hospital help desk, or via beneficiary.nha.gov.in. Ration card or Aadhaar is needed.",
    category: "schemes",
    source: "jkhealth.org",
  },
  {
    title: "Old age pension J&K",
    content_kashmiri:
      "بوڈؠن ہٕنٛدؠ پنشن: 60 ورؠ برونٛہہ عمر تہٕ کم آمدنی والؠن ہٕنٛدؠ خٲطرٕ ماہانہ امداد۔ درخواست کٔرِو سماجی بہبود محکمَس منٛز۔",
    content_english:
      "Integrated Social Security Scheme (ISSS) in J&K gives a monthly pension to citizens aged 60+ , widows, and persons with disability from low-income households. Apply through the Social Welfare Department office of your tehsil or online on jkisss.nic.in with Aadhaar, bank passbook, age proof and income certificate.",
    category: "schemes",
    source: "jkisss.nic.in",
  },
  {
    title: "PM Kisan Samman Nidhi for Kashmiri farmers",
    content_kashmiri:
      "PM کسان: زمیندارَن ہِنٛدؠ خٲطرٕ سالانہ ₹6000، ترٛے قِستَن منٛز سیدھا بینک اکاؤنٹَس منٛز۔",
    content_english:
      "PM-KISAN pays eligible landholding farmer families Rs 6,000 a year in three instalments of Rs 2,000, sent directly to the bank account. Register at pmkisan.gov.in or your Patwari/Agriculture Extension office with land records, Aadhaar and bank details. e-KYC must be completed or the instalment is held.",
    category: "schemes",
    source: "pmkisan.gov.in",
  },
  {
    title: "Kashmir winter Chillai Kalan",
    content_kashmiri:
      "چلہٕ کلان: 21 دسمبر پؠٹھ 30 جنوری تام سٲری خۄر سردی۔ پانی نلکہٕ جمن، بجلی کٹوتی گژھان۔ کانگٕر تہٕ پھیرن استعمال کٔرِو۔",
    content_english:
      "Chillai Kalan is the harshest 40-day winter period in Kashmir, from 21 December to 30 January, followed by Chillai Khurd (20 days) and Chillai Bachha (10 days). Expect sub-zero nights, frozen taps and power cuts. Insulate pipes, keep a kangri and pheran, store drinking water, and keep emergency medicines at home.",
    category: "weather",
    source: "imdsrinagar",
  },
  {
    title: "Srinagar to Jammu highway travel advice",
    content_kashmiri:
      "سرینگر-جموں شاہراہ: برفَس تہٕ لینڈسلائیڈَس ہیتھ بند گژھان۔ سفرٕ برونٛہہ ٹریفک پولیس ایڈوائزری چیک کٔرِو۔",
    content_english:
      "The NH-44 Srinagar–Jammu highway (about 270 km, 8–10 hours) often closes due to snow at Jawahar Tunnel or landslides at Ramban. Always check the daily advisory from J&K Traffic Police before travelling, keep water and warm clothes in the vehicle, and consider the Srinagar–Banihal train or a flight when the road is shut.",
    category: "transport",
    source: "jktraffic",
  },
  {
    title: "Kashmir local bus and Sumo fares",
    content_kashmiri:
      "لوکل سفر: سرینگرَس منٛز مٹاڈور تہٕ بس، ضلعن خٲطرٕ سومو ٹیکسی اسٹینڈ لال چوک تہٕ بٹمالو پؠٹھ۔",
    content_english:
      "Within Srinagar, matador minibuses and JKRTC buses connect Lal Chowk, Batmaloo, Hazratbal and Dalgate for Rs 10–30. Shared Sumo taxis for Anantnag, Baramulla, Kupwara and Pahalgam leave from Batmaloo and Parimpora stands. Srinagar–Baramulla and Srinagar–Banihal trains are the cheapest option at Rs 25–60.",
    category: "transport",
    source: "jkrtc",
  },
  {
    title: "Diabetes care in Kashmir",
    content_kashmiri:
      "شوگر: دوا وقتَس پؠٹھ ہیو، نون تہٕ مِٹھ کم کٔرِو، ڈؠلی وۄلر یا پارکَس منٛز پؠدل چلِو، تہٕ ترٛے ماہَس HbA1c ٹیسٹ کروٲو۔",
    content_english:
      "For type-2 diabetes: take medicines at fixed times, walk 30 minutes daily, cut sugary noon-chai snacks, bakery items and rice portions, and eat more haakh, vegetables and pulses. Get HbA1c every three months and an annual eye and foot check. Free medicines and tests are available at district hospitals and PHCs under NPCDCS.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "High blood pressure advice",
    content_kashmiri:
      "بلڈ پریشر: نمکین چائے تہٕ نون کم کٔرِو، دوا کدنہٕ روزٕ نہٕ چھوڑِو، تہٕ ہفتَس اکہ لٹہ BP چیک کروٲو۔",
    content_english:
      "High blood pressure is very common in Kashmir partly due to salty noon chai and salted snacks. Reduce salt to under 5 g a day, avoid smoking and hookah, walk daily, and never stop BP medicine on your own. Check BP at least weekly at your nearest health centre — it is free. Sudden severe headache, chest pain or one-sided weakness needs emergency care.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "Mental health helpline Kashmir",
    content_kashmiri:
      "دماغی صحت: اگر توہیہ پرؠشان یا اداس چھِو، IMHANS سرینگر پؠٹھ مفت مشورٕ ملان چھُ۔ ٹیلی مانس ہیلپ لائن: 14416۔",
    content_english:
      "Free confidential mental-health support: national Tele-MANAS helpline 14416 (24x7, available in Urdu/Hindi/English) and IMHANS-Kashmir, Rainawari Srinagar, which runs free OPD counselling and de-addiction services. Talking to a counsellor is normal and private — depression, anxiety and sleep problems are treatable.",
    category: "health",
    source: "telemanas.mohfw.gov.in",
  },
  {
    title: "Kashmiri wazwan dishes",
    content_kashmiri:
      "وازوان: روگن جوش، رِستہٕ، گوشتابہٕ، تباخ ماز، آب گوشت — کٲشُر شادی ہٕنٛدؠ 36 ہٲضری۔",
    content_english:
      "Wazwan is the traditional multi-course Kashmiri feast served at weddings, with up to 36 dishes prepared by a Waza. Signature items include rogan josh, rista, gushtaba, tabak maaz, aab gosht, marchwangan korma and daniwal korma, eaten from a shared trami with four guests. Vegetarian wazwan uses nadru, dum aloo and haakh.",
    category: "culture",
    source: "local",
  },
  {
    title: "Kashmiri noon chai and kahwa",
    content_kashmiri:
      "نون چٲے: گلابی چٲے نمکَن ہیتھ، تہٕ قہوٕ زعفران، دٲرچین تہٕ باداماو ہیتھ۔",
    content_english:
      "Noon chai (pink salt tea) is brewed with green tea leaves, soda and salt, and served with tsot or bakarkhani at breakfast. Kahwa is the sweet green tea with saffron, cinnamon, cardamom and crushed almonds, served after meals and to guests. Both are central to Kashmiri hospitality.",
    category: "culture",
    source: "local",
  },
  {
    title: "Kashmiri handicrafts and pashmina",
    content_kashmiri:
      "دستکاری: پشمینہ شال، قالین، پیپر ماشی، اخروٹ کاٹھ تہٕ سوزنی کڑھٲے چھِ کشیرِ ہٕنٛدؠ مشہور ہنر۔",
    content_english:
      "Kashmir's famous crafts are hand-spun Pashmina and Kani shawls, hand-knotted silk carpets, papier-mâché, walnut wood carving, crewel and sozni embroidery, and willow wicker from Ganderbal. Genuine Pashmina carries a GI mark from the Craft Development Institute — always ask for the GI label and a receipt.",
    category: "culture",
    source: "cdisrinagar",
  },
  {
    title: "Best time to visit Kashmir",
    content_kashmiri:
      "سفرٕ وقت: اپریل-جون بہار تہٕ پھول، جولٲی-اگست ٹھنڈ گرمی، ستمبر-اکتوبر چنار زرد، دسمبر-فروری برٕف۔",
    content_english:
      "Best seasons: April–June for tulips, almond blossom and pleasant days; July–August for cool escape and Amarnath yatra; September–October for golden chinar and saffron bloom in Pampore; December–February for snow and skiing at Gulmarg. Book Gulmarg gondola tickets online in peak season.",
    category: "tourism",
    source: "jktourism.gov.in",
  },
  {
    title: "Gulmarg gondola and skiing",
    content_kashmiri:
      "گلمرگ: گونڈولا ہٕنٛدؠ زٕ فیز — کھلن مرگ تہٕ افروات۔ آن لائن ٹکٹ بک کٔرِو تہٕ گرم کپڑٕ ہیتھ گژھِو۔",
    content_english:
      "Gulmarg, 50 km from Srinagar, has one of the world's highest cable cars: Phase 1 to Kongdoori and Phase 2 to Apharwat peak (about 3,979 m). Book gondola tickets online at jktdc/ gulmarggondola portal, arrive early, and hire proper snow boots and jackets locally. Ski courses run at the Indian Institute of Skiing.",
    category: "tourism",
    source: "jktourism.gov.in",
  },
  {
    title: "Dal Lake shikara and houseboats",
    content_kashmiri:
      "ڈل جھیل: شکارٕ سواری، ہاؤس بوٹ، تہٕ صبح ہٕنٛد تیرتھ بازار۔ سرکٲری ریٹ کارڈ پرٛژھِو۔",
    content_english:
      "Dal Lake offers shikara rides (government rate card is displayed at ghats — around Rs 750–900 per hour), houseboat stays in Nigeen and Dal, and the early-morning floating vegetable market near Kabutar Khana. Nearby are the Mughal gardens Nishat, Shalimar and Chashme Shahi, and Hazratbal shrine.",
    category: "tourism",
    source: "jktourism.gov.in",
  },
  {
    title: "Saffron farming in Pampore",
    content_kashmiri:
      "زعفران: پامپور تہٕ پلوامَس منٛز اکتوبر-نومبر منٛز گُل نیران۔ GI ٹیگ ہیتھ کٲشُر زعفران خرٲدِو۔",
    content_english:
      "Kashmiri saffron from Pampore, Pulwama and Budgam has a GI tag and is among the world's costliest spices. Flowering happens late October to mid-November. Buy from the National Saffron Mission's Saffron Park trading centre or registered growers, and avoid roadside sellers offering unusually cheap saffron.",
    category: "agriculture",
    source: "nsm.jk.gov.in",
  },
  {
    title: "Apple orchard care in Kashmir",
    content_kashmiri:
      "ژُنٹھ باغ: مارچَس منٛز اسپرے، جولٲی منٛز کیلشیم، تہٕ ستمبر-اکتوبر منٛز ژٕٹن۔ اسکیب پؠٹھ محکمہ باغبٲنی ہٕنٛد شیڈول ہیو۔",
    content_english:
      "For apple orchards, follow the Horticulture Department's annual spray schedule: dormant oil in March, scab control at pink-bud and petal-fall, calcium sprays in July for better shelf life, and harvest from September to October depending on variety. High-density plantation subsidies are available through the Holistic Agriculture Development Programme.",
    category: "agriculture",
    source: "hortikashmir.gov.in",
  },
  {
    title: "Selling produce at Parimpora mandi",
    content_kashmiri:
      "منڈی: پریم پورٕ فروٹ منڈی چھُ سب سٕہ بۆڈ۔ ریٹ فون یا منڈی بورڈ پؠٹھ پرؠژھِو تہٕ کمیشن ایجنٹ ہٕنٛد رسید ہیو۔",
    content_english:
      "Parimpora Fruit Mandi in Srinagar is Asia's large fruit market and the main auction point for Kashmiri apples, pears and cherries. Check daily rates before dispatch, insist on a written receipt from the commission agent, and keep grading and packing standards high — A-grade boxes fetch far better prices.",
    category: "agriculture",
    source: "local",
  },
  {
    title: "Emergency numbers in Kashmir",
    content_kashmiri:
      "ایمرجنسی: پولیس 112، ایمبولینس 108، فٲر بریگیڈ 101، ویمن ہیلپ لائن 181، چائلڈ لائن 1098۔",
    content_english:
      "Key emergency numbers: 112 all-in-one emergency, 108 ambulance, 101 fire and emergency services, 181 women's helpline, 1098 childline, 1091 women's police, 14416 Tele-MANAS mental health, and 1073 highway/traffic help. Save these in your phone and teach them to elderly family members.",
    category: "general",
    source: "jkpolice.gov.in",
  },
  {
    title: "Earthquake safety in Kashmir",
    content_kashmiri:
      "زلزلہ: کشیر چھِ زون V منٛز۔ ہلن ہیتھ میز تلہ گژھِو، سر بچٲوِو، تہٕ ہلن بند گژھنہٕ پتہٕ کھلہٕ جایہ نیرِو۔",
    content_english:
      "Kashmir lies in seismic zone V, the highest risk category. During shaking: drop, cover under a sturdy table, and hold on; stay away from windows and old brick walls. Do not use lifts. Afterwards, move to open ground, check gas connections, and keep an emergency bag with documents, water, torch and medicines ready.",
    category: "general",
    source: "ndma.gov.in",
  },
  {
    title: "Snow and avalanche safety",
    content_kashmiri:
      "برٕف: بھاری برفباری منٛز چھت پؠٹھ برٕف ہٹٲوِو، ہیٹر ہیتھ ہوا آنٛدُر رٲوِو، تہٕ ایوالانچ وارننگ زونن منٛز مہ گژھِو।",
    content_english:
      "During heavy snowfall clear roof snow to prevent collapse, never sleep with a coal bukhari or gas heater in a sealed room (carbon monoxide risk), and keep torches and power banks charged. Avoid Sonamarg, Gurez and Zojila routes when the J&K Disaster Management Authority issues avalanche warnings.",
    category: "general",
    source: "jkdma",
  },
  {
    title: "Electricity complaints in Kashmir (KPDCL)",
    content_kashmiri:
      "بجلی: شکایت خٲطرٕ KPDCL ہیلپ لائن یا نزدیک رسیور سٹیشنَس منٛز رابطہ کٔرِو۔ بل آن لائن jkpdd پورٹلَس پؠٹھ ادا کٔرِو۔",
    content_english:
      "For power cuts, damaged transformers or metering issues contact the Kashmir Power Distribution Corporation (KPDCL) division office or its complaint helpline; note your consumer ID from the bill. Bills can be paid online through the JKPDD/Bharat BillPay portal, at CSCs, or at the divisional cash counter.",
    category: "general",
    source: "jkpdcl.nic.in",
  },
  {
    title: "Drinking water supply (Jal Shakti)",
    content_kashmiri:
      "پانی: پانی ہٕنٛد مسئلہ خٲطرٕ جل شکتی محکمَس منٛز شکایت کٔرِو۔ گندٕ پانی اُبٲلِو یا کلورین گولی ہیو۔",
    content_english:
      "For water supply failures or contamination, complain to the Jal Shakti (PHE) sub-division office in your area, or through the Jal Jeevan Mission grievance line. During floods or pipe damage, boil water for at least one minute or use chlorine tablets from the PHC before drinking.",
    category: "general",
    source: "jaljeevanmission.gov.in",
  },
  {
    title: "Ration card and PDS in J&K",
    content_kashmiri:
      "راشن کارڈ: نۄو کارڈ یا نام شٲملٕ کرنہٕ خٲطرٕ نزدیک FCS&CA آفسَس یا آن لائن درخواست دِیُت۔",
    content_english:
      "Apply for a new ration card, add family members or transfer it through the Food, Civil Supplies and Consumer Affairs (FCS&CA) office of your tehsil or the jkfcsca.gov.in portal, with Aadhaar, address proof and family photo. AAY and PHH households get subsidised rice, atta and sugar from the fair price shop each month.",
    category: "schemes",
    source: "jkfcsca.gov.in",
  },
  {
    title: "Domicile certificate J&K",
    content_kashmiri:
      "ڈومیسائل: ای-سروسز پورٹلَس پؠٹھ آن لائن درخواست دِیُت، 15 دۄہن منٛز سرٹیفکیٹ ملان چھُ۔",
    content_english:
      "A J&K domicile certificate is required for jobs and admissions. Apply online at the J&K e-Services portal (serviceonline.gov.in/jammu) or at your tehsildar's office with proof of residence, Aadhaar, ration card and school certificate. It is issued within 15 days; delays can be escalated to the Deputy Commissioner.",
    category: "schemes",
    source: "serviceonline.gov.in",
  },
  {
    title: "Birth and death certificate registration",
    content_kashmiri:
      "پٲدٲیش تہٕ مرنہٕ سرٹیفکیٹ: 21 دۄہن اندر مقٲمی میونسپل یا پنچایت آفسَس منٛز رجسٹر کٔرِو۔",
    content_english:
      "Register a birth or death within 21 days at the Srinagar Municipal Corporation, municipal committee or panchayat/ village registrar where the event happened; hospital records help. Late registration needs an affidavit and magistrate order. Digital copies can be downloaded from the J&K e-services portal.",
    category: "general",
    source: "crsorgi.gov.in",
  },
  {
    title: "Government jobs and JKSSB exams",
    content_kashmiri:
      "نوکری: JKSSB تہٕ JKPSC ہٕنٛدؠ اشتہار ویب سائٹ پؠٹھ چھِ نیران۔ ڈومیسائل تہٕ زمرہ سرٹیفکیٹ تیار تھٲوِو।",
    content_english:
      "Government recruitment in J&K is mainly through JKSSB (class IV to sub-inspector, junior assistant, teacher posts) and JKPSC (KAS, medical, lecturer). Watch jkssb.nic.in and jkpsc.nic.in for notifications, keep domicile, category and educational certificates ready, and never pay any agent promising a job.",
    category: "general",
    source: "jkssb.nic.in",
  },
  {
    title: "Student scholarships in J&K",
    content_kashmiri:
      "وظیفہ: پری میٹرک تہٕ پوسٹ میٹرک اسکالرشپ خٲطرٕ NSP پورٹلَس پؠٹھ درخواست دِیُت۔",
    content_english:
      "Students can apply for pre-matric and post-matric scholarships on the National Scholarship Portal (scholarships.gov.in), usually between August and November. J&K also runs the PM Special Scholarship Scheme (PMSSS) for students studying outside the UT, with tuition and maintenance support through AICTE.",
    category: "schemes",
    source: "scholarships.gov.in",
  },
  {
    title: "Internet and mobile services in Kashmir",
    content_kashmiri:
      "انٹرنیٹ: BSNL، Jio، Airtel تہٕ VI چھِ کام کران۔ دیہاتَس منٛز BSNL بہتر چھُ، تہٕ اسکولن خٲطرٕ آفلائن مواد رٲکھِو।",
    content_english:
      "Jio, Airtel, VI and BSNL all operate in Kashmir with 4G/5G in Srinagar and district towns; BSNL often has better reach in remote areas like Gurez, Karnah and Machil. Keep important documents downloaded offline, since connectivity can drop during heavy snow or maintenance.",
    category: "general",
    source: "local",
  },
  {
    title: "Banking and Jammu Kashmir Bank services",
    content_kashmiri:
      "بینک: J&K بینک ہٕنٛدؠ شاخہ ہر ضلعَس منٛز چھِ۔ زیرو بیلنس جن دھن اکاؤنٹ کھۆلِو تہٕ پاس بک اپڈیٹ رٲکھِو۔",
    content_english:
      "J&K Bank is the largest bank in the UT, with branches and ATMs in every district, plus SBI, PNB and cooperative banks. Open a zero-balance PM Jan Dhan account with Aadhaar for pension and subsidy transfers (DBT). Never share OTP, ATM PIN or card details with callers claiming to be bank staff.",
    category: "general",
    source: "jkbank.com",
  },
  {
    title: "Online fraud and cyber safety",
    content_kashmiri:
      "دھوکہ: OTP کٲنسہ ہٕندؠ ساتھ شیئر مہ کٔرِو۔ فراڈ گژھنہٕ پتہٕ فوراً 1930 پؠٹھ کال کٔرِو।",
    content_english:
      "Never share OTP, UPI PIN, or bank details, and do not install screen-sharing apps like AnyDesk on a caller's request. If money is lost to online fraud, call the cybercrime helpline 1930 within the first hour and file a report at cybercrime.gov.in — early reporting improves the chance of recovery.",
    category: "general",
    source: "cybercrime.gov.in",
  },
  {
    title: "Kashmiri language basics",
    content_kashmiri:
      "کٲشُر: سلام (سلام), شُکریہ (شکریہ), کٕتھ چھُکھ؟ (کیسے ہو؟), وارٕے چھُس (میں ٹھیک ہوں), نمسکار۔",
    content_english:
      "Useful Kashmiri phrases: 'Assalamu alaikum' greeting; 'Kyah haal chhu?' — how are you; 'Bah chhus wariyah' — I am fine; 'Shukriya' — thank you; 'Kot chhukh gasaan?' — where are you going; 'Chhu na?' — isn't it? Kashmiri is written in Perso-Arabic Nastaliq script and is one of the official languages of J&K.",
    category: "culture",
    source: "local",
  },
  {
    title: "Traditional Kashmiri clothing",
    content_kashmiri:
      "پوشاک: پھیرن، کانگٕر، تہٕ عورتَن ہٕنٛد کسابہٕ تہٕ تَرَنگہٕ چھِ کٲشُر روایتی لباس۔",
    content_english:
      "The pheran, a long loose woollen gown, is worn in winter with a kangri (portable firepot) underneath. Traditional women's dress includes the pheran with tilla embroidery, a taranga headdress in Kashmiri Pandit tradition, and the kasaba headwear in Muslim tradition. Modern pherans in tweed and raffal are popular year-round.",
    category: "culture",
    source: "local",
  },
  {
    title: "Kashmir school and exam calendar",
    content_kashmiri:
      "اسکول: کشمیر ڈویژنَس منٛز سرمائی تعطیل دسمبر-فروری چھِ، تہٕ امتحان اکتوبر-نومبر منٛز گژھان چھِ۔",
    content_english:
      "Schools in the Kashmir division follow a winter-zone calendar: long winter vacation from late December to end of February, with annual exams generally held in October–November and the new session starting in March. Board exams are conducted by JKBOSE; datesheets and results are published at jkbose.nic.in.",
    category: "general",
    source: "jkbose.nic.in",
  },
  {
    title: "Nadru and local Kashmiri vegetables",
    content_kashmiri:
      "سبزی: نَدرُو، ہاکھ، مُنجہٕ ہاکھ، وۄپل ہاکھ تہٕ گوگجہ چھِ مقٲمی سبزی۔",
    content_english:
      "Local Kashmiri vegetables include nadru (lotus stem from Dal and Wular), haakh (collard greens, eaten almost daily), monj haakh, wopal haakh, gogji (turnip) and roadside sun-dried vegetables called hokh syun used in winter. They are cheap, seasonal and nutritious — haakh is rich in iron and calcium.",
    category: "culture",
    source: "local",
  },
  {
    title: "Winter heating safety (bukhari and kangri)",
    content_kashmiri:
      "بُخٲری: کمرٕ بند مہ تھٲوِو، ہوا نیرنہٕ ہٕنٛد راستہٕ رٲکھِو۔ کانگٕر ہیتھ سیٹھاہ نزدیک مہ ژھپِو، جلن ہٕنٛد خطرہ چھُ۔",
    content_english:
      "Wood or LPG bukharis must have a proper chimney and a slightly open window — carbon monoxide from a sealed room kills every winter in Kashmir. Keep a kangri away from bedding and children, never sleep with it inside a pheran, and keep a bucket of sand or water nearby. Get chimneys cleaned before winter.",
    category: "general",
    source: "jkfireservice",
  },
  {
    title: "Pregnancy and maternal care",
    content_kashmiri:
      "حاملہ: ہر ماہ چیک اپ کروٲو، آئرن تہٕ فولک ایسڈ گولی ہیو، تہٕ اسپتالَس منٛز زچگی کٔرِو۔ JSY ہیتھ مالی امداد ملان چھُ۔",
    content_english:
      "Pregnant women should register at the nearest PHC in the first trimester, get at least four antenatal check-ups, take iron-folic acid and calcium tablets, and get TT/Td vaccination. Institutional delivery is free at government hospitals, and Janani Suraksha Yojana gives cash assistance. Danger signs: bleeding, severe headache, swelling, reduced baby movement — go to hospital immediately.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "Child vaccination schedule",
    content_kashmiri:
      "بچَن ہٕنٛد ٹیکہٕ: BCG، پولیو، پینٹا، خسرہ — سٲری ٹیکہٕ سرکٲری مرکزَس منٛز مفت چھِ۔ ٹیکہٕ کارڈ سنبھال تھٲوِو۔",
    content_english:
      "All childhood vaccines under the Universal Immunisation Programme are free at government health centres and Anganwadi sessions: BCG and OPV-0 at birth, pentavalent/OPV/rotavirus at 6, 10 and 14 weeks, measles-rubella at 9 months and 16–24 months, plus DPT boosters. Keep the immunisation card safe and follow the due dates.",
    category: "health",
    source: "nhm.gov.in",
  },
  {
    title: "Kashmir air quality and winter smog",
    content_kashmiri:
      "ہوا: سردین منٛز سرینگرَس منٛز دھواں تہٕ دھول زیادٕ گژھان چھِ۔ دمہٕ ہٕنٛدؠ مریض ماسک پھیرِن تہٕ اِنہیلر ہیتھ رٔٹن۔",
    content_english:
      "Air quality in Srinagar worsens in winter due to temperature inversion, wood and coal burning and vehicle emissions. People with asthma or COPD should keep inhalers refilled, avoid early-morning outdoor exertion on smoggy days, use a mask, and avoid burning tyres or plastics for heat.",
    category: "health",
    source: "cpcb.nic.in",
  },
  {
    title: "Solid waste and cleanliness in Srinagar",
    content_kashmiri:
      "صفٲی: کچرٕ گٲڑی ہیتھ دِیُت، ڈل جھیلَس منٛز کچرٕ مہ ژُنِو۔ SMC ہیلپ لائن پؠٹھ شکایت کٔرِو۔",
    content_english:
      "Srinagar Municipal Corporation collects household waste door-to-door; segregate wet and dry waste and hand it to the collection vehicle rather than dumping into drains or the Dal and Jhelum. Report uncollected garbage or blocked drains through the SMC complaint number or the Swachhata app.",
    category: "general",
    source: "smcsrinagar",
  },
];
