
const quranQuotes = [
  {
    text: "And establish prayer and give zakah and bow with those who bow.",
    reference: "Quran 2:43",
    arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ"
  },
  {
    text: "Verily, in the remembrance of Allah do hearts find rest.",
    reference: "Quran 13:28",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him.",
    reference: "Quran 65:3",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ"
  },
  {
    text: "So remember Me; I will remember you.",
    reference: "Quran 2:152",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ"
  },
  {
    text: "And it is He who created the heavens and earth in truth.",
    reference: "Quran 6:73",
    arabic: "وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ"
  },
  {
    text: "And whoever fears Allah - He will make for him a way out.",
    reference: "Quran 65:2",
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
  },
  {
    text: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.",
    reference: "Quran 29:45",
    arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَلَذِكْرُ اللَّهِ أَكْبَرُ"
  },
  {
    text: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive.",
    reference: "Quran 2:45",
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ"
  },
  {
    text: "And Allah is the best of planners.",
    reference: "Quran 8:30",
    arabic: "وَاللَّهُ خَيْرُ الْمَاكِرِينَ"
  },
  {
    text: "So be patient. Indeed, the promise of Allah is truth.",
    reference: "Quran 30:60",
    arabic: "فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ"
  },
  {
    text: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6",
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
  },
  {
    text: "And He is with you wherever you are.",
    reference: "Quran 57:4",
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ"
  },
  {
    text: "So which of the favors of your Lord would you deny?",
    reference: "Quran 55:13",
    arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ"
  },
  {
    text: "And He found you lost and guided you.",
    reference: "Quran 93:7",
    arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ"
  },
  {
    text: "Indeed, Allah does not change the condition of a people until they change what is in themselves.",
    reference: "Quran 13:11",
    arabic: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ"
  }
];

export interface QuranQuote {
  text: string;
  reference: string;
  arabic: string;
}

export const fetchQuote = async (): Promise<QuranQuote> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const randomIndex = Math.floor(Math.random() * quranQuotes.length);
  return quranQuotes[randomIndex];
};

export const getQuoteForTime = (isBeforeFirstPrayer: boolean, isAfterLastPrayer: boolean): QuranQuote => {
  if (isBeforeFirstPrayer) {
    return quranQuotes[0] || quranQuotes[7];
  } else if (isAfterLastPrayer) {
    return quranQuotes[1] || quranQuotes[3];
  } else {
    const randomIndex = Math.floor(Math.random() * quranQuotes.length);
    return quranQuotes[randomIndex];
  }
};

export const getAllQuotes = (): QuranQuote[] => {
  return quranQuotes;
};
