module.exports.codepageByLcid = {
  0x00000000: 0, //NULL
  0x00000401: 'CP1256', //Arabic
  0x0000048c: 'CP1256', //Dari
  0x00000404: 'CP950', //Chinese_Taiwan_Stroke
  0x00000405: 'CP1250', //Czech
  0x00000406: 'CP1252', //Danish_Norwegian
  0x00000485: 'CP1251', //Yakut
  0x00000408: 'CP1253', //Greek
  0x00000409: 'CP1252', //Latin1_General
  0x0000040a: 'CP1252', //Traditional_Spanish
  0x0000040b: 'CP1252', //Finnish_Swedish
  0x0000040c: 'CP1252', //French
  0x0000040d: 'CP1255', //Hebrew
  0x0000040e: 'CP1250', //Hungarian
  0x0000040f: 'CP1252', //Icelandic
  0x00000483: 'CP1252', //Corsican
  0x00000411: 'CP932', //Japanese
  0x00000412: 'CP949', //Korean_Wansung
  0x00000481: 'UNICODE',	//Maori // 0 as Unicode
  0x00000415: 'CP1250', //Polish
  0x00000418: 'CP1250', //Romanian
  0x00000419: 'CP1251', //Cyrillic_General
  0x0000041a: 'CP1250', //Croatian
  0x0000041b: 'CP1250', //Slovak
  0x0000041c: 'CP1250', //Albanian
  0x0000041e: 'CP874', //Thai
  0x0000041f: 'CP1254', //Turkish
  0x00000422: 'CP1251', //Ukrainian
  0x00000424: 'CP1250', //Slovenian
  0x00000425: 'CP1257', //Estonian
  0x00000426: 'CP1257', //Latvian
  0x00000427: 'CP1257', //Lithuanian
  0x0000042a: 'CP1258', //Vietnamese
  0x0000042f: 'CP1251', //Macedonian
  0x00000439: 0,	//Hindi
  0x00000800: 'CP_ACP', // NULL - LOCALE_SYSTEM_DEFAULT; used at startup ???
  0x00000804: 'CP936', //Chinese_PRC
  0x00000480: 'CP1256', //Uighur
  0x0000047e: 'CP1252', //Breton
  0x00000827: 'CP1257', //Lithuanian_Classic
  0x00000c0a: 'CP1252', //Modern_Spanish
  0x00010407: 'CP1252', //German_PhoneBook
  0x0001040e: 'CP1250', //Hungarian_Technical
  0x00010411: 'CP932', //Japanese_Unicode
  0x00010412: 'CP949', //Korean_Wansung_Unicode
  0x00010437: 'CP1252', //Georgian_Modern_Sort
  0x00020804: 'CP936', //Chinese_PRC_Stroke
  0x00030404: 'CP950', //Chinese_Taiwan_Bopomofo
  0x0000042c: 'CP1254', //Azeri_Latin
  0x0000043f: 'CP1251', //Kazakh
  0x00000443: 'CP1254', //Uzbek_Latin
  0x00000444: 'CP1251', //Tatar
  0x0000045a: 0, //Syriac
  0x00000465: 0, //Divehi
  0x0000082c: 'CP1251', //Azeri_Cyrillic
  0x00000c04: 'CP950', //Chinese_Hong_Kong_Stroke
  0x0000047c: 'CP1252', //Mohawk
  0x00001404: 'CP950', //Chinese_Traditional_Pinyin
  0x00021404: 'CP950', //Chinese_Traditional_Stroke_Order
  0x00040411: 'CP932', //Japanese_Bushu_Kakusu
  0x00000414: 'CP1252', //Norwegian
  0x00000417: 'CP1252', //Romansh
  0x0000081a: 'CP1250', //Serbian_Latin
  0x00000c1a: 'CP1251', //Serbian_Cyrillic
  0x0000141a: 'CP1250', //Bosnian_Latin
  0x0000201a: 'CP1251', //Bosnian_Cyrillic
  0x00000420: 'CP1256', //Urdu
  0x00000429: 'CP1256', //Persian
  0x0000047a: 'CP1252', //Mapudungan
  0x0000042e: 'CP1252', //Upper_Sorbian
  0x0000046d: 'CP1251', //Bashkir
  0x0000043a: 0, //Maltese
  0x0000043b: 'CP1252', //Sami_Norway
  0x0000083b: 'CP1252', //Sami_Sweden_Finland
  0x00000442: 'CP1250', //Turkmen
  0x00000445: 0, //Bengali
  0x0000044d: 0, //Assamese
  0x00000463: 0, //Pashto
  0x00000451: 0, //Tibetan
  0x00000452: 'CP1252', //Welsh
  0x00000453: 0, //Khmer
  0x00000454: 0, //Lao
  0x00000462: 'CP1252', //Frisian
  0x0000085f: 'CP1252', //Tamazight
  0x00000461: 0, //Nepali
};

