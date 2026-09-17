import { GazetteEdition, Vacancy } from '../types';

export const CURRENT_GAZETTE_EDITION: GazetteEdition = {
  id: 'gazette-2506',
  gazetteNumber: '2,506',
  date: '2026-09-11',
  formattedDate: 'Friday, 11 September 2026',
  part: 'Part I : Section (IIA) — Advertising (Posts — Vacant & Examinations)',
  totalVacancies: 215,
  totalExams: 6,
  pagesCount: 79,
  pdfFileName: 'I-II(A) - (E) (11.09.2026) - PRESS.pdf',
  sourceNote: 'Department of Government Printing, No. 118, Dr. Danister De Silva Mawatha, Colombo 08 (documents.gov.lk).',
  originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
  originalSinhalaPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2F2026.09.11%20Part%20I-II%20A%20(S)%20tem._1789450441.pdf',
  originalTamilPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II%20A%20(T)%2011.09.2026%20PRESS_1789365794.pdf',
  officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
  isRealGovernmentData: true
};

export const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: 'customs-inspector-grade-ii-open-2026',
    slug: 'customs-inspector-grade-ii-open-2026',
    title: {
      en: 'Inspector of Customs, Grade II — Open Competitive Examination',
      si: 'රේගු පරීක්ෂක II ශ්‍රේණිය — විවෘත තරග විභාගය',
      ta: 'சுங்கப் பரிசோதகர் தரம் II — திறந்த போட்டிப் பரீட்சை'
    },
    institution: {
      en: 'Department of Sri Lanka Customs',
      si: 'ශ්‍රී ලංකා රේගු දෙපාර්තමේන්තුව',
      ta: 'இலங்கை சுங்கத் திணைக்களம்'
    },
    ministry: {
      en: 'Ministry of Finance, Planning and Economic Development',
      si: 'මුදල්, ක්‍රමසම්පාදන සහ ආර්ථික සංවර්ධන අමාත්‍යාංශය',
      ta: 'நிதி, திட்டமிடல் மற்றும் பொருளாதார அபிவிருத்தி அமைச்சு'
    },
    gazetteNumber: '2,506',
    gazetteDate: '2026-09-11',
    gazettePart: 'Part I : Section (IIA) — Examinations & Vacancies',
    gazettePage: 72,
    noticeNumber: '09-648/1',
    closingDate: '2026-10-02',
    isNew: true,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    salary: {
      scale: 'Rs. 31,490 – 10 × 445 – 11 × 525 – 10 × 595 – Rs. 67,610 p.m.',
      code: 'MN-4-2016',
      min: 31490,
      max: 67610,
      allowanceNote: 'Plus cost of living allowance, overtime, risk allowances and approved customs service rewards.'
    },
    vacanciesCount: 85,
    qualifications: {
      level: 'AL',
      summary: {
        en: 'Passed G.C.E. (A/L) Examination in three subjects in one sitting AND passed G.C.E. (O/L) with five credit passes including English, Mathematics and Mother Tongue.',
        si: 'එක් වරකදී අ.පො.ස. (උ/පෙළ) විෂයයන් තුනකින් සමත්වීම සහ සිංහල/දෙමළ, ඉංග්‍රීසි හා ගණිතය ඇතුළුව අ.පො.ස. (සා/පෙළ) සම්මාන පහක් (05) සහිතව සමත්වීම.',
        ta: 'ஒரே அமர்வில் க.பொ.த. (உ/த) மூன்று பாடங்களில் சித்தியடைந்ததுடன், தாய்மொழி, ஆங்கிலம், கணிதம் உட்பட ஐந்து திறமைச் சித்திகளுடன் க.பொ.த. (சா/த) சித்தி.'
      },
      requirements: {
        en: [
          'Must have passed in 03 subjects at the G.C.E. (Advanced Level) examination in one sitting (General English and Common General Test passes are required as prescribed).',
          'Must have passed the G.C.E. (Ordinary Level) examination in 06 subjects with 05 credit passes in one sitting including Sinhala/Tamil, English Language, and Mathematics.',
          'Physical Measurements: Male height not less than 5 feet 5 inches (chest 33 inches deflated); Female height not less than 5 feet 3 inches.',
          'Physical fitness test and medical certification conducted by a Government Medical Board.'
        ],
        si: [
          'එක් වරකදී අ.පො.ස. (උසස් පෙළ) විභාගයේදී විෂයයන් 03 කින් සමත්වී තිබිය යුතුය (සාමාන්‍ය පොදු පරීක්ෂණය සහ සාමාන්‍ය ඉංග්‍රීසි ඇතුළුව).',
          'අ.පො.ස. (සාමාන්‍ය පෙළ) විභාගයේදී සිංහල හෝ දෙමළ භාෂාව, ඉංග්‍රීසි භාෂාව සහ ගණිතය ඇතුළුව සම්මාන සාමාර්ථ 05 ක් සහිතව විෂයයන් 06 කින් සමත්වීම.',
          'ශාරීරික යෝග්‍යතාව: පිරිමි උස අඩි 5 අඟල් 5 නොඅඩු විය යුතුය (පපුව අඟල් 33); කාන්තා උස අඩි 5 අඟල් 3 නොඅඩු විය යුතුය.',
          'රජයේ වෛද්‍ය නිලධාරී මණ්ඩලයක් මගින් පවත්වනු ලබන වෛද්‍ය පරීක්ෂණයෙන් සමත්වීම.'
        ],
        ta: [
          'ஒரே அமர்வில் க.பொ.த. (உயர்தர) பரீட்சையில் 03 பாடங்களில் சித்தியடைந்திருக்க வேண்டும்.',
          'ஒரே அமர்வில் சிங்களம்/தமிழ், ஆங்கிலம், கணிதம் உட்பட 05 திறமைச் சித்திகளுடன் 06 பாடங்களில் க.பொ.த. (சா/த) சித்தி.',
          'உடற்கட்டமைப்பு தகைமை: ஆண்கள் 5 அடி 5 அங்குலத்திற்கு குறையாத உயரம்; பெண்கள் 5 அடி 3 அங்குலத்திற்கு குறையாத உயரம்.',
          'அரசாங்க மருத்துவ சபையினால் நடாத்தப்படும் மருத்துவ பரிசோதனையில் சித்தி.'
        ]
      }
    },
    ageLimit: {
      min: 21,
      max: 28,
      description: {
        en: 'Not less than 21 years and not more than 28 years of age as on the closing date of applications (02.10.2026).',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට (2026.10.02) වයස අවුරුදු 21 ට නොඅඩු සහ අවුරුදු 28 ට නොවැඩි විය යුතුය.',
        ta: 'விண்ணப்பங்கள் ஏற்றுக்கொள்ளப்படும் இறுதித் திகதியில் (02.10.2026) வயது 21க்கு குறையாமலும் 28க்கு மேற்படாமலும் இருத்தல் வேண்டும்.'
      }
    },
    location: 'Colombo & Islandwide Ports/Airports',
    field: 'Finance',
    organizationType: 'Department',
    jobType: 'Open Competitive Exam',
    methodOfRecruitment: {
      en: 'Written Competitive Examination conducted by the Commissioner General of Examinations (Aptitude & Customs Law Principles) followed by Physical Fitness & Structured Interview.',
      si: 'විභාග කොමසාරිස් ජනරාල්වරයා විසින් පවත්වනු ලබන ලිඛිත තරග විභාගය (අභියෝග්‍යතාවය හා රේගු නීති මූලධර්ම), ශාරීරික යෝග්‍යතා පරීක්ෂණය සහ ව්‍යුහගත සම්මුඛ පරීක්ෂණය.',
      ta: 'பரீட்சைகள் ஆணையாளர் நாயகத்தினால் நடாத்தப்படும் எழுத்துப் போட்டிப் பரீட்சை மற்றும் உடற்றகுதி நேர்முகப் பரீட்சை.'
    },
    howToApply: {
      steps: {
        en: [
          'Applications should be submitted online exclusively through the official portal of the Department of Examinations (www.doenets.lk).',
          'Examination fee is Rs. 600/- payable online via credit/debit card or at any Bank of Ceylon or Postal Department counter.',
          'Download and print the certified online confirmation slip upon completion of online submission.',
          'Bring the printed admission card along with valid National Identity Card (NIC) or Passport to the designated examination hall.'
        ],
        si: [
          'අයදුම්පත් ශ්‍රී ලංකා විභාග දෙපාර්තමේන්තුවේ නිල වෙබ් අඩවිය (www.doenets.lk) ඔස්සේ පමණක් මාර්ගගතව ඉදිරිපත් කළ යුතුය.',
          'විභාග ගාස්තුව රු. 600/- ක් වන අතර එය මාර්ගගතව හෝ ලංකා බැංකු ශාඛාවක් මගින් ගෙවිය යුතුය.',
          'මාර්ගගත අයදුම්පත සම්පූර්ණ කිරීමෙන් පසු ලැබෙන තහවුරු කිරීමේ පත්‍රිකාව මුද්‍රණය කර ළඟ තබා ගන්න.'
        ],
        ta: [
          'பரீட்சைத் திணைக்களத்தின் அதிகாரப்பூர்வ இணையத்தளம் (www.doenets.lk) ஊடாக மாத்திரமே விண்ணப்பங்கள் சமர்ப்பிக்கப்பட வேண்டும்.',
          'பரீட்சைக் கட்டணம் ரூ. 600/- ஆகும்.'
        ]
      },
      applicationFee: 'Rs. 600/-',
      postalAddress: {
        en: 'Director General of Customs, Sri Lanka Customs, No. 40, Main Street, Colombo 11 / Commissioner General of Examinations, Pelawatta, Battaramulla.',
        si: 'රේගු අධ්‍යක්ෂ ජනරාල්, ශ්‍රී ලංකා රේගුව, අංක 40, ප්‍රධාන වීදිය, කොළඹ 11 / විභාග කොමසාරිස් ජනරාල්, පැලවත්ත, බත්තරමුල්ල.',
        ta: 'சுங்கப் பணிப்பாளர் நாயகம், இலங்கை சுங்கம், கொழும்பு 11 / பரீட்சைகள் ஆணையாளர் நாயகம், பத்தரமுல்லை.'
      },
      onlinePortalUrl: 'https://www.doenets.lk',
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'DEPARTMENT OF SRI LANKA CUSTOMS — OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO THE POSTS OF INSPECTOR OF CUSTOMS, GRADE II',
      preamble: 'APPLICATIONS are invited from citizens of Sri Lanka for the Open Competitive Examination for recruitment to the posts of Inspector of Customs, Grade II of the Department of Sri Lanka Customs. The examination will be held by the Commissioner General of Examinations in December 2026 in Colombo, Kandy, Galle, Jaffna, Anuradhapura, and Badulla.',
      bodyParagraphs: [
        '01. Number of Vacancies: Eighty-Five (85). Recruitment will be made on all-island merit order based on aggregate marks.',
        '02. Salary Scale: As per Public Administration Circular 03/2016, salary code MN-4-2016: Rs. 31,490 - 10x445 - 11x525 - 10x595 - Rs. 67,610 p.m.',
        '03. Examination Procedure: Written Examination comprises Paper 1 (Aptitude - 01 hour, 100 marks) and Paper 2 (English Language Proficiency & Customs Knowledge - 02 hours, 100 marks). Cut-off mark for qualification is 60%.',
        '04. Closing Date: Applications close at 12:00 midnight on 2nd October 2026. No late applications will be entertained.'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'port-state-controller-engineering-2026',
    slug: 'port-state-controller-engineering-2026',
    title: {
      en: 'Port State Controller (Engineering) / Marine Surveyor',
      si: 'වරාය රාජ්‍ය පාලක (ඉංජිනේරු) / සමුද්‍රීය මිනින්දෝරු',
      ta: 'துறைமுக அரசுக் கட்டுப்பாட்டாளர் (பொறியியல்) / கடல்சார் அளவையாளர்'
    },
    institution: {
      en: 'Merchant Shipping Secretariat',
      si: 'වෙළඳ නැව් ලේකම් කාර්යාලය',
      ta: 'வர்த்தக கப்பல் செயலகம்'
    },
    ministry: {
      en: 'Ministry of Ports and Civil Aviation',
      si: 'වරාය සහ සිවිල් ගුවන්සේවා අමාත්‍යාංශය',
      ta: 'துறைமுகங்கள் மற்றும் சிவில் விமானப் போக்குவரத்து அமைச்சு'
    },
    gazetteNumber: '2,506',
    gazetteDate: '2026-09-11',
    gazettePart: 'Part I : Section (IIA) — Posts Vacant',
    gazettePage: 4,
    noticeNumber: '09-640/1',
    closingDate: '2026-09-25',
    isNew: true,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    salary: {
      scale: 'Rs. 47,615 – 10 × 1,120 – 10 × 1,335 – 8 × 1,630 – Rs. 84,070 p.m.',
      code: 'SL-1-2016',
      min: 47615,
      max: 84070,
      allowanceNote: 'Plus special maritime allowance, sea inspection allowance and standard government allowances.'
    },
    vacanciesCount: 6,
    qualifications: {
      level: 'Bachelors',
      summary: {
        en: 'Certificate of Competency as Chief Engineer Officer (STCW 95) OR B.Sc. Degree in Marine Engineering with 3 years seafaring experience on ocean-going merchant vessels.',
        si: 'ප්‍රධාන ඉංජිනේරු නිලධාරී යෝග්‍යතා සහතිකය (STCW 95) හෝ සමුද්‍රීය ඉංජිනේරු විද්‍යාව පිළිබඳ විද්‍යාවේදී (B.Sc.) උපාධිය සහ මුහුදු සේවා පළපුරුද්ද.',
        ta: 'தலைமைப் பொறியியலாளர் தகைமைச் சான்றிதழ் (STCW 95) அல்லது கடல்சார் பொறியியல் பட்டப்படிப்பு.'
      },
      requirements: {
        en: [
          'Certificate of Competency as Chief Engineer Officer (STCW 95 Reg. III/2 - Unlimited) issued by Director General of Merchant Shipping or equivalent IMO recognized maritime administration, OR',
          'Bachelor of Science Degree in Marine Engineering / Mechanical Engineering from a university recognized by the UGC of Sri Lanka.',
          'Minimum 3 years of post-qualification sea service as certified Watchkeeping Engineer or Chief Engineer on foreign-going vessels over 3,000 kW propulsion power.',
          'Comprehensive knowledge of IMO conventions including SOLAS, MARPOL, STCW, and Merchant Shipping Act No. 52 of 1971.'
        ],
        si: [
          'වෙළඳ නැව් අධ්‍යක්ෂ ජනරාල්වරයා හෝ ජාත්‍යන්තර සමුද්‍රීය සංවිධානය (IMO) පිළිගත් සමුද්‍රීය පරිපාලනයක් විසින් නිකුත් කරන ලද ප්‍රධාන ඉංජිනේරු නිලධාරී යෝග්‍යතා සහතිකය (STCW 95 Reg. III/2).',
          'ශ්‍රී ලංකා විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව (UGC) විසින් පිළිගත් විශ්වවිද්‍යාලයකින් සමුද්‍රීය ඉංජිනේරු විද්‍යාව පිළිබඳ උපාධිය.',
          'කිලෝවොට් 3,000 ඉක්මවූ සාගර යාත්‍රා වල සේවය කළ වසර 3 ක මුහුදු සේවා පළපුරුද්ද.'
        ],
        ta: [
          'சர்வதேச கடல்சார் அமைப்பினால் அங்கீகரிக்கப்பட்ட தலைமைப் பொறியியலாளர் சான்றிதழ்.',
          'கடல்சார் பொறியியல் துறையில் கௌரவப் பட்டம் மற்றும் 3 வருட அனுபவம்.'
        ]
      }
    },
    ageLimit: {
      min: 25,
      max: 45,
      description: {
        en: 'Should not be less than 25 years and not more than 45 years of age on the closing date of applications.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 25 ට නොඅඩු හා 45 ට නොවැඩි විය යුතුය.',
        ta: 'வயது 25க்கு குறையாமலும் 45க்கு மேற்படாமலும் இருத்தல் வேண்டும்.'
      }
    },
    location: 'Port of Colombo / Galle / Trincomalee / Hambantota',
    field: 'Engineering',
    organizationType: 'Department',
    jobType: 'Permanent',
    methodOfRecruitment: {
      en: 'Structured interview assessing technical expertise in port state inspection, international maritime conventions, and ship survey protocols.',
      si: 'වරාය පරීක්ෂණ, ජාත්‍යන්තර සමුද්‍රීය සම්මුති හා නැව් සමීක්ෂණ පිළිබඳ තාක්ෂණික දැනුම පරීක්ෂා කෙරෙන ව්‍යුහගත සම්මුඛ පරීක්ෂණය.',
      ta: 'தொழிநுட்ப நேர்முகப் பரீட்சை மூலம் தெரிவு செய்யப்படுவர்.'
    },
    howToApply: {
      steps: {
        en: [
          'Applications prepared according to the specimen format published on page 7 of Gazette No. 2,506 must be sent by registered post.',
          'Certified copies of STCW Continuous Discharge Certificate (CDC), degree certificates, and testimonials must be attached.',
          'Write "Application for the Post of Port State Controller (Engineering)" on top left corner of the envelope.',
          'Must reach the Secretary, Ministry of Ports and Civil Aviation on or before 25th September 2026.'
        ],
        si: [
          '2,506 දරන ගැසට් පත්‍රයේ 7 වන පිටුවේ පළවූ ආදර්ශ අයදුම්පත අනුව සකස් කළ අයදුම්පත් ලියාපදිංචි තැපෑලෙන් එවිය යුතුය.',
          'සහතික කළ සහතික පත් පිටපත් අමුණා ලියුම් කවරයේ වම්පස ඉහළ කෙළවරේ තනතුරේ නම සඳහන් කළ යුතුය.'
        ],
        ta: [
          'வர்த்தமானியில் பிரசுரிக்கப்பட்ட மாதிரிப் படிவத்தில் விண்ணப்பத்தை பூர்த்தி செய்து பதிவுத் தபாலில் அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'Secretary, Ministry of Ports and Civil Aviation, No. 19, Chaithya Road, Colombo 01.',
        si: 'ලේකම්, වරාය සහ සිවිල් ගුවන්සේවා අමාත්‍යාංශය, අංක 19, චෛත්‍ය පාර, කොළඹ 01.',
        ta: 'செயலாளர், துறைமுகங்கள் மற்றும் சிவில் விமானப் போக்குவரத்து அமைச்சு, இல. 19, சைத்திய வீதி, கொழும்பு 01.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'MINISTRY OF PORTS AND CIVIL AVIATION — MERCHANT SHIPPING SECRETARIAT — POST OF PORT STATE CONTROLLER (ENGINEERING)',
      preamble: 'APPLICATIONS are invited from citizens of Sri Lanka who possess the required qualifications to fill vacancies in the post of Port State Controller (Engineering) / Surveyor in the Merchant Shipping Secretariat.',
      bodyParagraphs: [
        '01. Key Responsibilities: Carrying out Port State Control (PSC) inspections on foreign flag vessels arriving at Sri Lankan ports under the Indian Ocean Memorandum of Understanding (IOMOU), conducting flag state surveys on Sri Lankan ships, and enforcing safety conventions.',
        '02. Salary Code: SL-1-2016, Rs. 47,615 - 10x1,120 - 10x1,335 - 8x1,630 - Rs. 84,070 p.m.',
        '03. Closing Date: 25.09.2026. Specimen application form appears on Page 7 of Section II(A).'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'legal-officer-merchant-shipping-2026',
    slug: 'legal-officer-merchant-shipping-2026',
    title: {
      en: 'Legal Officer — Merchant Shipping Secretariat',
      si: 'නීති නිලධාරී — වෙළඳ නැව් ලේකම් කාර්යාලය',
      ta: 'சட்ட உத்தியோகத்தர் — வர்த்தக கப்பல் செயலகம்'
    },
    institution: {
      en: 'Merchant Shipping Secretariat',
      si: 'වෙළඳ නැව් ලේකම් කාර්යාලය',
      ta: 'வர்த்தக கப்பல் செயலகம்'
    },
    ministry: {
      en: 'Ministry of Ports and Civil Aviation',
      si: 'වරාය සහ සිවිල් ගුවන්සේවා අමාත්‍යාංශය',
      ta: 'துறைமுகங்கள் மற்றும் சிவில் விமானப் போக்குவரத்து அமைச்சு'
    },
    gazetteNumber: '2,506',
    gazetteDate: '2026-09-11',
    gazettePart: 'Part I : Section (IIA) — Posts Vacant',
    gazettePage: 9,
    noticeNumber: '09-641/1',
    closingDate: '2026-09-25',
    isNew: true,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    salary: {
      scale: 'Rs. 53,175 – 10 × 1,375 – 15 × 1,910 – Rs. 95,575 p.m.',
      code: 'MM-1-1-2016',
      min: 53175,
      max: 95575,
      allowanceNote: 'Plus professional legal allowance, transport allowance, and approved civil service allowances.'
    },
    vacanciesCount: 2,
    qualifications: {
      level: 'Professional',
      summary: {
        en: 'Attorney-at-Law of the Supreme Court of Sri Lanka with not less than 3 years active professional practice or experience in Admiralty/Maritime or Commercial Law.',
        si: 'ශ්‍රී ලංකා ශ්‍රේෂ්ඨාධිකරණයේ නීතිඥවරයෙකු ලෙස දිවුරුම් දී තිබීම සහ නාවික/වාණිජ නීතිය පිළිබඳ වසර 3 කට නොඅඩු වෘත්තීය පළපුරුද්ද.',
        ta: 'இலங்கை உயர் நீதிமன்ற சட்டத்தரணியாக சத்தியப்பிரமாணம் செய்திருப்பதுடன் கடல்சார் சட்டத்தில் 3 வருட அனுபவம்.'
      },
      requirements: {
        en: [
          'Enrolled and admitted as an Attorney-at-Law of the Supreme Court of Sri Lanka.',
          'Minimum three (03) years of active court practice or legal advisory experience in a government department, public corporation, or reputed legal firm specializing in admiralty, maritime, or commercial law.',
          'Postgraduate Diploma or Master of Laws (LL.M.) in Maritime Law / International Trade Law will be an added advantage.',
          'High proficiency in English (both spoken and drafting legal opinions and international maritime bilateral agreements).'
        ],
        si: [
          'ශ්‍රී ලංකා ශ්‍රේෂ්ඨාධිකරණයේ නීතිඥවරයෙකු ලෙස ලියාපදිංචි වී තිබීම.',
          'අධිකරණ වල නඩු මෙහෙයවීම හෝ රාජ්‍ය/පෞද්ගලික ආයතනයක නීති කටයුතු පිළිබඳ වසර 03 කට නොඅඩු සක්‍රීය පළපුරුද්ද.',
          'සමුද්‍රීය නීතිය (Maritime Law) පිළිබඳ පශ්චාත් උපාධියක් සහිත වීම විශේෂ සුදුසුකමකි.'
        ],
        ta: [
          'இலங்கை உயர் நீதிமன்ற சட்டத்தரணியாக பதிவு செய்யப்பட்டிருத்தல்.',
          'சட்ட ஆலோசனைகளில் 3 வருடங்கள் அனுபவம் கொண்டிருத்தல்.'
        ]
      }
    },
    ageLimit: {
      min: 24,
      max: 45,
      description: {
        en: 'Between 24 and 45 years of age on the closing date.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 24 ත් 45 ත් අතර විය යුතුය.',
        ta: 'வயது 24 முதல் 45 வரை இருத்தல் வேண்டும்.'
      }
    },
    location: 'Colombo (Head Office)',
    field: 'Law',
    organizationType: 'Department',
    jobType: 'Permanent',
    methodOfRecruitment: {
      en: 'Structured interview conducted by a board appointed by the Ministry of Ports and Civil Aviation.',
      si: 'වරාය හා සිවිල් ගුවන්සේවා අමාත්‍යාංශය මගින් පත්කරන ලද මණ්ඩලයක් විසින් පවත්වනු ලබන ව්‍යුහගත සම්මුඛ පරීක්ෂණය.',
      ta: 'நேர்முகப் பரீட்சை மூலம் ஆட்சேர்ப்பு.'
    },
    howToApply: {
      steps: {
        en: [
          'Complete the specimen application form published on page 13 of Gazette No. 2,506.',
          'Attach certified copies of Bar Association certificate, Supreme Court enrollment decree, and certificates of practice.',
          'Dispatch via registered post to reach the Secretary, Ministry of Ports and Civil Aviation by 25.09.2026.'
        ],
        si: [
          '2,506 ගැසට් පත්‍රයේ 13 වන පිටුවේ සඳහන් ආදර්ශ අයදුම්පත සම්පූර්ණ කර ලියාපදිංචි තැපෑලෙන් යොමු කරන්න.'
        ],
        ta: [
          'வர்த்தமானி மாதிரிப் படிவத்தை நிரப்பி பதிவுத் தபாலில் அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'Secretary, Ministry of Ports and Civil Aviation, No. 19, Chaithya Road, Colombo 01.',
        si: 'ලේකම්, වරාය සහ සිවිල් ගුවන්සේවා අමාත්‍යාංශය, අංක 19, චෛත්‍ය පාර, කොළඹ 01.',
        ta: 'செயலாளர், துறைமுகங்கள் மற்றும் சிவில் விமானப் போக்குவரத்து அமைச்சு, கொழும்பு 01.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'RECRUITMENT FOR THE POST OF LEGAL OFFICER OF THE MERCHANT SHIPPING SECRETARIAT — 2026',
      preamble: 'APPLICATIONS are invited from Sri Lankan citizens possessing qualifications set out below for recruitment to the post of Legal Officer in the Merchant Shipping Secretariat under the Ministry of Ports and Civil Aviation.',
      bodyParagraphs: [
        '01. Duties: Providing legal counsel on marine casualties, ship mortgage registrations, seafarer claims, oil pollution incidents, and drafting legislation for maritime safety regulations.',
        '02. Closing Date: 25th September 2026. Envelopes must be marked "Post of Legal Officer - Merchant Shipping".'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'museums-supervisory-technical-mn3-2026',
    slug: 'museums-supervisory-technical-mn3-2026',
    title: {
      en: 'Supervisory Management Assistant (Technical) — Category MN-3-2025',
      si: 'අධීක්ෂණ කළමනාකරණ සහකාර (තාක්ෂණික) — සේවා ගණනය MN-3-2025',
      ta: 'மேற்பார்வை முகாமைத்துவ உதவியாளர் (தொழிநுட்ப) — MN-3-2025'
    },
    institution: {
      en: 'Department of National Museums',
      si: 'ජාතික කෞතුකාගාර දෙපාර්තමේන්තුව',
      ta: 'தேசிய அருங்காட்சியகத் திணைக்களம்'
    },
    ministry: {
      en: 'Ministry of Buddhasasana, Religious and Cultural Affairs',
      si: 'බුද්ධශාසන, ආගමික හා සංස්කෘතික කටයුතු අමාත්‍යාංශය',
      ta: 'புத்தசாசன, சமய மற்றும் கலாசார அலுவல்கள் அமைச்சு'
    },
    gazetteNumber: '2,506',
    gazetteDate: '2026-09-11',
    gazettePart: 'Part I : Section (IIA) — Posts Vacant',
    gazettePage: 15,
    noticeNumber: '09-642/1',
    closingDate: '2026-10-09',
    isNew: true,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    salary: {
      scale: 'Rs. 31,040 – 10 × 445 – 11 × 525 – 10 × 595 – Rs. 67,160 p.m.',
      code: 'MN-3-2025',
      min: 31040,
      max: 67160,
      allowanceNote: 'Plus special artifact preservation allowances and cost of living allowance.'
    },
    vacanciesCount: 14,
    qualifications: {
      level: 'Diploma',
      summary: {
        en: 'National Diploma in Technology (NDT) / NDES / HND in Chemical / Electrical / Mechanical Technology OR NVQ Level 5 in Conservation of Cultural Property.',
        si: 'ජාතික තාක්ෂණ ඩිප්ලෝමාව (NDT), HND හෝ සංස්කෘතික උරුමයන් සංරක්ෂණය පිළිබඳ NVQ 5 මට්ටම.',
        ta: 'தேசிய தொழிநுட்ப டிப்ளோமா (NDT) அல்லது NVQ மட்டம் 5 தகைமை.'
      },
      requirements: {
        en: [
          'Passed G.C.E. (Ordinary Level) examination in six subjects with credit passes in Sinhala/Tamil, Mathematics, Science, and English in not more than two sittings.',
          'National Diploma in Technology (NDT) or National Diploma in Engineering Sciences (NDES) or Higher National Diploma in Engineering (HNDE) awarded by a recognized institute, OR',
          'NVQ Level 5 or higher qualification in Chemical Conservation, Artifact Preservation, Museum Display Technology or Archaeological Science.'
        ],
        si: [
          'අ.පො.ස. (සාමාන්‍ය පෙළ) විභාගයේදී සම්මාන 04 ක් සහිතව විෂයයන් 06 කින් සමත්වීම.',
          'පිළිගත් ආයතනයකින් NDT, NDES හෝ HND තාක්ෂණ ඩිප්ලෝමාව හෝ පුරාවිද්‍යා සංරක්ෂණය පිළිබඳ NVQ මට්ටම 5 සහතිකය.'
        ],
        ta: [
          'க.பொ.த. (சா/த) சித்தியுடன் NDT அல்லது HND டிப்ளோமா பெற்றிருத்தல்.'
        ]
      }
    },
    ageLimit: {
      min: 18,
      max: 35,
      description: {
        en: 'Not less than 18 years and not more than 35 years as on 09.10.2026.',
        si: '2026.10.09 දිනට වයස අවුරුදු 18 ට නොඅඩු හා 35 ට නොවැඩි විය යුතුය.',
        ta: 'வயது 18க்கு குறையாமலும் 35க்கு மேற்படாமலும் இருத்தல் வேண்டும்.'
      }
    },
    location: 'Colombo Museum / Kandy / Galle / Ratnapura / Anuradhapura',
    field: 'Engineering',
    organizationType: 'Department',
    jobType: 'Permanent',
    methodOfRecruitment: {
      en: 'Structured interview assessing technical expertise in museum preservation and artifact maintenance.',
      si: 'කෞතුකාගාර කෞතුක භාණ්ඩ සංරක්ෂණය හා නඩත්තුව පිළිබඳ තාක්ෂණික ව්‍යුහගත සම්මුඛ පරීක්ෂණය.',
      ta: 'நேர்முகப் பரீட்சை மூலம் ஆட்சேர்ப்பு.'
    },
    howToApply: {
      steps: {
        en: [
          'Prepare application as per specimen given on page 18 of Gazette No. 2,506.',
          'Send under registered post to "Director General, Department of National Museums, P.O. Box 854, Sir Marcus Fernando Mawatha, Colombo 07".',
          'Closing date is 09 October 2026.'
        ],
        si: [
          '2,506 ගැසට් පත්‍රයේ 18 පිටුවේ ඇති ආදර්ශ අයදුම්පත අනුව අයදුම්පත් සකස් කර ජාතික කෞතුකාගාර අධ්‍යක්ෂ ජනරාල් වෙත ලියාපදිංචි තැපෑලෙන් එවන්න.'
        ],
        ta: [
          'மாதிரிப் படிவத்தில் பூர்த்தி செய்து பணிப்பாளர் நாயகம், தேசிய அருங்காட்சியகத் திணைக்களத்திற்கு அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'Director General, Department of National Museums, Sir Marcus Fernando Mawatha, Colombo 07.',
        si: 'අධ්‍යක්ෂ ජනරාල්, ජාතික කෞතුකාගාර දෙපාර්තමේන්තුව, සර් මාකස් ප්‍රනාන්දු මාවත, කොළඹ 07.',
        ta: 'பணிப்பாளர் நாயகம், தேசிய அருங்காட்சியகத் திணைக்களம், கொழும்பு 07.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'DEPARTMENT OF NATIONAL MUSEUMS — SUPERVISORY MANAGEMENT ASSISTANT (TECHNICAL) MN-3-2025',
      preamble: 'APPLICATIONS are invited from citizens of Sri Lanka for recruitment to the posts in Supervisory Management Assistant (Technical) Officer Category of the Department of National Museums.',
      bodyParagraphs: [
        '01. Posts to be filled: Museum Conservation Supervisor, Display & Taxidermy Technical Officer, Preservation Chemist Assistant.',
        '02. Closing Date: 09 October 2026. Specimen form published on Page 18.'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'electro-medical-technician-grade-iii-2026',
    slug: 'electro-medical-technician-grade-iii-2026',
    title: {
      en: 'Electro-Medical Technician Grade III — Open Competitive Examination',
      si: 'විද්‍යුත් වෛද්‍ය කාර්මික ශිල්පී III ශ්‍රේණිය — විවෘත තරග විභාගය',
      ta: 'மின்னியல் மருத்துவ தொழிநுட்பவியலாளர் தரம் III — திறந்த போட்டிப் பரீட்சை'
    },
    institution: {
      en: 'Bio-Medical Engineering Services',
      si: 'ජෛව වෛද්‍ය ඉංජිනේරු සේවා අංශය',
      ta: 'உயிர்-மருத்துவ பொறியியல் சேவைகள்'
    },
    ministry: {
      en: 'Ministry of Health and Mass Media',
      si: 'සෞඛ්‍ය හා ජනමාධ්‍ය අමාත්‍යාංශය',
      ta: 'சுகாதார மற்றும் வெகுஜன ஊடக அமைச்சு'
    },
    gazetteNumber: '2,506',
    gazetteDate: '2026-09-11',
    gazettePart: 'Part I : Section (IIA) — Examinations',
    gazettePage: 53,
    noticeNumber: '09-645/1',
    closingDate: '2026-10-09',
    isNew: true,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    salary: {
      scale: 'Rs. 31,040 – 10 × 445 – 11 × 525 – 10 × 595 – Rs. 67,160 p.m.',
      code: 'MT-1-2016',
      min: 31040,
      max: 67160,
      allowanceNote: 'Plus hospital on-call allowances, risk allowance, and overtime.'
    },
    vacanciesCount: 38,
    qualifications: {
      level: 'Diploma',
      summary: {
        en: 'National Diploma in Technology (NDT) in Electrical / Electronics Engineering OR Higher National Diploma (HNDE) in Electrical / Biomedical Technology OR NVQ Level 5.',
        si: 'විදුලි හෝ ඉලෙක්ට්‍රොනික ඉංජිනේරු විද්‍යාව පිළිබඳ NDT, HNDE හෝ NVQ 5 මට්ටමේ ඩිප්ලෝමාව.',
        ta: 'மின்னியல் அல்லது இலத்திரனியல் பொறியியலில் NDT அல்லது HNDE டிப்ளோமா.'
      },
      requirements: {
        en: [
          'Passed G.C.E. (Advanced Level) in Mathematics or Science stream in one sitting.',
          'National Diploma in Technology (NDT - Katubedda) or National Diploma in Engineering Sciences (NDES) in Electrical / Electronic Engineering, OR',
          'Higher National Diploma in Engineering (HNDE) awarded by SLIATE in Electrical / Electronics, OR',
          'National Vocational Qualification (NVQ Level 5 or 6) in Biomedical Equipment Maintenance.'
        ],
        si: [
          'අ.පො.ස. (උ/පෙළ) ගණිත හෝ විද්‍යා අංශයෙන් එක් වරකදී සමත්වීම.',
          'විදුලි හෝ ඉලෙක්ට්‍රොනික ඉංජිනේරු විද්‍යාව පිළිබඳ NDT, NDES හෝ HNDE ඩිප්ලෝමාව.'
        ],
        ta: [
          'க.பொ.த. (உ/த) கணித அல்லது விஞ்ஞானப் பிரிவில் சித்தி மற்றும் மின்னியல் NDT டிப்ளோமா.'
        ]
      }
    },
    ageLimit: {
      min: 18,
      max: 30,
      description: {
        en: 'Between 18 and 30 years as at closing date.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 18 ත් 30 ත් අතර විය යුතුය.',
        ta: 'வயது 18 முதல் 30 வரை இருத்தல் வேண்டும்.'
      }
    },
    location: 'Teaching & Base Hospitals Islandwide',
    field: 'Health',
    organizationType: 'Ministry',
    jobType: 'Open Competitive Exam',
    methodOfRecruitment: {
      en: 'Written Competitive Examination (Intelligence & Basic Electrical/Electronic Technology) conducted by Department of Examinations, followed by Practical Test.',
      si: 'විභාග දෙපාර්තමේන්තුව විසින් පවත්වනු ලබන ලිඛිත තරග විභාගය සහ ප්‍රායෝගික පරීක්ෂණය.',
      ta: 'பரீட்சைத் திணைக்களத்தால் நடாத்தப்படும் எழுத்துப் பரீட்சை மற்றும் செய்முறைப் பரீட்சை.'
    },
    howToApply: {
      steps: {
        en: [
          'Applications prepared according to the specimen on page 58 of Gazette No. 2,506 must be submitted under registered post.',
          'Application fee of Rs. 600/- should be credited to the account of Commissioner General of Examinations at Bank of Ceylon.',
          'Attach bank receipt and dispatch to Director General of Health Services before 09.10.2026.'
        ],
        si: [
          'ගැසට් පත්‍රයේ 58 පිටුවේ ආදර්ශ අයදුම්පත අනුව සකස් කළ අයදුම්පත විභාග ගාස්තු රිසිට්පත සමඟ ලියාපදිංචි තැපෑලෙන් සෞඛ්‍ය සේවා අධ්‍යක්ෂ ජනරාල් වෙත එවන්න.'
        ],
        ta: [
          'வர்த்தமானி மாதிரிப் படிவத்தில் பூர்த்தி செய்து சுகாதார சேவைகள் பணிப்பாளர் நாயகத்திற்கு அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'Director General of Health Services, Ministry of Health, "Suwasiripaya", 385, Rev. Baddegama Wimalawansa Thero Mawatha, Colombo 10.',
        si: 'සෞඛ්‍ය සේවා අධ්‍යක්ෂ ජනරාල්, සෞඛ්‍ය අමාත්‍යාංශය, "සුවසිරිපාය", අංක 385, පූජ්‍ය බද්දේගම විමලවංශ හිමි මාවත, කොළඹ 10.',
        ta: 'சுகாதார சேவைகள் பணிப்பாளர் நாயகம், சுகாதார அமைச்சு, "சுவசிரிபாய", கொழும்பு 10.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'MINISTRY OF HEALTH AND MASS MEDIA — OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO THE POST OF ELECTRO-MEDICAL TECHNICIAN GRADE III',
      preamble: 'IT is hereby notified that an Open Competitive Examination will be held by the Commissioner General of Examinations for recruitment to thirty-eight (38) vacancies in the Post of Electro-Medical Technician Grade III.',
      bodyParagraphs: [
        '01. Duties: Installation, testing, calibration, repair, and preventive maintenance of biomedical apparatus, intensive care monitors, surgical diathermy units, and diagnostic imaging equipment in government hospitals.',
        '02. Examination: Subject 01 - General Intelligence (01 hour); Subject 02 - Technical Subject Knowledge in Electrical, Electronics, and Basic Medical Instrumentation (02 hours). Passing mark is 40% for each paper.'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'foreign-service-slfs-grade-iii-2026',
    slug: 'foreign-service-slfs-grade-iii-2026',
    title: {
      en: 'Sri Lanka Foreign Service (SLFS) Grade III — Open Competitive Examination',
      si: 'ශ්‍රී ලංකා විදේශ සේවය (SLFS) III ශ්‍රේණිය — විවෘත තරග විභාගය',
      ta: 'இலங்கை வெளிநாட்டு சேவை (SLFS) தரம் III — திறந்த போட்டிப் பரீட்சை'
    },
    institution: {
      en: 'Sri Lanka Foreign Service Cadre',
      si: 'ශ්‍රී ලංකා විදේශ සේවා කාඩරය',
      ta: 'இலங்கை வெளிநாட்டு சேவை ஆளணி'
    },
    ministry: {
      en: 'Ministry of Foreign Affairs, Foreign Employment and Tourism',
      si: 'විදේශ කටයුතු, විදේශ රැකියා සහ සංචාරක අමාත්‍යාංශය',
      ta: 'வெளிநாட்டு அலுவல்கள், வெளிநாட்டு வேலைவாய்ப்பு மற்றும் சுற்றுலா அமைச்சு'
    },
    gazetteNumber: '2,505',
    gazetteDate: '2026-09-04',
    gazettePart: 'Part I : Section (IIA) — Examinations',
    gazettePage: 10,
    noticeNumber: '09-620/1',
    closingDate: '2026-09-28',
    isNew: false,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(04.09.2026)%20-(E)%20Press_1788868148.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-04',
    salary: {
      scale: 'Rs. 47,615 – 10 × 1,335 – 8 × 1,630 – 17 × 2,170 – Rs. 110,895 p.m.',
      code: 'SL-1-2016',
      min: 47615,
      max: 110895,
      allowanceNote: 'Plus diplomatic overseas allowances and allowances applicable to overseas diplomatic missions.'
    },
    vacanciesCount: 25,
    qualifications: {
      level: 'Bachelors',
      summary: {
        en: 'A Degree with First Class or Second Class Honours from a recognized University in Sri Lanka or overseas recognized by the UGC of Sri Lanka.',
        si: 'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව (UGC) පිළිගත් විශ්වවිද්‍යාලයකින් පළමු පෙළ හෝ දෙවන පෙළ ගෞරව උපාධියක් සහිත වීම.',
        ta: 'பல்கலைக்கழக மானியங்கள் ஆணைக்குழுவினால் அங்கீகரிக்கப்பட்ட முதலாம் அல்லது இரண்டாம் வகுப்பு கௌரவப் பட்டம்.'
      },
      requirements: {
        en: [
          'A Degree with First Class or Second Class (Upper/Lower Division) Honours awarded by a recognized university in Sri Lanka or any overseas university recognized by the UGC.',
          'High proficiency in English (oral and written diplomacy drafting). Knowledge of an additional foreign language (French, Arabic, Chinese, Japanese, Russian, German) is an added qualification.',
          'Must be a citizen of Sri Lanka of excellent moral character and sound physical health.'
        ],
        si: [
          'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව පිළිගත් විශ්වවිද්‍යාලයකින් ප්‍රථම හෝ දෙවන පෙළ ගෞරව උපාධියක් සහිත වීම.',
          'ඉංග්‍රීසි භාෂාව පිළිබඳ විශිෂ්ට දැනුම සහ අතිරේක විදේශීය භාෂා ඥානය විශේෂ සුදුසුකමකි.'
        ],
        ta: [
          'அங்கீகரிக்கப்பட்ட பல்கலைக்கழக கௌரவப் பட்டம் மற்றும் சிறந்த ஆங்கில மொழித் தேர்ச்சி.'
        ]
      }
    },
    ageLimit: {
      min: 22,
      max: 30,
      description: {
        en: 'Not less than 22 years and not more than 30 years as at closing date.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 22 ට නොඅඩු හා 30 ට නොවැඩි විය යුතුය.',
        ta: 'வயது 22 முதல் 30 வரை இருத்தல் வேண்டும்.'
      }
    },
    location: 'Colombo (Ministry) & Overseas Diplomatic Missions',
    field: 'Administration',
    organizationType: 'Ministry',
    jobType: 'Open Competitive Exam',
    methodOfRecruitment: {
      en: 'Four-paper written competitive examination (World Affairs & International Relations, Sinhala/Tamil/English Comprehension, General Knowledge, Critical Aptitude) followed by Viva Voce Interview.',
      si: 'ලිඛිත තරග විභාගය (ජාත්‍යන්තර සබඳතා, භාෂා ප්‍රවීණතාවය, සාමාන්‍ය දැනුම හා බුද්ධි පරීක්ෂණය) සහ වාචික සම්මුඛ පරීක්ෂණය.',
      ta: 'நான்கு தாள்களைக் கொண்ட எழுத்துப் பரீட்சை மற்றும் நேர்முகப் பரීක්ෂை.'
    },
    howToApply: {
      steps: {
        en: [
          'Apply online via the Department of Examinations portal www.doenets.lk under Institutional Examinations.',
          'Pay examination fee of Rs. 1,200/- online or through postal/bank counters.',
          'Retain the generated confirmation document for admission verification.'
        ],
        si: [
          'විභාග දෙපාර්තමේන්තුවේ www.doenets.lk වෙබ් අඩවිය ඔස්සේ මාර්ගගතව අයදුම් කරන්න.'
        ],
        ta: [
          'பரீட்சைத் திணைக்களத்தின் இணையத்தளம் ஊடாக விண்ணப்பிக்கவும்.'
        ]
      },
      postalAddress: {
        en: 'Commissioner General of Examinations, Pelawatta, Battaramulla / Secretary, Ministry of Foreign Affairs, Republic Building, Colombo 01.',
        si: 'විභාග කොමසාරිස් ජනරාල්, පැලවත්ත, බත්තරමුල්ල / ලේකම්, විදේශ කටයුතු අමාත්‍යාංශය, ජනරජ ගොඩනැගිල්ල, කොළඹ 01.',
        ta: 'பரீட்சைகள் ஆணையாளர் நாயகம், பத்தரமுல்லை / செயலாளர், வெளிநாட்டு அலுவல்கள் அமைச்சு, கொழும்பு 01.'
      },
      onlinePortalUrl: 'https://www.doenets.lk',
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(04.09.2026)%20-(E)%20Press_1788868148.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'MINISTRY OF FOREIGN AFFAIRS — OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO GRADE III OF THE SRI LANKA FOREIGN SERVICE — 2026',
      preamble: 'IT is hereby notified that the Open Competitive Examination for recruitment to Grade III of the Sri Lanka Foreign Service (SLFS) will be held by the Commissioner General of Examinations.',
      bodyParagraphs: [
        '01. Number of Vacancies: Twenty-Five (25). Appointees will represent the Republic of Sri Lanka in diplomatic, consular, and trade missions abroad.',
        '02. Subjects: (i) World Affairs & Current International Relations (03 hours); (ii) English Language & Essay (03 hours); (iii) General Intelligence (01 hour); (iv) Sinhala or Tamil Language & Composition (03 hours).'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'police-asp-reserve-specialist-2026',
    slug: 'police-asp-reserve-specialist-2026',
    title: {
      en: 'Probationary Assistant Superintendent of Police (Reserve) — Specialist Engineering & IT',
      si: 'ආධුනික සහකාර පොලිස් අධිකාරී (සංචිත) — විශේෂඥ ඉංජිනේරු හා තොරතුරු තාක්ෂණ',
      ta: 'பரீட்சார்த்த உதவி பொலிஸ் அத்தியட்சகர் (சேமப்படை) — பொறியியல் மற்றும் தகவல் தொழிநுட்பம்'
    },
    institution: {
      en: 'Sri Lanka Police Department',
      si: 'ශ්‍රී ලංකා පොලිස් දෙපාර්තමේන්තුව',
      ta: 'இலங்கை பொலிஸ் திணைக்களம்'
    },
    ministry: {
      en: 'Ministry of Public Security',
      si: 'මහජන ආරක්ෂක අමාත්‍යාංශය',
      ta: 'பொது மக்கள் பாதுகாப்பு அமைச்சு'
    },
    gazetteNumber: '2,504',
    gazetteDate: '2026-08-28',
    gazettePart: 'Part I : Section (IIA) — Posts Vacant',
    gazettePage: 7,
    noticeNumber: '08-590/1',
    closingDate: '2026-09-21',
    isNew: false,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-08-28',
    salary: {
      scale: 'Rs. 47,615 – 10 × 1,335 – 8 × 1,630 – Rs. 84,070 p.m.',
      code: 'SL-1-2016',
      min: 47615,
      max: 84070,
      allowanceNote: 'Plus executive police allowances, uniform allowance, risk allowance, and transport facility.'
    },
    vacanciesCount: 18,
    qualifications: {
      level: 'Bachelors',
      summary: {
        en: 'B.Sc. Degree in Engineering (Civil / Electrical / Telecommunication / Computer Systems / Architecture) from a university recognized by the IESL and UGC.',
        si: 'ශ්‍රී ලංකා ඉංජිනේරු ආයතනය (IESL) සහ UGC පිළිගත් සිවිල්, විදුලි, විදුලිසන්දේශ, පරිගණක හෝ ගෘහනිර්මාණ ශිල්පය පිළිබඳ B.Sc. ඉංජිනේරු උපාධිය.',
        ta: 'பொறியியல் அல்லது தகவல் தொழிநுட்பத் துறையில் அங்கீகரிக்கப்பட்ட பல்கலைக்கழக இளமானிப் பட்டம்.'
      },
      requirements: {
        en: [
          'Four-year B.Sc. Engineering Degree from a recognized university in Civil, Electrical, Electronics, Telecommunication, Computer Engineering, or B.Arch in Architecture.',
          'Corporate Membership (AMIESL/MIESL/AIA) in the relevant professional engineering or architectural institution.',
          'Physical standards: Male height not less than 5 feet 6 inches; Female height not less than 5 feet 4 inches.',
          'Pass the endurance test, physical efficiency examination, and medical assessment by Government Medical Board.'
        ],
        si: [
          'සිවිල්, විදුලි, ඉලෙක්ට්‍රොනික, විදුලිසන්දේශ, පරිගණක ඉංජිනේරු හෝ වාස්තු විද්‍යාව පිළිබඳ සිව්වසර B.Sc. උපාධිය.',
          'ශාරීරික උස: පිරිමි අඩි 5 අඟල් 6 නොඅඩු; කාන්තා අඩි 5 අඟල් 4 නොඅඩු.'
        ],
        ta: [
          'பொறியியல் பட்டம் மற்றும் நியமிக்கப்பட்ட உடற்கட்டமைப்பு தகைமை.'
        ]
      }
    },
    ageLimit: {
      min: 22,
      max: 35,
      description: {
        en: 'Between 22 and 35 years as at closing date.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 22 ත් 35 ත් අතර විය යුතුය.',
        ta: 'வயது 22 முதல் 35 வரை இருத்தல் வேண்டும்.'
      }
    },
    location: 'Police Headquarters, Colombo & Field Divisions',
    field: 'ICT',
    organizationType: 'Department',
    jobType: 'Permanent',
    methodOfRecruitment: {
      en: 'Written aptitude & technical test, physical assessment, and structured interview conducted by National Police Commission.',
      si: 'ලිඛිත අභියෝග්‍යතා හා තාක්ෂණික පරීක්ෂණය, ශාරීරික යෝග්‍යතා පරීක්ෂණය සහ ජාතික පොලිස් කොමිෂන් සභාව මගින් පවත්වනු ලබන සම්මුඛ පරීක්ෂණය.',
      ta: 'எழுத்துப் பரீட்சை மற்றும் தேசிய பொலிஸ் ஆணைக்குழுவின் நேர்முகப் பரීක්ෂை.'
    },
    howToApply: {
      steps: {
        en: [
          'Prepare application as per specimen format on page 8 of Gazette No. 2,504.',
          'Address envelope to "Inspector General of Police, Police Headquarters, Colombo 01" under registered post.',
          'Attach certified photocopies of birth certificate, degree certificate, IESL membership certificate, and NIC.'
        ],
        si: [
          'ගැසට් පත්‍රයේ 8 වන පිටුවේ ආදර්ශ අයදුම්පත අනුව පොලිස්පතිතුමා වෙත ලියාපදිංචි තැපෑලෙන් යොමු කරන්න.'
        ],
        ta: [
          'பொலிஸ் மா அதிபருக்கு பதிவுத் தபாலில் விண்ணப்பத்தை அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'Inspector General of Police, Police Headquarters, Church Street, Colombo 01.',
        si: 'පොලිස්පති, පොලිස් මූලස්ථානය, චර්ච් වීදිය, කොළඹ 01.',
        ta: 'பொலிஸ் மா அதிபர், பொலிஸ் தலைமையகம், கொழும்பு 01.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'SRI LANKA POLICE — POST OF RESERVE ASSISTANT SUPERINTENDENT OF POLICE (PROBATIONARY)',
      preamble: 'APPLICATIONS are invited from citizens of Sri Lanka for recruitment to the Post of Probationary Reserve Assistant Superintendent of Police in specialist engineering cadres.',
      bodyParagraphs: [
        '01. Specialist Disciplines: (a) Information Technology Engineer; (b) Police Architect; (c) Architectural Draughtsman; (d) Electrical Engineer; (e) Civil Engineer; (f) Telecommunication Engineer.',
        '02. Training: Appointees will undergo 12 months comprehensive police officer training at Sri Lanka Police College, Kalutara.'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'management-service-officer-mso-iii-2026',
    slug: 'management-service-officer-mso-iii-2026',
    title: {
      en: 'Management Service Officers (MSO) Class III — Open Competitive Examination',
      si: 'කළමනාකරණ සේවා නිලධාරී (MSO) III පන්තිය — විවෘත තරග විභාගය',
      ta: 'முகாமைத்துவ சேவை உத்தியோகத்தர் (MSO) தரம் III — திறந்த போட்டிப் பரீட்சை'
    },
    institution: {
      en: 'Combined Services Department',
      si: 'සංයුක්ත සේවා දෙපාර්තමේන්තුව',
      ta: 'இணைந்த சேவைகள் திணைக்களம்'
    },
    ministry: {
      en: 'Ministry of Public Administration, Provincial Councils and Local Government',
      si: 'රාජ්‍ය පරිපාලන, පළාත් සභා හා පළාත් පාලන අමාත්‍යාංශය',
      ta: 'பொது நிர்வாக, மாகாண சபைகள் மற்றும் உள்ளூராட்சி அமைச்சு'
    },
    gazetteNumber: '2,504',
    gazetteDate: '2026-08-28',
    gazettePart: 'Part I : Section (IIA) — Examinations',
    gazettePage: 11,
    noticeNumber: '08-592/1',
    closingDate: '2026-09-21',
    isNew: false,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-08-28',
    salary: {
      scale: 'Rs. 31,490 – 10 × 445 – 11 × 525 – 10 × 595 – Rs. 67,610 p.m.',
      code: 'MN-2-2016',
      min: 31490,
      max: 67610,
      allowanceNote: 'Plus cost of living allowance and public sector non-pensionable allowances.'
    },
    vacanciesCount: 160,
    qualifications: {
      level: 'AL',
      summary: {
        en: 'Passed in 3 subjects at the G.C.E. (A/L) Examination in one sitting AND passed G.C.E. (O/L) in 6 subjects with credit passes in Sinhala/Tamil, English and Mathematics.',
        si: 'එක් වරකදී අ.පො.ස. (උ/පෙළ) විෂයයන් තුනකින් සමත්වීම සහ සිංහල/දෙමළ, ඉංග්‍රීසි හා ගණිතය ඇතුළුව අ.පො.ස. (සා/පෙළ) සම්මාන 04ක් සහිතව විෂයයන් 06 කින් සමත්වීම.',
        ta: 'ஒரே அமர்வில் க.பொ.த. (உ/த) மூன்று பாடங்களில் சித்தியடைந்ததுடன், க.பொ.த. (சா/த) தகைமை.'
      },
      requirements: {
        en: [
          'Pass in three (03) subjects at the G.C.E. (Advanced Level) Examination in one sitting.',
          'Pass in six (06) subjects at the G.C.E. (Ordinary Level) Examination with Credit passes in Mother Tongue (Sinhala/Tamil), English Language, and Mathematics.',
          'Computer literacy (office productivity tools) will be an asset.'
        ],
        si: [
          'අ.පො.ස. (උසස් පෙළ) විභාගයේදී එක් වරකදී විෂයයන් 03 කින් සමත්වීම.',
          'අ.පො.ස. (සාමාන්‍ය පෙළ) විභාගයේදී මව්බස, ඉංග්‍රීසි හා ගණිතය ඇතුළුව සම්මාන සාමාර්ථ සහිතව විෂයයන් 06 කින් සමත්වීම.'
        ],
        ta: [
          'க.பொ.த. (உ/த) மற்றும் (சா/த) பரீட்சைகளில் உரிய முறையில் சித்தியடைந்திருத்தல்.'
        ]
      }
    },
    ageLimit: {
      min: 18,
      max: 30,
      description: {
        en: 'Not less than 18 years and not more than 30 years as at closing date.',
        si: 'අයදුම්පත් භාරගන්නා අවසන් දිනට වයස අවුරුදු 18 ට නොඅඩු හා 30 ට නොවැඩි විය යුතුය.',
        ta: 'வயது 18 முதல் 30 வரை.'
      }
    },
    location: 'Ministries, Departments & District Secretariats Islandwide',
    field: 'Management',
    organizationType: 'Ministry',
    jobType: 'Open Competitive Exam',
    methodOfRecruitment: {
      en: 'Competitive Written Examination conducted by Department of Examinations: Paper 01 - Language Proficiency (100 marks); Paper 02 - Aptitude & General Knowledge (100 marks).',
      si: 'ශ්‍රී ලංකා විභාග දෙපාර්තමේන්තුව පවත්වන ලිඛිත තරග විභාගය: ප්‍රශ්න පත්‍රය 01 - භාෂා ප්‍රවීණතාවය; ප්‍රශ්න පත්‍රය 02 - අභියෝග්‍යතාවය.',
      ta: 'பரீட்சைத் திணைக்களம் நடாத்தும் எழுத்துப் பரீட்சை.'
    },
    howToApply: {
      steps: {
        en: [
          'Submit applications online via www.doenets.lk under Public Examinations.',
          'Pay examination fee of Rs. 600/- online or through Post Office / Bank of Ceylon.',
          'Follow instructions issued in Gazette No. 2,504, pages 11-17.'
        ],
        si: [
          'විභාග දෙපාර්තමේන්තුවේ www.doenets.lk වෙබ් අඩවිය ඔස්සේ මාර්ගගතව අයදුම් කරන්න.'
        ],
        ta: [
          'இணையத்தளம் மூலம் விண்ணப்பிக்கவும்.'
        ]
      },
      postalAddress: {
        en: 'Commissioner General of Examinations, Pelawatta, Battaramulla.',
        si: 'විභාග කොමසාරිස් ජනරාල්, පැලවත්ත, බත්තරමුල්ල.',
        ta: 'பரீட்சைகள் ஆணையாளர் நாயகம், பத்தரமுல்லை.'
      },
      onlinePortalUrl: 'https://www.doenets.lk',
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'MINISTRY OF PUBLIC ADMINISTRATION — OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO CLASS III OF THE MANAGEMENT SERVICE',
      preamble: 'IT is hereby notified that the Open Competitive Examination for Recruitment to Posts in Class III of the Sri Lanka Management Service will be held islandwide.',
      bodyParagraphs: [
        '01. Cadre to be filled: 160 vacancies in central ministries, departments, and provincial administrations.',
        '02. Examination centers established in Colombo, Kandy, Galle, Matara, Jaffna, Anuradhapura, Badulla, Kurunegala, and Ratnapura.'
      ]
    },
    verifiedStatus: 'verified'
  },
  {
    id: 'railway-security-service-2026',
    slug: 'railway-security-service-2026',
    title: {
      en: 'Railway Security Officer (Male / Female) — Open Competitive Examination',
      si: 'දුම්රිය ආරක්ෂක නිලධාරී (පිරිමි / කාන්තා) — විවෘත තරග විභාගය',
      ta: 'புகையிரத பாதுகாப்பு உத்தியோகத்தர் (ஆண் / பெண்) — திறந்த போட்டிப் பரீட்சை'
    },
    institution: {
      en: 'Department of Sri Lanka Railways',
      si: 'ශ්‍රී ලංකා දුම්රිය දෙපාර්තමේන්තුව',
      ta: 'இலங்கை புகையிரதத் திணைக்களம்'
    },
    ministry: {
      en: 'Ministry of Transport and Highways',
      si: 'ප්‍රවාහන සහ මහාමාර්ග අමාත්‍යාංශය',
      ta: 'போக்குவரத்து மற்றும் நெடுஞ்சாலைகள் அமைச்சு'
    },
    gazetteNumber: '2,504',
    gazetteDate: '2026-08-28',
    gazettePart: 'Part I : Section (IIA) — Posts Vacant',
    gazettePage: 29,
    noticeNumber: '08-595/1',
    closingDate: '2026-09-21',
    isNew: false,
    isRealGovernmentData: true,
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-08-28',
    salary: {
      scale: 'Rs. 29,540 – 10 × 300 – 11 × 350 – 10 × 495 – Rs. 51,340 p.m.',
      code: 'PL-3-2016',
      min: 29540,
      max: 51340,
      allowanceNote: 'Plus railway security risk allowance, night duty allowance, and railway free pass.'
    },
    vacanciesCount: 45,
    qualifications: {
      level: 'OL',
      summary: {
        en: 'Passed G.C.E. (Ordinary Level) examination in six subjects with at least two credit passes including Sinhala or Tamil.',
        si: 'අ.පො.ස. (සාමාන්‍ය පෙළ) විභාගයේදී සිංහල හෝ දෙමළ භාෂාව ඇතුළුව සම්මාන 02 ක් සහිතව විෂයයන් 06 කින් සමත්වීම.',
        ta: 'க.பொ.த. (சா/த) பரீட்சையில் சிங்களம் அல்லது தமிழ் உட்பட 6 பாடங்களில் சித்தி.'
      },
      requirements: {
        en: [
          'Pass in six (06) subjects at the G.C.E. (O/L) examination with at least two credit passes in not more than two sittings.',
          'Physical measurement: Male height not less than 5 feet 5 inches (chest 32 inches); Female height not less than 5 feet 2 inches.',
          'Physical fitness examination: 1000m running, sprint, and physical agility test.'
        ],
        si: [
          'අ.පො.ස. (සාමාන්‍ය පෙළ) විභාගයෙන් විෂයයන් 06 කින් සමත්වීම (වාර දෙකකට නොවැඩිව).',
          'පිරිමි උස අඩි 5 අඟල් 5 නොඅඩු විය යුතුය; කාන්තා උස අඩි 5 අඟල් 2 නොඅඩු විය යුතුය.'
        ],
        ta: [
          'க.பொ.த. (சா/த) சித்தி மற்றும் உடற்றகுதி பரீட்சை.'
        ]
      }
    },
    ageLimit: {
      min: 18,
      max: 28,
      description: {
        en: 'Not less than 18 years and not more than 28 years as on 21.09.2026.',
        si: '2026.09.21 දිනට වයස අවුරුදු 18 ට නොඅඩු හා 28 ට නොවැඩි විය යුතුය.',
        ta: 'வயது 18 முதல் 28 வரை.'
      }
    },
    location: 'Railway Stations Islandwide (Colombo, Nawalapitiya, Anuradhapura)',
    field: 'Other',
    organizationType: 'Department',
    jobType: 'Open Competitive Exam',
    methodOfRecruitment: {
      en: 'Written test (Aptitude & General Knowledge), physical efficiency test, and structured interview.',
      si: 'ලිඛිත පරීක්ෂණය, ශාරීරික යෝග්‍යතා පරීක්ෂණය සහ සම්මුඛ පරීක්ෂණය.',
      ta: 'எழுத்துப் பரீட்சை மற்றும் உடற்றகுதி பரிசோதனை.'
    },
    howToApply: {
      steps: {
        en: [
          'Prepare application as per specimen format on page 31 of Gazette No. 2,504.',
          'Send under registered post to "General Manager of Railways, Railway Headquarters, P.O. Box 355, Colombo 10".'
        ],
        si: [
          'ගැසට් පත්‍රයේ 31 වන පිටුවේ ආදර්ශ අයදුම්පත අනුව දුම්රිය සාමාන්‍යාධිකාරී වෙත ලියාපදිංචි තැපෑලෙන් යොමු කරන්න.'
        ],
        ta: [
          'புகையிரத பொது முகாமையாளருக்கு பதிவுத் தபாலில் அனுப்பவும்.'
        ]
      },
      postalAddress: {
        en: 'General Manager of Railways, Railway Headquarters, Olcott Mawatha, Colombo 10.',
        si: 'දුම්රිය සාමාන්‍යාධිකාරී, දුම්රිය මූලස්ථානය, ඕල්කට් මාවත, කොළඹ 10.',
        ta: 'புகையிரத பொது முகாமையாளர், புகையிரத தலைமையகம், ஒல்கொட் மாவத்தை, கொழும்பு 10.'
      },
      formDownloadUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf'
    },
    gazetteTextSnippet: {
      titleHeading: 'DEPARTMENT OF SRI LANKA RAILWAYS — OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO RAILWAY SECURITY SERVICE',
      preamble: 'APPLICATIONS are invited from citizens of Sri Lanka for recruitment to forty-five (45) vacancies in the post of Railway Security Officer.',
      bodyParagraphs: [
        '01. Duties: Protection of railway infrastructure, train security, anti-trespassing enforcement, and passenger safety on rail network.',
        '02. Closing Date: 21 September 2026. Specimen application published on Page 31.'
      ]
    },
    verifiedStatus: 'verified'
  }
];

export const SAMPLE_GAZETTE_PAGES = [
  {
    pageNumber: 1,
    sectionHeader: 'PART I : SEC. (IIA) — GAZETTE OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA — 11.09.2026',
    title: 'THE GAZETTE OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA',
    subHeader: 'PART I : SECTION (IIA) — ADVERTISING\n(Separate paging is given to each language of every Part in order that it may be filed separately)\nNo. 2,506 — FRIDAY, SEPTEMBER 11, 2026',
    columns: [
      `IMPORTANT NOTICE REGARDING ACCEPTANCE OF NOTICES FOR PUBLICATION IN THE WEEKLY "GAZETTE"\n\nATTENTION is drawn to the Notification appearing in the 1st week of every month, regarding the latest dates and times of acceptance of Notices for publication in the weekly Gazettes, at the end of every weekly Gazette of Democratic Socialist Republic of Sri Lanka.\n\nAll notices to be published in the weekly Gazettes shall close at 12.00 noon of each Friday, two weeks before the date of publication.\n\nAll Government Departments, Corporations, Boards, etc. are hereby advised that Notifications fixing closing dates and times of applications in respect of Post-Vacancies, Examinations, Tender Notices and dates and times of Auction Sales, etc. should be prepared by giving adequate time both from the date of despatch of notices to Govt. Press and from the date of publication.\n\nPrasanna Jayaratne,\nGovernment Printer.\nDepartment of Govt. Printing, Colombo 08.\nThis Gazette can be downloaded from www.documents.gov.lk`,
      `GENERAL QUALIFICATIONS REQUIRED FOR RECRUITMENT\n\n1. General Qualifications required:\n1:1 Every applicant must furnish satisfactory proof that he/she is a citizen of Sri Lanka by descent or by registration as defined in the Sri Lanka Citizenship Act.\n\n1:2 A candidate for any post for which the minimum educational qualification prescribed is a pass in the Senior School Certificate Examination or G.C.E. (O/L) must have obtained credit passes in the subjects required.\n\n2. Appointment: All appointments are subject to the provisions of the Establishments Code, Public Service Commission Rules, and Departmental schemes of recruitment.\n\n3. Probation: Unless otherwise specified in the notice, all initial appointments to permanent posts in public service will be on probation for a period of three (3) years.\n\n4. Language Proficiency: Appointees will be required to acquire official language proficiency in the second national language within 5 years as per Public Administration Circulars.`
    ]
  },
  {
    pageNumber: 4,
    sectionHeader: 'PART I : SEC. (IIA) — GAZETTE OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA — 11.09.2026',
    title: 'MERCHANT SHIPPING SECRETARIAT — POST OF PORT STATE CONTROLLER (ENGINEERING)',
    subHeader: 'MINISTRY OF PORTS AND CIVIL AVIATION\nNotice No. 09-640/1',
    columns: [
      `APPLICATIONS FOR RECRUITMENT TO THE POST OF PORT STATE CONTROLLER (ENGINEERING) / MARINE SURVEYOR\n\nAPPLICATIONS are invited from citizens of Sri Lanka who possess the qualifications mentioned below to fill six (06) vacancies in the post of Port State Controller (Engineering) / Surveyor in the Merchant Shipping Secretariat under the Ministry of Ports and Civil Aviation.\n\n1. Salary Scale:\nSalary Code SL-1-2016: Rs. 47,615 - 10x1,120 - 10x1,335 - 8x1,630 - Rs. 84,070 p.m. Plus standard maritime and government approved allowances.\n\n2. Educational & Professional Qualifications:\n(i) Certificate of Competency as Chief Engineer Officer (STCW 95 Reg. III/2 - Unlimited) issued by Director General of Merchant Shipping; OR\n(ii) B.Sc. Degree in Marine Engineering from a UGC recognized university with 03 years sea service on ocean vessels over 3,000 kW.\n\n3. Age Limit:\nNot less than 25 years and not more than 45 years as on the closing date.\n\nClosing Date: 25.09.2026.`,
      `SPECIMEN APPLICATION FORM (PORT STATE CONTROLLER)\n\n1. Full Name: ___________________________________\n2. National Identity Card No.: ____________________\n3. Permanent Address: ___________________________\n4. Date of Birth: YYYY ____ MM ____ DD ____\n5. Continuous Discharge Certificate (CDC) No.: _________\n6. Certificate of Competency (COC) Grade & No.: _______\n7. Maritime Sea Service Record:\n   Ship Name | Gross Tonnage | Power (kW) | Rank | Period\n8. Academic Qualifications:\n   Degree / Diploma | Institute | Year | Class\n\nI hereby declare that the particulars given above are true and accurate to the best of my knowledge.\n\nDate: ___________ Signature of Applicant: _________\n\nAddress to send:\nSecretary, Ministry of Ports and Civil Aviation,\nNo. 19, Chaithya Road, Colombo 01.`
    ]
  },
  {
    pageNumber: 72,
    sectionHeader: 'PART I : SEC. (IIA) — GAZETTE OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA — 11.09.2026',
    title: 'DEPARTMENT OF SRI LANKA CUSTOMS — INSPECTOR OF CUSTOMS, GRADE II',
    subHeader: 'MINISTRY OF FINANCE, PLANNING AND ECONOMIC DEVELOPMENT\nNotice No. 09-648/1',
    columns: [
      `OPEN COMPETITIVE EXAMINATION FOR RECRUITMENT TO THE POSTS OF INSPECTOR OF CUSTOMS, GRADE II\n\n1. APPLICATIONS are invited from citizens of Sri Lanka for the Open Competitive Examination for recruitment to eighty-five (85) vacancies in the posts of Inspector of Customs, Grade II of the Department of Sri Lanka Customs.\n\n2. Examination Centers:\nThe examination will be held by the Commissioner General of Examinations in December 2026 at centers in Colombo, Kandy, Galle, Jaffna, Anuradhapura, and Badulla.\n\n3. Salary Scale:\nSalary Code MN-4-2016: Rs. 31,490 - 10x445 - 11x525 - 10x595 - Rs. 67,610 p.m. Plus cost of living allowance and customs rewards.\n\n4. Educational Qualifications:\n(a) Pass in 03 subjects at the G.C.E. (Advanced Level) in one sitting; AND\n(b) Pass in 06 subjects at G.C.E. (Ordinary Level) with credit passes in Sinhala/Tamil, English, and Mathematics in one sitting.\n\n5. Physical Qualifications:\nMale height not less than 5 feet 5 inches (chest 33 inches);\nFemale height not less than 5 feet 3 inches.\n\n6. Age Limit: 21 to 28 years on 02.10.2026.`,
      `EXAMINATION SUBJECTS & APPLICATION PROCEDURE\n\n1. Written Examination comprises:\nPaper 01: Aptitude (01 hour, 100 marks) — Evaluates mathematical reasoning, analytical skills, and comprehension.\nPaper 02: English Language Proficiency & General Knowledge of Customs Operations (02 hours, 100 marks).\n\nCut-off mark to qualify for structured interview is 60% aggregate.\n\n2. Online Application Instructions:\n(i) Candidates must submit their applications online through the Department of Examinations website (www.doenets.lk).\n(ii) Examination fee is Rs. 600/-, payable electronically or at any Bank of Ceylon branch.\n(iii) Printed confirmation sheet must be preserved for admission card verification.\n\nClosing Date for Applications:\n12:00 Midnight on 02nd October 2026.\n\nBy Order,\nDirector General of Customs / Commissioner General of Examinations.`
    ]
  }
];

export const POPULAR_SEARCH_SUGGESTIONS = [
  'Customs Inspector',
  'Merchant Shipping',
  'National Museums',
  'Foreign Service (SLFS)',
  'Police ASP',
  'Management Service (MSO)',
  'Electro-Medical Technician',
  'Railway Security',
  'Open Competitive Exam',
  'Legal Officer',
  'Ports and Civil Aviation'
];

export const ARCHIVED_GAZETTES: GazetteEdition[] = [
  {
    id: 'gazette-2506',
    gazetteNumber: '2,506',
    date: '2026-09-11',
    formattedDate: 'Friday, 11 September 2026',
    part: 'Part I : Section (IIA) — Advertising (Posts — Vacant & Examinations)',
    totalVacancies: 215,
    totalExams: 6,
    pagesCount: 79,
    pdfFileName: 'I-II(A) - (E) (11.09.2026) - PRESS.pdf',
    sourceNote: 'Department of Government Printing, Colombo 08 (documents.gov.lk).',
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(E)%20(11.09.2026)%20-%20PRESS_1789552712.pdf',
    originalSinhalaPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2F2026.09.11%20Part%20I-II%20A%20(S)%20tem._1789450441.pdf',
    originalTamilPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II%20A%20(T)%2011.09.2026%20PRESS_1789365794.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-11',
    isRealGovernmentData: true
  },
  {
    id: 'gazette-2505',
    gazetteNumber: '2,505',
    date: '2026-09-04',
    formattedDate: 'Friday, 04 September 2026',
    part: 'Part I : Section (IIA) — Advertising (Posts — Vacant)',
    totalVacancies: 142,
    totalExams: 4,
    pagesCount: 29,
    pdfFileName: 'I-II(A) - (04.09.2026) -(E) Press.pdf',
    sourceNote: 'Department of Government Printing, Colombo 08 (documents.gov.lk).',
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(04.09.2026)%20-(E)%20Press_1788868148.pdf',
    originalSinhalaPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2F2026.09.04%20Part%20I-II%20A%20(S)%20tem._1788856703.pdf',
    originalTamilPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II%20A%20(T)%2004.09.2026%20tem._1789115076.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-09-04',
    isRealGovernmentData: true
  },
  {
    id: 'gazette-2504',
    gazetteNumber: '2,504',
    date: '2026-08-28',
    formattedDate: 'Friday, 28 August 2026',
    part: 'Part I : Section (IIA) — Advertising (Posts — Vacant)',
    totalVacancies: 188,
    totalExams: 5,
    pagesCount: 63,
    pdfFileName: 'I-II(A) - (28.08.2026) - (E) Press.pdf',
    sourceNote: 'Department of Government Printing, Colombo 08 (documents.gov.lk).',
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(28.08.2026)%20-%20(E)%20Press_1788868169.pdf',
    originalSinhalaPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2F2026.08.28%20Part%20I-II%20A%20(S)%20press_1789115025.pdf',
    originalTamilPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II%20A%20(T)%2028.08.2026%20%20PRESS_1789039294.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-08-28',
    isRealGovernmentData: true
  },
  {
    id: 'gazette-2503',
    gazetteNumber: '2,503',
    date: '2026-08-21',
    formattedDate: 'Friday, 21 August 2026',
    part: 'Part I : Section (IIA) — Advertising (Posts — Vacant)',
    totalVacancies: 95,
    totalExams: 2,
    pagesCount: 38,
    pdfFileName: 'I-II(A) - (21.08.2026) (E) press.pdf',
    sourceNote: 'Department of Government Printing, Colombo 08 (documents.gov.lk).',
    originalPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II(A)%20-%20(21.08.2026)%20(E)%20press_1788435661.pdf',
    originalSinhalaPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2F2026.08.21%20Part%20I-II%20A%20(S)%20press_1788349819.pdf',
    originalTamilPdfUrl: '/api/gazette-pdf-proxy?file=gazette-content%2FI-II%20A%20(T)%2021.08.2026%20PRESS_1788605806.pdf',
    officialGovLkUrl: 'https://documents.gov.lk/web/Gazette?date=2026-08-21',
    isRealGovernmentData: true
  }
];