module.exports.codepageBySortId = {
  30: 'CP437', // SQL_Latin1_General_CP437_BIN
  31: 'CP437', // SQL_Latin1_General_CP437_CS_AS
  32: 'CP437', // SQL_Latin1_General_CP437_CI_AS
  33: 'CP437', // SQL_Latin1_General_Pref_CP437_CI_AS
  34: 'CP437', // SQL_Latin1_General_CP437_CI_AI
  40: 'CP850', // SQL_Latin1_General_CP850_BIN
  41: 'CP850', // SQL_Latin1_General_CP850_CS_AS
  42: 'CP850', // SQL_Latin1_General_CP850_CI_AS
  43: 'CP850', // SQL_Latin1_General_Pref_CP850_CI_AS
  44: 'CP850', // SQL_Latin1_General_CP850_CI_AI
  49: 'CP850', // SQL_1xCompat_CP850_CI_AS
  51: 'CP1252', // SQL_Latin1_General_Cp1_CS_AS_KI_WI
  52: 'CP1252', // SQL_Latin1_General_Cp1_CI_AS_KI_WI
  53: 'CP1252', // SQL_Latin1_General_Pref_Cp1_CI_AS_KI_WI
  54: 'CP1252', // SQL_Latin1_General_Cp1_CI_AI_KI_WI
  55: 'CP850', // SQL_AltDiction_CP850_CS_AS
  56: 'CP850', // SQL_AltDiction_Pref_CP850_CI_AS
  57: 'CP850', // SQL_AltDiction_CP850_CI_AI
  58: 'CP850', // SQL_Scandinavian_Pref_CP850_CI_AS
  59: 'CP850', // SQL_Scandinavian_CP850_CS_AS
  60: 'CP850', // SQL_Scandinavian_CP850_CI_AS
  61: 'CP850', // SQL_AltDiction_CP850_CI_AS
  80: 'CP1250', // SQL_Latin1_General_1250_BIN
  81: 'CP1250', // SQL_Latin1_General_CP1250_CS_AS
  82: 'CP1250', // SQL_Latin1_General_Cp1250_CI_AS_KI_WI
  83: 'CP1250', // SQL_Czech_Cp1250_CS_AS_KI_WI
  84: 'CP1250', // SQL_Czech_Cp1250_CI_AS_KI_WI
  85: 'CP1250', // SQL_Hungarian_Cp1250_CS_AS_KI_WI
  86: 'CP1250', // SQL_Hungarian_Cp1250_CI_AS_KI_WI
  87: 'CP1250', // SQL_Polish_Cp1250_CS_AS_KI_WI
  88: 'CP1250', // SQL_Polish_Cp1250_CI_AS_KI_WI
  89: 'CP1250', // SQL_Romanian_Cp1250_CS_AS_KI_WI
  90: 'CP1250', // SQL_Romanian_Cp1250_CI_AS_KI_WI
  91: 'CP1250', // SQL_Croatian_Cp1250_CS_AS_KI_WI
  92: 'CP1250', // SQL_Croatian_Cp1250_CI_AS_KI_WI
  93: 'CP1250', // SQL_Slovak_Cp1250_CS_AS_KI_WI
  94: 'CP1250', // SQL_Slovak_Cp1250_CI_AS_KI_WI
  95: 'CP1250', // SQL_Slovenian_Cp1250_CS_AS_KI_WI
  96: 'CP1250', // SQL_Slovenian_Cp1250_CI_AS_KI_WI
  104: 'CP1251', // SQL_Latin1_General_1251_BIN
  105: 'CP1251', // SQL_Latin1_General_CP1251_CS_AS
  106: 'CP1251', // SQL_Latin1_General_CP1251_CI_AS
  107: 'CP1251', // SQL_Ukrainian_Cp1251_CS_AS_KI_WI
  108: 'CP1251', // SQL_Ukrainian_Cp1251_CI_AS_KI_WI
  112: 'CP1253', // SQL_Latin1_General_1253_BIN
  113: 'CP1253', // SQL_Latin1_General_CP1253_CS_AS
  114: 'CP1253', // SQL_Latin1_General_CP1253_CI_AS
  120: 'CP1253', // SQL_MixDiction_CP1253_CS_AS
  121: 'CP1253', // SQL_AltDiction_CP1253_CS_AS
  122: 'CP1253', // SQL_AltDiction2_CP1253_CS_AS
  124: 'CP1253', // SQL_Latin1_General_CP1253_CI_AI
  128: 'CP1254', // SQL_Latin1_General_1254_BIN
  129: 'CP1254', // SQL_Latin1_General_Cp1254_CS_AS_KI_WI
  130: 'CP1254', // SQL_Latin1_General_Cp1254_CI_AS_KI_WI
  136: 'CP1255', // SQL_Latin1_General_1255_BIN
  137: 'CP1255', // SQL_Latin1_General_CP1255_CS_AS
  138: 'CP1255', // SQL_Latin1_General_CP1255_CI_AS
  144: 'CP1256', // SQL_Latin1_General_1256_BIN
  145: 'CP1256', // SQL_Latin1_General_CP1256_CS_AS
  146: 'CP1256', // SQL_Latin1_General_CP1256_CI_AS
  152: 'CP1257', // SQL_Latin1_General_1257_BIN
  153: 'CP1257', // SQL_Latin1_General_CP1257_CS_AS
  154: 'CP1257', // SQL_Latin1_General_CP1257_CI_AS
  155: 'CP1257', // SQL_Estonian_Cp1257_CS_AS_KI_WI
  156: 'CP1257', // SQL_Estonian_Cp1257_CI_AS_KI_WI
  157: 'CP1257', // SQL_Latvian_Cp1257_CS_AS_KI_WI
  158: 'CP1257', // SQL_Latvian_Cp1257_CI_AS_KI_WI
  159: 'CP1257', // SQL_Lithuanian_Cp1257_CS_AS_KI_WI
  160: 'CP1257', // SQL_Lithuanian_Cp1257_CI_AS_KI_WI
  183: 'CP1252', // SQL_Danish_Pref_Cp1_CI_AS_KI_WI
  184: 'CP1252', // SQL_SwedishPhone_Pref_Cp1_CI_AS_KI_WI
  185: 'CP1252', // SQL_SwedishStd_Pref_Cp1_CI_AS_KI_WI
  186: 'CP1252', // SQL_Icelandic_Pref_Cp1_CI_AS_KI_WI
  210: 'CP1252', // SQL_EBCDIC037_CP1_CS_AS
  211: 'CP1252', // SQL_EBCDIC273_CP1_CS_AS
  212: 'CP1252', // SQL_EBCDIC277_CP1_CS_AS
  213: 'CP1252', // SQL_EBCDIC278_CP1_CS_AS
  214: 'CP1252', // SQL_EBCDIC280_CP1_CS_AS
  215: 'CP1252', // SQL_EBCDIC284_CP1_CS_AS
  216: 'CP1252', // SQL_EBCDIC285_CP1_CS_AS
  217: 'CP1252', // SQL_EBCDIC297_CP1_CS_AS
};
