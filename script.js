const chatMessages = document.querySelector("#chat-messages");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatSendBtn = document.querySelector("#chat-send");
const quizWeakBtn = document.querySelector("#quiz-weak-btn");
const studyPlanBtn = document.querySelector("#study-plan-btn");
const explainBtn = document.querySelector("#explain-btn");
const clearChatBtn = document.querySelector("#clear-chat-btn");
const sampleDataBtn = document.querySelector("#sample-data-btn");
const clearFormBtn = document.querySelector("#clear-form-btn");

const statsOverview = document.querySelector("#stats-overview");
const statAverage = document.querySelector("#stat-average");
const statCount = document.querySelector("#stat-count");
const statWeakest = document.querySelector("#stat-weakest");

const gradeForm = document.querySelector("#grade-form");
const gradeRows = document.querySelector("#grade-rows");
const gradeChartCanvas = document.querySelector("#grade-chart-canvas");
const chartEmpty = document.querySelector("#chart-empty");
let gradeChart;
let nextGradeRowId = 3;

let currentWeakestTopics = [];
let currentAllGrades = [];
const chatHistory = [];
let isGenerating = false;

// -------------------------------------------------------------
// Multilingual Translation Dictionary (EN, AR, CKB Sorani Kurdish)
// -------------------------------------------------------------
const I18N = {
  en: {
    appTitle: "Academic Performances Tracker",
    navHome: "Home",
    navFocus: "Study Focus",
    navGrades: "Grades",
    navAbout: "About",
    navPlans: "Plans",
    upgradePlan: "Upgrade Plan",
    managePlan: "Manage Plan",
    freeScholar: "Free Scholar",
    proScholar: "Pro Scholar",
    honorsScholar: "Academic Honors",
    honorsActive: "Honors Active",
    currentPlan: "Current Plan",
    guideEyebrow: "GUIDE",
    guideTitle: "Study with intention",
    guideText: "Log your current scores in the grade tracker below. Seeing everything at a glance makes it easy to focus your revision where it counts the most.",
    average: "Average",
    subjects: "Subjects",
    priorityReview: "Priority Review",
    tipTitle: "A quick note on active recall",
    tipText: "Testing yourself on difficult ideas locks information into long-term memory far better than re-reading notes. Use the practice quiz feature on the right whenever you want a quick review.",
    assistantEyebrow: "STUDY ASSISTANT",
    assistantTitle: "Study focus",
    clearChat: "Clear",
    welcomeMessage: "Hi! Enter your subjects and grades below, then click <strong>Create chart</strong>. Your two lowest scores will appear here, and you can ask for practice questions, explanations, or study tips anytime.",
    chatCleared: "Chat cleared. Ask me any question, request a quiz on your subjects, or generate your study plan!",
    inputPlaceholder: "Ask a question or request a practice quiz...",
    send: "Send",
    practiceQuiz: "Practice quiz",
    studySchedule: "Study schedule",
    revisionTips: "Revision tips",
    listening: "Listening... Speak into your microphone",
    done: "Done",
    progressEyebrow: "PROGRESS TRACKER",
    progressTitle: "Your grades, at a glance",
    progressIntro: "Add your scores to see which topics could use more study time.",
    chartNameLabel: "Chart name",
    chartTitleLabel: "Chart title",
    axisHorizLabel: "Horizontal axis",
    axisVertLabel: "Vertical axis",
    topicGradesLabel: "Topic grades",
    score100Label: "Score / 100",
    defaultChartName: "My study progress",
    defaultChartTitle: "Grades by topic",
    defaultAxisHoriz: "Topic",
    defaultAxisVert: "Grade (%)",
    topicPlaceholder: "e.g. Algebra",
    addTopic: "+ Add topic",
    sampleData: "Sample data",
    reset: "Reset",
    createChart: "Create chart",
    chartEmptyMsg: "Enter at least two topics and grades to create a chart.",
    topicsUnit: "topics",
    aboutEyebrow: "ABOUT THE PLATFORM",
    aboutTitle: "Designed for evidence-based mastery",
    aboutIntro: "The Academic Performances Tracker bridges the gap between raw exam scores and actionable daily study habits. Built on verified cognitive learning principles, it turns score gaps into targeted practice.",
    aboutCard1Num: "01. DIAGNOSTIC MAPPING",
    aboutCard1Title: "Automatic Deficit Detection",
    aboutCard1Text: "Students often spend revision hours on topics they already know well. Our algorithm computes running score averages, isolates your two lowest subjects, and highlights them for targeted review.",
    aboutCard2Num: "02. ACTIVE RECALL",
    aboutCard2Title: "Retrieval Over Passive Reading",
    aboutCard2Text: "Empirical cognitive science proves that self-testing yields 50% better long-term retention than re-reading notes. The assistant instantly generates rapid conceptual questions tailored to your scores.",
    aboutCard3Num: "03. INTELLIGENT COACHING",
    aboutCard3Title: "Context-Grounded Feedback",
    aboutCard3Text: "Powered by server-side Gemini 3.8 Flash, the coach references your actual course scores to offer 7-day study timetables, voice-to-text dictation, and breakdown of difficult concepts.",
    aboutCalloutTitle: "Need personalized examination schedules or unlimited voice drills?",
    aboutCalloutText: "Explore our flexible scholar memberships below to unlock continuous quizzes and structured study roadmaps.",
    viewMemberships: "View Memberships",
    pricingEyebrow: "MEMBERSHIP & ACCESS",
    pricingTitle: "Study without limits",
    pricingIntro: "Choose the level of coaching and study analytics that fits your academic goals.",
    monthly: "Monthly",
    annual: "Annual",
    save20: "Save 20%",
    freeDesc: "Essential grade tracking, basic bar charts, and entry-level study guidance.",
    proDesc: "Comprehensive revision schedules, unlimited practice quizzes, and in-depth weak spot breakdowns.",
    honorsDesc: "For high achievers aiming for top percentiles with dedicated multi-term analytics.",
    mostPopular: "Most Popular",
    forever: "/ forever",
    perMonth: "/ month",
    perYearPro: "/ year ($6.33/mo)",
    perYearHonors: "/ year ($14/mo)",
    upgradeToPro: "Upgrade to Pro",
    getHonors: "Get Honors",
    switchToPro: "Switch to Pro",
    downgradeFree: "Downgrade to Free",
    modalUpgradeTitle: "Upgrade Your Membership",
    modalSummaryPlan: "Selected Plan:",
    modalSummaryInterval: "Billing Interval:",
    modalSummaryPrice: "Price:",
    modalCancel: "Cancel",
    modalConfirm: "Confirm Subscription",
    modalConfirmDowngrade: "Confirm Downgrade",
    modalActivationNote: "Instant activation. Access to unlimited practice quizzes and advanced study plans unlocks immediately.",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    promptQuiz: "Please start a practice quiz on my weakest topics ({topics}). Give me 2 targeted questions to test my understanding.",
    promptSchedule: "Create a structured 7-day study schedule and revision strategy to help me improve my grades in: {topics}.",
    promptTips: "What are the most effective evidence-based study techniques (such as active recall, Feynman technique, and spaced repetition), and how can I apply them?",
    focusMsg: "Your two lowest grades are <strong>{topics}</strong>. Giving these topics a little extra attention will make a noticeable difference.",
    practiceBtnMsg: "Practice quiz on these topics",
    copyPromptMsg: "Copy prompt",
  },
  ar: {
    appTitle: "متتبع الأداء الأكاديمي",
    navHome: "الرئيسية",
    navFocus: "التركيز الدراسي",
    navGrades: "الدرجات",
    navAbout: "حول المنصة",
    navPlans: "الباقات",
    upgradePlan: "ترقية الباقة",
    managePlan: "إدارة الباقة",
    freeScholar: "الباحث المجاني",
    proScholar: "الباحث المتقدم",
    honorsScholar: "مرتبة الشرف",
    honorsActive: "شرف أكاديمي نشط",
    currentPlan: "الباقة الحالية",
    guideEyebrow: "دليل إرشادي",
    guideTitle: "ادرس بوعي وتركيز",
    guideText: "سجّل درجاتك الحالية في متتبع الدرجات أدناه. رؤية كل شيء بنظرة واحدة يسهل عليك توجيه مراجعتك نحو المواد الأكثر حاجة.",
    average: "المعدل",
    subjects: "المواد",
    priorityReview: "مراجعة ذات أولوية",
    tipTitle: "ملاحظة حول الاسترجاع النشط",
    tipText: "اختبار نفسك في المفاهيم الصعبة يرسخ المعلومات في الذاكرة طويلة المدى أفضل بكثير من مجرد إعادة قراءة الملاحظات. استخدم ميزة الاختبار التدريبي على اليسار للمراجعة السريعة.",
    assistantEyebrow: "المساعد الدراسي",
    assistantTitle: "مركز المذاكرة",
    clearChat: "مسح المحادثة",
    welcomeMessage: "مرحباً بك! أدخل موادك ودرجاتك أدناه ثم اضغط <strong>إنشاء المخطط</strong>. ستظهر أدنى درجتين هنا، ويمكنك طلب اختبارات تدريبية أو شروحات دراسية في أي وقت.",
    chatCleared: "تم مسح المحادثة. اطرح أي سؤال، أو اطلب اختباراً تدريبياً لموادك، أو أنشئ جدولاً دراسياً!",
    inputPlaceholder: "اطرح سؤالاً أو اطلب اختباراً تدريبياً...",
    send: "إرسال",
    practiceQuiz: "اختبار تدريبي",
    studySchedule: "جدول دراسي",
    revisionTips: "نصائح المراجعة",
    listening: "جاري الاستماع... تحدث بوضوح في الميكروفون",
    done: "تم",
    progressEyebrow: "متتبع التقدم",
    progressTitle: "درجاتك في لمحة سريعة",
    progressIntro: "أضف درجاتك لترى أي المواد تحتاج إلى مزيد من وقت الدراسة.",
    chartNameLabel: "اسم المخطط",
    chartTitleLabel: "عنوان المخطط",
    axisHorizLabel: "المحور الأفقي",
    axisVertLabel: "المحور الرأسي",
    topicGradesLabel: "درجات المواد",
    score100Label: "الدرجة / 100",
    defaultChartName: "تقدمي الدراسي",
    defaultChartTitle: "الدرجات حسب المادة",
    defaultAxisHoriz: "المادة",
    defaultAxisVert: "الدرجة (%)",
    topicPlaceholder: "مثال: الجبر",
    addTopic: "+ إضافة مادة",
    sampleData: "بيانات تجريبية",
    reset: "إعادة ضبط",
    createChart: "إنشاء المخطط",
    chartEmptyMsg: "أدخل مادتين ودرجتين على الأقل لإنشاء المخطط.",
    topicsUnit: "مواد",
    aboutEyebrow: "عن المنصة",
    aboutTitle: "مُصممة للإتقان القائم على الأدلة",
    aboutIntro: "يربط متتبع الأداء الأكاديمي بين درجات الامتحانات وعادات الدراسة اليومية الفعالة. مبني على مبادئ التعلم المعرفي الموثوقة لتحويل فجوات الدرجات إلى تدريب مركز.",
    aboutCard1Num: "01. التقييم التشخيصي",
    aboutCard1Title: "الكشف التلقائي عن الفجوات",
    aboutCard1Text: "يقضي الطلاب ساعات في مراجعة مواد يتقنونها بالفعل. تحسب خوارزميتنا متوسط الدرجات وتعزل أدنى مادتين لديك لتسليط الضوء عليهما للمراجعة المركزة.",
    aboutCard2Num: "02. الاسترجاع النشط",
    aboutCard2Title: "التذكر أفضل من القراءة السلبية",
    aboutCard2Text: "تثبت الأبحاث المعرفية أن الاختبار الذاتي يحقق استبقاءً للمعلومات أفضل بنسبة 50٪ من مجرد القراءة. يولد المساعد أسئلة مفاهيمية سريعة ومخصصة لدرجاتك فوراً.",
    aboutCard3Num: "03. التوجيه الذكي",
    aboutCard3Title: "توجيه مبني على سياق درجاتك",
    aboutCard3Text: "مدعوماً بنموذج Gemini 3.8 Flash، يستند الموجه إلى درجاتك الفعلية ليقدم جداول دراسية لأسبوع كامل، وإملاء صوتي، وتفكيكاً للمفاهيم الصعبة.",
    aboutCalloutTitle: "هل تحتاج إلى جداول امتحانية مخصصة أو تدريبات صوتية غير محدودة؟",
    aboutCalloutText: "استكشف باقات العضوية أدناه لفتح اختبارات مستمرة وخرائط طريق دراسية منظمة.",
    viewMemberships: "عرض الباقات",
    pricingEyebrow: "العضوية والاشتراك",
    pricingTitle: "تعلم بلا حدود",
    pricingIntro: "اختر مستوى التوجيه والتحليلات الدراسية الذي يناسب أهدافك الأكاديمية.",
    monthly: "شهرياً",
    annual: "سنوياً",
    save20: "وفر 20%",
    freeDesc: "تتبع الدرجات الأساسي، مخططات بيانية بسيطة، وإرشادات دراسية أولية.",
    proDesc: "جداول مراجعة شاملة، اختبارات غير محدودة، وتحليل عميق لنقاط الضعف.",
    honorsDesc: "للمتفوقين الساعين للمراتب الأولى مع تحليلات تراكمية مخصصة.",
    mostPopular: "الأكثر طلباً",
    forever: "/ دائماً",
    perMonth: "/ شهرياً",
    perYearPro: "/ سنوياً ($6.33/شهر)",
    perYearHonors: "/ سنوياً ($14/شهر)",
    upgradeToPro: "ترقية إلى المتقدم",
    getHonors: "اشتراك الشرف الأكاديمي",
    switchToPro: "التحويل إلى المتقدم",
    downgradeFree: "التحويل للباقة المجانية",
    modalUpgradeTitle: "ترقية عضويتك",
    modalSummaryPlan: "الباقة المختارة:",
    modalSummaryInterval: "دورة الدفع:",
    modalSummaryPrice: "السعر:",
    modalCancel: "إلغاء",
    modalConfirm: "تأكيد الاشتراك",
    modalConfirmDowngrade: "تأكيد التخفيض",
    modalActivationNote: "تفعيل فوري. يتم تفعيل الاختبارات غير المحدودة والخطط المتقدمة مباشرة.",
    copyBtn: "نسخ",
    copiedBtn: "تم النسخ!",
    promptQuiz: "يرجى بدء اختبار تدريبي على موادي الأضعف ({topics}). اطرح عليّ سؤالين مركزين لاختبار فهمي.",
    promptSchedule: "أنشئ جدولاً دراسياً منظماً لمدة 7 أيام واستراتيجية مراجعة لمساعدتي في تحسين درجاتي في: {topics}.",
    promptTips: "ما هي أكثر تقنيات الدراسة الفعالة القائمة على الأدلة العلمية (مثل الاسترجاع النشط، وتقنية فاينمان، والتكرار المتباعد)، وكيف يمكنني تطبيقها؟",
    focusMsg: "أدنى درجتين لديك هما <strong>{topics}</strong>. منح هاتين المادتين مزيداً من الاهتمام سيحدث فرقاً ملحوظاً.",
    practiceBtnMsg: "اختبار تدريبي على هذه المواد",
    copyPromptMsg: "نسخ السؤال",
  },
  ckb: {
    appTitle: "شوێنپێهەڵگری ئاستی ئەکادیمی",
    navHome: "سەرەتا",
    navFocus: "تەرکیزی خوێندن",
    navGrades: "نمرەکان",
    navAbout: "دەربارە",
    navPlans: "پلانەکان",
    upgradePlan: "بەرزکردنەوەی پلان",
    managePlan: "بەڕێوەبردنی پلان",
    freeScholar: "فێرخوازی بێبەرامبەر",
    proScholar: "فێرخوازی پێشکەوتوو",
    honorsScholar: "پلەی یەکەمی ئەکادیمی",
    honorsActive: "پلەی یەکەم چالاکە",
    currentPlan: "پلانی ئێستا",
    guideEyebrow: "ڕێبەر",
    guideTitle: "بە ئاگایی و مەبەست بخوێنە",
    guideText: "نمرەکانت لە خوارەوە تۆمار بکە. بینینی هەموو شتێک بە یەک چاو لێکردن یارمەتیت دەدات پێداچوونەوەت بخەیتە سەر ئەو بابەتانەی پێویستیان پێیەتی.",
    average: "تێکڕا",
    subjects: "بابەتەکان",
    priorityReview: "پێداچوونەوەی لەپێشینە",
    tipTitle: "تێبینییەک لەسەر بیرهێنانەوەی چالاک",
    tipText: "تاقیکردنەوەی خۆت لەسەر بیرۆکە ئاڵۆزەکان زانیاری دەچەسپێنێت لە یادگەی درێژخایەندا زۆر باشتر لە تەنها خوێندنەوەی تێبینییەکان. تایبەتمەندی تاقیکردنەوە لە تەنیشت بەکاربهێنە بۆ پێداچوونەوەی خێرا.",
    assistantEyebrow: "یاریدەدەری خوێندن",
    assistantTitle: "تەرکیزی خوێندن",
    clearChat: "سڕینەوەی چات",
    welcomeMessage: "سڵاو! بابەت و نمرەکانت لە خوارەوە بنووسە، دواتر کرتە لەسەر <strong>دروستکردنی هێڵکاری</strong> بکە. دوو نزمترین نمرەت لێرە دەردەکەون، دەتوانیت داوای پرسیاری ڕاهێنان، ڕوونکردنەوە، یان ڕێنمایی خوێندن بکەیت لە هەر کاتێکدا.",
    chatCleared: "چات سڕایەوە. هەر پرسیارێکت هەیە بیکە، داوای تاقیکردنەوە بکە، یان پلانی خوێندنت دابنێ!",
    inputPlaceholder: "پرسیارێک بکە یان داوای تاقیکردنەوەی ڕاهێنان بکە...",
    send: "ناردن",
    practiceQuiz: "تاقیکردنەوەی ڕاهێنان",
    studySchedule: "خشتەی خوێندن",
    revisionTips: "ڕێنمایی پێداچوونەوە",
    listening: "گوێگرتن چالاکە... بە ڕوونی لە مایکرۆفۆنەکەتەوە بدوێ",
    done: "تەواو",
    progressEyebrow: "شوێنپێهەڵگری پێشکەوتن",
    progressTitle: "نمرەکانت، لە یەک چاو لێکردندا",
    progressIntro: "نمرەکانت زیاد بکە تا بزانیت کام بابەت پێویستی بە کاتی زیاتری خوێندنە.",
    chartNameLabel: "ناوی هێڵکاری",
    chartTitleLabel: "ناونیشانی هێڵکاری",
    axisHorizLabel: "تەوەری ئاسۆیی",
    axisVertLabel: "تەوەری ستوونی",
    topicGradesLabel: "نمرەی بابەتەکان",
    score100Label: "نمرە / ١٠٠",
    defaultChartName: "پێشکەوتنی خوێندنم",
    defaultChartTitle: "نمرەکان بەپێی بابەت",
    defaultAxisHoriz: "بابەت",
    defaultAxisVert: "نمرە (٪)",
    topicPlaceholder: "بۆ نموونە: جەبر",
    addTopic: "+ زیادکردنی بابەت",
    sampleData: "نموونەی داتا",
    reset: "ڕێکخستنەوە",
    createChart: "دروستکردنی هێڵکاری",
    chartEmptyMsg: "لانیکەم دوو بابەت و دوو نمرە بنووسە بۆ دروستکردنی هێڵکاری.",
    topicsUnit: "بابەت",
    aboutEyebrow: "دەربارەی پلاتفۆرمەکە",
    aboutTitle: "دیزاین کراوە بۆ فێربوونی بنەمادار بە بەڵگە",
    aboutIntro: "شوێنپێهەڵگری ئاستی ئەکادیمی نێوانی نمرەکانی تاقیکردنەوە و خوێندنی ڕۆژانە پڕ دەکاتەوە. لەسەر بنەما باوەڕپێکراوەکانی زانستی مەعریفی دروستکراوە تا کەمکوڕییەکانی نمرە بکاتە ڕاهێنانی بەئامانج.",
    aboutCard1Num: "٠١. نەخشەسازیی دەستنیشانکردن",
    aboutCard1Title: "دۆزینەوەی خۆکارانەی کەمکوڕییەکان",
    aboutCard1Text: "فێرخوازان زۆرجار کاتەکانیان بە پێداچوونەوەی ئەو بابەتانە بەسەردەبەن کە لێیان شارەزان. ئەلگۆریتمەکەمان تێکڕای نمرەکان دەژمێرێت و دوو نزمترین بابەت دیاری دەکات بۆ پێداچوونەوەی ورد.",
    aboutCard2Num: "٠٢. بیرهێنانەوەی چالاک",
    aboutCard2Title: "بیرهێنانەوە نەک خوێندنەوەی ناچالاک",
    aboutCard2Text: "زانستی مەعریفی دەیسەلمێنێت کە خۆتاقیکردنەوە بەڕێژەی ٥٠٪ پاراستنی زانیاری لە بیرگەدا باشتر دەکات بەراورد بە تەنها خوێندنەوە. یاریدەدەرەکە دەستبەجێ پرسیاری چەمکی بەپێی نمرەکانت دروست دەکات.",
    aboutCard3Num: "٠٣. ڕاهێنانی زیرەک",
    aboutCard3Title: "ڕێنمایی بنەمادار بە نمرەکانت",
    aboutCard3Text: "بە بەکارهێنانی Gemini 3.8 Flash، ڕاهێنەرەکە پشت بە نمرە ڕاستەقینەکانت دەبەستێت بۆ دانانی خشتەی خوێندنی ٧ ڕۆژە، دەنگ بۆ دەق، و شیکردنەوەی چەمکە ئاڵۆزەکان.",
    aboutCalloutTitle: "پێویستت بە خشتەی تاقیکردنەوەی تایبەت یان ڕاهێنانی دەنگی بێسنوورە؟",
    aboutCalloutText: "تەماشای پلانەکانی بەشداریکردن لە خوارەوە بکە بۆ تاقیکردنەوەی بەردەوام و نەخشەڕێگای ڕێکخراوی خوێندن.",
    viewMemberships: "بینینی پلانەکان",
    pricingEyebrow: "ئەندامێتی و بەشداریکردن",
    pricingTitle: "بەبێ سنوور بخوێنە",
    pricingIntro: "ئەو ئاستەی ڕاهێنان و شیکاریی خوێندن هەڵبژێرە کە لەگەڵ ئامانجە ئەکادیمییەکانت دەگونجێت.",
    monthly: "مانگانە",
    annual: "ساڵانە",
    save20: "٢٠٪ داشکاندن",
    freeDesc: "شوێنپێهەڵگری سەرەتایی نمرەکان، هێڵکاری سادە، و ڕێنمایی دەستپێک.",
    proDesc: "خشتەی پێداچوونەوەی گشتگیر، تاقیکردنەوەی بێسنوور، و شیکردنەوەی قووڵی خاڵە لاوازەکان.",
    honorsDesc: "بۆ خوێندکارە سەرکەوتووەکان کە دەیانەوێت بگەنە بەرزترین ئاست بە شیکاریی چەند وەرزی.",
    mostPopular: "پڕداواکراوترین",
    forever: "/ بۆ هەمیشە",
    perMonth: "/ مانگانە",
    perYearPro: "/ ساڵانە ($6.33/مانگ)",
    perYearHonors: "/ ساڵانە ($14/مانگ)",
    upgradeToPro: "بەرزکردنەوە بۆ پێشکەوتوو",
    getHonors: "پلەی یەکەمی ئەکادیمی",
    switchToPro: "گۆڕین بۆ پێشکەوتوو",
    downgradeFree: "دابەزاندن بۆ بێبەرامبەر",
    modalUpgradeTitle: "بەرزکردنەوەی ئەندامێتی",
    modalSummaryPlan: "پلانی هەڵبژێردراو:",
    modalSummaryInterval: "ماوەی پارەدان:",
    modalSummaryPrice: "نرخ:",
    modalCancel: "پاشگەزبوونەوە",
    modalConfirm: "پشتڕاستکردنەوەی بەشداریکردن",
    modalConfirmDowngrade: "پشتڕاستکردنەوەی دابەزاندن",
    modalActivationNote: "چالاککردنی دەستبەجێ. تاقیکردنەوەی بێسنوور و پلانی پێشکەوتوو دەستبەجێ دەکرێتەوە.",
    copyBtn: "کۆپیکردن",
    copiedBtn: "کۆپی کرا!",
    promptQuiz: "تکایە دەست پێبکە بە تاقیکردنەوەیەکی ڕاهێنان لەسەر لاوازترین بابەتەکانم ({topics}). ٢ پرسیاری دیاریکراوم لێ بکە بۆ پشکنینی تێگەیشتنم.",
    promptSchedule: "خشتەیەکی خوێندنی ٧ ڕۆژەی ڕێکخراو و ستراتیژییەکی پێداچوونەوەم بۆ ئامادە بکە بۆ بەرزکردنەوەی نمرەکانم لە: {topics}.",
    promptTips: "کاریگەرترین تەکنیکەکانی خوێندنی بنەمادار بە زانست چین (وەک بیرهێنانەوەی چالاک، تەکنیکی فاینمان، و دووبارەکردنەوەی بەمەودا)، و چۆن جێبەجێیان بکەم؟",
    focusMsg: "دوو نزمترین نمرەت لەم بابەتانەن: <strong>{topics}</strong>. پێدانی کەمێک سەرنجی زیاتر بەم بابەتانە جیاوازییەکی بەرچاو دروست دەکات.",
    practiceBtnMsg: "تاقیکردنەوە لەسەر ئەم بابەتانە",
    copyPromptMsg: "کۆپیکردنی پرسیار",
  },
};

const SAMPLES = {
  en: [
    { name: "Algebra", grade: 54 },
    { name: "Organic Chemistry", grade: 46 },
    { name: "World History", grade: 82 },
    { name: "English Literature", grade: 89 },
  ],
  ar: [
    { name: "الجبر", grade: 54 },
    { name: "الكيمياء العضوية", grade: 46 },
    { name: "تاريخ العالم", grade: 82 },
    { name: "الأدب العربي", grade: 89 },
  ],
  ckb: [
    { name: "جەبر", grade: 54 },
    { name: "کیمیای ئەندامی", grade: 46 },
    { name: "مێژووی جیهان", grade: 82 },
    { name: "ئەدەبی کوردی", grade: 89 },
  ],
};

let currentLang = localStorage.getItem("academic_tracker_lang") || "en";

function setLanguage(lang) {
  if (!I18N[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem("academic_tracker_lang", lang);

  const isRtl = lang === "ar" || lang === "ckb";
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? "rtl" : "ltr";

  // Update switcher buttons active state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  const t = I18N[lang];

  // Update all [data-i18n] text
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) {
      el.innerHTML = t[key];
    }
  });

  // Update Input placeholders
  if (chatInput) {
    chatInput.placeholder = t.inputPlaceholder;
  }

  // Update Speech recognition language
  if (recognition) {
    if (lang === "ckb") {
      recognition.lang = "ckb";
    } else if (lang === "ar") {
      recognition.lang = "ar-SA";
    } else {
      recognition.lang = "en-US";
    }
  }

  // Update Chart form fields default text if default
  const chartNameInput = document.querySelector("#chart-name");
  const chartTitleInput = document.querySelector("#chart-title");
  const axisLabelInput = document.querySelector("#axis-label-title");
  const axisGradeInput = document.querySelector("#axis-grade-title");

  if (chartNameInput && (chartNameInput.value === "My study progress" || chartNameInput.value === "تقدمي الدراسي" || chartNameInput.value === "پێشکەوتنی خوێندنم")) {
    chartNameInput.value = t.defaultChartName;
  }
  if (chartTitleInput && (chartTitleInput.value === "Grades by topic" || chartTitleInput.value === "الدرجات حسب المادة" || chartTitleInput.value === "نمرەکان بەپێی بابەت")) {
    chartTitleInput.value = t.defaultChartTitle;
  }
  if (axisLabelInput && (axisLabelInput.value === "Topic" || axisLabelInput.value === "المادة" || axisLabelInput.value === "بابەت")) {
    axisLabelInput.value = t.defaultAxisHoriz;
  }
  if (axisGradeInput && (axisGradeInput.value === "Grade (%)" || axisGradeInput.value === "الدرجة (%)" || axisGradeInput.value === "نمرە (٪)")) {
    axisGradeInput.value = t.defaultAxisVert;
  }

  // Update plan states
  renderSubscriptionState();
  updateBillingInterval(currentBillingInterval);

  // If a chart exists, re-render with new font family
  if (gradeChart) {
    gradeChart.options.scales.x.title.font.family = isRtl ? "Noto Sans Arabic, DM Sans" : "DM Sans";
    gradeChart.options.scales.y.title.font.family = isRtl ? "Noto Sans Arabic, DM Sans" : "DM Sans";
    gradeChart.update();
  }
}

// Attach language switcher events
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

// -------------------------------------------------------------
// Voice to Text Feature
// -------------------------------------------------------------
const voiceBtn = document.querySelector("#voice-btn");
const voiceStatusBanner = document.querySelector("#voice-status-banner");
const voiceStatusText = document.querySelector("#voice-status-text");
const voiceCancelBtn = document.querySelector("#voice-cancel-btn");

let recognition = null;
let isRecordingVoice = false;

function showToast(message, duration = 3000) {
  const toast = document.querySelector("#toast-notice");
  const toastMsg = document.querySelector("#toast-message");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.hidden = false;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.hidden = true;
  }, duration);
}

function initVoiceToText() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (voiceBtn) {
      voiceBtn.title = "Speech recognition not supported in this browser";
      voiceBtn.addEventListener("click", () => {
        showToast(
          currentLang === "ckb"
            ? "دەنگ بۆ دەق لەم وێبگەڕەدا کار ناکات. تکایە Chrome یان Safari بەکاربهێنە."
            : currentLang === "ar"
            ? "التعرف على الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Safari."
            : "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
        );
      });
    }
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = currentLang === "ckb" ? "ckb" : currentLang === "ar" ? "ar-SA" : "en-US";

  let finalTranscript = "";

  recognition.onstart = () => {
    isRecordingVoice = true;
    if (voiceBtn) {
      voiceBtn.classList.add("recording");
      voiceBtn.setAttribute("aria-label", "Stop recording voice");
    }
    if (voiceStatusBanner) {
      voiceStatusBanner.hidden = false;
      const t = I18N[currentLang];
      if (voiceStatusText) voiceStatusText.textContent = t.listening;
    }
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + " ";
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const currentText = (finalTranscript + interimTranscript).trim();
    if (chatInput && currentText) {
      chatInput.value = currentText;
      chatInput.focus();
    }
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    stopVoiceRecording();
    if (event.error === "not-allowed") {
      showToast(
        currentLang === "ckb"
          ? "ڕێگە بە مایکرۆفۆن نەدرا. تکایە ڕێگەپێدانی مایکرۆفۆن چالاک بکە."
          : currentLang === "ar"
          ? "تم رفض الوصول إلى الميكروفون. يرجى السماح بالإذن في المتصفح."
          : "Microphone access was denied. Please allow microphone permissions."
      );
    } else if (event.error === "no-speech") {
      showToast(
        currentLang === "ckb"
          ? "هیچ دەنگێک نەبیسترا. تکایە دووبارە تاقی بکەرەوە."
          : currentLang === "ar"
          ? "لم يتم اكتشاف أي صوت. يرجى المحاولة مرة أخرى."
          : "No speech detected. Please try again."
      );
    } else {
      showToast(`Voice status: ${event.error}`);
    }
  };

  recognition.onend = () => {
    stopVoiceRecording();
  };

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (isRecordingVoice) {
        stopVoiceRecording();
      } else {
        startVoiceRecording();
      }
    });
  }

  if (voiceCancelBtn) {
    voiceCancelBtn.addEventListener("click", () => {
      stopVoiceRecording();
    });
  }
}

function startVoiceRecording() {
  if (!recognition) return;
  try {
    recognition.lang = currentLang === "ckb" ? "ckb" : currentLang === "ar" ? "ar-SA" : "en-US";
    recognition.start();
  } catch (err) {
    console.error("Failed to start voice recognition:", err);
  }
}

function stopVoiceRecording() {
  isRecordingVoice = false;
  if (recognition) {
    try {
      recognition.stop();
    } catch {}
  }
  if (voiceBtn) {
    voiceBtn.classList.remove("recording");
    voiceBtn.setAttribute("aria-label", "Dictate message using voice");
  }
  if (voiceStatusBanner) {
    voiceStatusBanner.hidden = true;
  }
}

initVoiceToText();

// -------------------------------------------------------------
// Grade Row Controls
// -------------------------------------------------------------
function updateGradeRowControls() {
  const rows = [...gradeRows.querySelectorAll(".grade-row")];
  rows.forEach((row, index) => {
    const removeButton = row.querySelector(".remove-grade");
    removeButton.disabled = rows.length <= 2;
    removeButton.setAttribute("aria-label", `Remove topic ${index + 1}`);
  });
}

function createGradeRow(rowId, topicVal = "", gradeVal = "") {
  const row = document.createElement("div");
  row.className = "grade-row";

  const t = I18N[currentLang];

  const topicLabel = document.createElement("label");
  topicLabel.className = "visually-hidden";
  topicLabel.htmlFor = `topic-${rowId}`;
  topicLabel.textContent = `${t.defaultAxisHoriz} ${rowId}`;

  const topicInput = document.createElement("input");
  topicInput.id = `topic-${rowId}`;
  topicInput.name = "topic";
  topicInput.type = "text";
  topicInput.maxLength = 50;
  topicInput.placeholder = t.topicPlaceholder;
  topicInput.value = topicVal;
  topicInput.required = true;

  const gradeLabel = document.createElement("label");
  gradeLabel.className = "visually-hidden";
  gradeLabel.htmlFor = `grade-${rowId}`;
  gradeLabel.textContent = `Grade for ${rowId}`;

  const gradeInput = document.createElement("input");
  gradeInput.id = `grade-${rowId}`;
  gradeInput.name = "grade";
  gradeInput.type = "number";
  gradeInput.min = "0";
  gradeInput.max = "100";
  gradeInput.step = "1";
  gradeInput.placeholder = "0–100";
  gradeInput.value = gradeVal;
  gradeInput.required = true;

  const removeButton = document.createElement("button");
  removeButton.className = "remove-grade";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remove topic ${rowId}`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => {
    row.remove();
    updateGradeRowControls();
  });

  row.append(topicLabel, topicInput, gradeLabel, gradeInput, removeButton);
  return row;
}

document.querySelectorAll(".grade-row .remove-grade").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".grade-row").remove();
    updateGradeRowControls();
  });
});

document.querySelector("#add-grade").addEventListener("click", () => {
  const newRow = createGradeRow(nextGradeRowId++);
  gradeRows.append(newRow);
  updateGradeRowControls();
  newRow.querySelector("input[name='topic']").focus();
});

if (sampleDataBtn) {
  sampleDataBtn.addEventListener("click", () => {
    gradeRows.innerHTML = "";
    nextGradeRowId = 1;
    const samples = SAMPLES[currentLang] || SAMPLES.en;
    samples.forEach((s) => {
      gradeRows.append(createGradeRow(nextGradeRowId++, s.name, s.grade));
    });
    updateGradeRowControls();
    gradeForm.requestSubmit();
  });
}

if (clearFormBtn) {
  clearFormBtn.addEventListener("click", () => {
    gradeRows.innerHTML = "";
    nextGradeRowId = 1;
    gradeRows.append(createGradeRow(nextGradeRowId++, "", ""));
    gradeRows.append(createGradeRow(nextGradeRowId++, "", ""));
    updateGradeRowControls();
    if (gradeChart) {
      gradeChart.destroy();
      gradeChart = null;
    }
    chartEmpty.hidden = false;
    const t = I18N[currentLang];
    document.querySelector("#chart-count").textContent = `0 ${t.topicsUnit}`;
    if (statsOverview) statsOverview.hidden = true;
    currentWeakestTopics = [];
    currentAllGrades = [];
    if (quizWeakBtn) quizWeakBtn.disabled = true;
    if (studyPlanBtn) studyPlanBtn.disabled = true;
  });
}

if (clearChatBtn) {
  clearChatBtn.addEventListener("click", () => {
    const t = I18N[currentLang];
    chatMessages.innerHTML = `
      <div class="message assistant-message">
        <p>${t.chatCleared}</p>
      </div>
    `;
    chatHistory.length = 0;
  });
}

function formatMarkdown(text) {
  const escaped = document.createElement("div");
  escaped.textContent = text;
  let formatted = escaped.innerHTML;

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Bullet lists
  formatted = formatted.replace(/(?:^|\n)[*-] (.*?)(?=\n|$)/g, "<br>&bull; $1");
  // Numbered lists
  formatted = formatted.replace(/(?:^|\n)(\d+)\. (.*?)(?=\n|$)/g, "<br><strong>$1.</strong> $2");
  // Headings
  formatted = formatted.replace(/(?:^|\n)### (.*?)(?=\n|$)/g, "<br><strong>$1</strong>");
  // Paragraphs / linebreaks
  formatted = formatted.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");

  const span = document.createElement("span");
  span.innerHTML = formatted;
  return span;
}

function appendMessage(role, contentNodeOrText, rawText = "") {
  const msg = document.createElement("div");
  msg.className = `message ${role}-message`;

  if (typeof contentNodeOrText === "string") {
    const p = document.createElement("p");
    p.appendChild(formatMarkdown(contentNodeOrText));
    msg.appendChild(p);
  } else {
    msg.appendChild(contentNodeOrText);
  }

  // Add copy button for assistant text responses
  if (role === "assistant" && rawText) {
    const copyBtn = document.createElement("button");
    copyBtn.className = "msg-copy-btn";
    copyBtn.type = "button";
    const t = I18N[currentLang];
    copyBtn.textContent = t.copyBtn;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(rawText);
        copyBtn.textContent = t.copiedBtn;
        setTimeout(() => {
          copyBtn.textContent = t.copyBtn;
        }, 2000);
      } catch {
        copyBtn.textContent = "Failed";
      }
    });
    msg.appendChild(copyBtn);
  }

  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

let chatApiUrl = "/api/chat";

async function sendChatToGemini(userText) {
  if (isGenerating || !userText.trim()) return;

  const trimmedText = userText.trim();
  appendMessage("user", trimmedText);
  chatHistory.push({ role: "user", text: trimmedText });

  isGenerating = true;
  if (chatInput) chatInput.value = "";
  if (chatSendBtn) chatSendBtn.disabled = true;

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message assistant-message typing-indicator";
  typingIndicator.textContent = currentLang === "ckb" ? "بیردەکاتەوە..." : currentLang === "ar" ? "جاري التفكير..." : "Thinking...";
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const currentPlan = localStorage.getItem("academic_tracker_plan") || "free";

  const payload = {
    message: trimmedText,
    history: chatHistory,
    context: {
      weakestTopics: currentWeakestTopics,
      allGrades: currentAllGrades,
      userPlan: currentPlan,
      language: currentLang,
    },
  };

  try {
    let reply = null;

    const endpointsToTry = [chatApiUrl, "/.netlify/functions/chat", "/chat", "api/chat"];
    let lastError = null;

    for (const endpoint of endpointsToTry) {
      try {
        // Try standard POST first
        let res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // If intermediate proxy, CDN, or server blocks POST with 405 Method Not Allowed,
        // instantly recover via GET fallback query
        if (res.status === 405) {
          try {
            const fallbackUrl = `${endpoint}?payload=${encodeURIComponent(JSON.stringify(payload))}&message=${encodeURIComponent(trimmedText)}`;
            res = await fetch(fallbackUrl, {
              method: "GET",
              headers: { "Accept": "application/json" },
            });
          } catch (getErr) {
            console.warn("GET fallback error:", getErr);
          }
        }

        // If 404 or still 405, save status and test next fallback endpoint
        if (res.status === 404 || res.status === 405 || res.status === 403) {
          lastError = `Status ${res.status}`;
          continue;
        }

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.response) {
            reply = data.response;
            chatApiUrl = endpoint;
            break;
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData.error || `HTTP ${res.status}`;
        }
      } catch (networkErr) {
        lastError = networkErr.message;
      }
    }

    if (!reply && lastError) {
      throw new Error(lastError);
    }

    if (!reply) {
      reply = currentLang === 'ckb'
        ? "سڵاو! من ئامادەم یارمەتیت بدەم لە وانەکانتدا. حەز دەکەیت پێداچوونەوە بە چ بابەتێکدا بکەین؟"
        : currentLang === 'ar'
        ? "مرحباً! أنا جاهز لمساعدتك في دراستك. ما الموضوع الذي ترغب في مراجعته اليوم؟"
        : "Hello! I am ready to help with your studies. Which topic would you like to review today?";
    }

    typingIndicator.remove();
    appendMessage("assistant", reply, reply);
    chatHistory.push({ role: "model", text: reply });
  } catch (err) {
    typingIndicator.remove();
    const errMsg = String(err.message || '').replace(/AIza[a-zA-Z0-9_\-]{35}/g, '[REDACTED_KEY]');
    const prefix = currentLang === 'ckb' ? 'نەتوانرا پەیوەندی بە یاریدەدەری خوێندن بکرێت' : currentLang === 'ar' ? 'تعذر الاتصال بالمساعد الدراسي' : 'Could not connect to study assistant';
    appendMessage("error", `${prefix}: ${errMsg}`);
  } finally {
    isGenerating = false;
    if (chatSendBtn) chatSendBtn.disabled = false;
    if (chatInput) chatInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput && chatInput.value) {
      sendChatToGemini(chatInput.value);
    }
  });
}

if (quizWeakBtn) {
  quizWeakBtn.addEventListener("click", () => {
    if (currentWeakestTopics.length > 0) {
      const topicNames = currentWeakestTopics.map((t) => t.name).join(" and ");
      const t = I18N[currentLang];
      const prompt = t.promptQuiz.replace("{topics}", topicNames);
      sendChatToGemini(prompt);
    }
  });
}

if (studyPlanBtn) {
  studyPlanBtn.addEventListener("click", () => {
    if (currentWeakestTopics.length > 0) {
      const topicNames = currentWeakestTopics.map((t) => `${t.name} (${t.grade}%)`).join(", ");
      const t = I18N[currentLang];
      const prompt = t.promptSchedule.replace("{topics}", topicNames);
      sendChatToGemini(prompt);
    }
  });
}

if (explainBtn) {
  explainBtn.addEventListener("click", () => {
    const t = I18N[currentLang];
    sendChatToGemini(t.promptTips);
  });
}

function addStudyFocusMessage(weakestTopics) {
  chatMessages.querySelectorAll(".chat-focus-message").forEach((message) => message.remove());
  const message = document.createElement("div");
  const text = document.createElement("p");
  const buttonsWrap = document.createElement("div");
  const startQuizBtn = document.createElement("button");
  const copyQuizBtn = document.createElement("button");
  const status = document.createElement("span");

  const andWord = currentLang === "ckb" ? " و " : currentLang === "ar" ? " و " : " and ";
  const topicSummary = weakestTopics.map((topic) => `${topic.name} (${topic.grade}%)`).join(andWord);

  const t = I18N[currentLang];

  message.className = "message assistant-message chat-focus-message";
  text.innerHTML = t.focusMsg.replace("{topics}", topicSummary);

  buttonsWrap.className = "chat-focus-buttons";

  startQuizBtn.className = "primary-button";
  startQuizBtn.type = "button";
  startQuizBtn.textContent = t.practiceBtnMsg;
  startQuizBtn.addEventListener("click", () => {
    const topicList = weakestTopics.map((item) => item.name).join(andWord);
    const prompt = t.promptQuiz.replace("{topics}", topicList);
    sendChatToGemini(prompt);
  });

  copyQuizBtn.className = "quiz-focus-button secondary-button";
  copyQuizBtn.type = "button";
  copyQuizBtn.textContent = t.copyPromptMsg;
  status.className = "copy-prompt-status";
  status.setAttribute("role", "status");
  copyQuizBtn.addEventListener("click", async () => {
    const topicList = weakestTopics.map((topic) => topic.name).join(andWord);
    const prompt = t.promptQuiz.replace("{topics}", topicList);
    try {
      await navigator.clipboard.writeText(prompt);
      status.textContent = t.copiedBtn;
      setTimeout(() => {
        status.textContent = "";
      }, 2500);
    } catch {
      status.textContent = prompt;
    }
  });

  buttonsWrap.append(startQuizBtn, copyQuizBtn);
  message.append(text, buttonsWrap, status);
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Unlock quick actions
  if (quizWeakBtn) {
    quizWeakBtn.disabled = false;
    quizWeakBtn.title = "Quiz your weakest topics";
  }
  if (studyPlanBtn) {
    studyPlanBtn.disabled = false;
    studyPlanBtn.title = "Generate study schedule";
  }

  document.querySelector("#chat").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

gradeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const rows = [...gradeRows.querySelectorAll(".grade-row")];
  const grades = rows.map((row) => ({
    name: row.querySelector("input[name='topic']").value.trim(),
    grade: Number(row.querySelector("input[name='grade']").value),
  }));

  if (grades.length < 2 || grades.some((item) => !item.name || !Number.isFinite(item.grade))) return;

  currentAllGrades = grades;
  const chartName = gradeForm.elements.chartName.value.trim();
  const chartTitle = gradeForm.elements.chartTitle.value.trim();
  const axisLabelTitle = gradeForm.elements.axisLabelTitle.value.trim();
  const axisGradeTitle = gradeForm.elements.axisGradeTitle.value.trim();
  const sortedGrades = [...grades].sort((first, second) => first.grade - second.grade);
  const weakestTopics = sortedGrades.slice(0, 2);
  currentWeakestTopics = weakestTopics;

  const totalScore = grades.reduce((acc, curr) => acc + curr.grade, 0);
  const avgScore = Math.round(totalScore / grades.length);

  // Update Overview Stats Card
  if (statsOverview) {
    statsOverview.hidden = false;
    if (statAverage) statAverage.textContent = `${avgScore}%`;
    if (statCount) statCount.textContent = `${grades.length}`;
    if (statWeakest) statWeakest.textContent = weakestTopics[0]?.name || "--";
  }

  const weakestIndexes = new Set(
    grades
      .map((item, index) => ({ index, grade: item.grade }))
      .sort((first, second) => first.grade - second.grade)
      .slice(0, 2)
      .map((item) => item.index)
  );

  const t = I18N[currentLang];
  document.querySelector("#chart-name-output").textContent = chartName;
  document.querySelector("#chart-title-output").textContent = chartTitle;
  document.querySelector("#chart-count").textContent = `${grades.length} ${t.topicsUnit}`;
  document.querySelector("#chart-axis-summary").textContent = `${axisLabelTitle} · ${axisGradeTitle} (Avg: ${avgScore}%)`;
  gradeChartCanvas.setAttribute(
    "aria-label",
    `${chartTitle}. ${grades.map((item) => `${item.name}: ${item.grade} percent`).join("; ")}`
  );

  if (typeof Chart === "undefined") {
    chartEmpty.textContent = "The chart library did not load. Check your internet connection and try again.";
    chartEmpty.hidden = false;
    return;
  }

  chartEmpty.hidden = true;
  if (gradeChart) gradeChart.destroy();
  const isRtl = currentLang === "ar" || currentLang === "ckb";
  const fontFamily = isRtl ? "Noto Sans Arabic, DM Sans" : "DM Sans";

  gradeChart = new Chart(gradeChartCanvas, {
    type: "bar",
    data: {
      labels: grades.map((item) => item.name),
      datasets: [
        {
          label: axisGradeTitle,
          data: grades.map((item) => item.grade),
          backgroundColor: grades.map((item, index) => (weakestIndexes.has(index) ? "#c99a70" : "#8eb99b")),
          borderColor: grades.map((item, index) => (weakestIndexes.has(index) ? "#dfb28a" : "#a8c5af")),
          borderWidth: 1,
          borderRadius: 0,
          maxBarThickness: 56,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y}%`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: axisLabelTitle, color: "#c1d2c5", font: { family: fontFamily } },
          ticks: { color: "#dce8df", font: { family: fontFamily } },
          grid: { display: false },
          border: { color: "#597361" },
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: axisGradeTitle, color: "#c1d2c5", font: { family: fontFamily } },
          ticks: { color: "#c1d2c5", stepSize: 20, callback: (value) => `${value}%` },
          grid: { color: "rgba(174, 197, 180, 0.16)" },
          border: { color: "#597361" },
        },
      },
    },
  });

  addStudyFocusMessage(weakestTopics);
});

// -------------------------------------------------------------
// Subscription System Management
// -------------------------------------------------------------
const billingMonthlyBtn = document.querySelector("#billing-monthly");
const billingAnnualBtn = document.querySelector("#billing-annual");
const proPriceVal = document.querySelector("#pro-price-val");
const proPriceInterval = document.querySelector("#pro-price-interval");
const honorsPriceVal = document.querySelector("#honors-price-val");
const honorsPriceInterval = document.querySelector("#honors-price-interval");

const navPlanBtn = document.querySelector("#nav-plan-btn");
const navTierIndicator = document.querySelector("#nav-tier-indicator");

const btnSelectFree = document.querySelector("#btn-select-free");
const btnSelectPro = document.querySelector("#btn-select-pro");
const btnSelectHonors = document.querySelector("#btn-select-honors");

const subscriptionModal = document.querySelector("#subscription-modal");
const modalCloseBtn = document.querySelector("#modal-close-btn");
const modalCancelBtn = document.querySelector("#modal-cancel-btn");
const modalConfirmBtn = document.querySelector("#modal-confirm-btn");
const modalPlanDesc = document.querySelector("#modal-plan-desc");
const modalSummaryPlan = document.querySelector("#modal-summary-plan");
const modalSummaryInterval = document.querySelector("#modal-summary-interval");
const modalSummaryPrice = document.querySelector("#modal-summary-price");

let currentBillingInterval = "monthly";
let pendingSelectedPlan = null;

const PLAN_DATA = {
  free: {
    monthlyPrice: 0,
    annualPrice: 0,
  },
  pro: {
    monthlyPrice: 8,
    annualPrice: 76,
  },
  honors: {
    monthlyPrice: 18,
    annualPrice: 168,
  },
};

function getActivePlan() {
  return localStorage.getItem("academic_tracker_plan") || "free";
}

function setActivePlan(planId) {
  localStorage.setItem("academic_tracker_plan", planId);
  renderSubscriptionState();
}

function updateBillingInterval(interval) {
  currentBillingInterval = interval;
  const t = I18N[currentLang];
  if (interval === "annual") {
    if (billingMonthlyBtn) billingMonthlyBtn.classList.remove("active");
    if (billingAnnualBtn) billingAnnualBtn.classList.add("active");
    if (proPriceVal) proPriceVal.textContent = "$76";
    if (proPriceInterval) proPriceInterval.textContent = t.perYearPro;
    if (honorsPriceVal) honorsPriceVal.textContent = "$168";
    if (honorsPriceInterval) honorsPriceInterval.textContent = t.perYearHonors;
  } else {
    if (billingMonthlyBtn) billingMonthlyBtn.classList.add("active");
    if (billingAnnualBtn) billingAnnualBtn.classList.remove("active");
    if (proPriceVal) proPriceVal.textContent = "$8";
    if (proPriceInterval) proPriceInterval.textContent = t.perMonth;
    if (honorsPriceVal) honorsPriceVal.textContent = "$18";
    if (honorsPriceInterval) honorsPriceInterval.textContent = t.perMonth;
  }
}

function renderSubscriptionState() {
  const activePlan = getActivePlan();
  const t = I18N[currentLang];

  if (navTierIndicator) {
    if (activePlan === "free") {
      navTierIndicator.hidden = true;
      if (navPlanBtn) navPlanBtn.textContent = t.upgradePlan;
    } else if (activePlan === "pro") {
      navTierIndicator.hidden = false;
      navTierIndicator.textContent = t.proScholar;
      if (navPlanBtn) navPlanBtn.textContent = t.managePlan;
    } else if (activePlan === "honors") {
      navTierIndicator.hidden = false;
      navTierIndicator.textContent = t.honorsActive;
      if (navPlanBtn) navPlanBtn.textContent = t.managePlan;
    }
  }

  // Update Free button
  if (btnSelectFree) {
    if (activePlan === "free") {
      btnSelectFree.textContent = t.currentPlan;
      btnSelectFree.className = "plan-action-btn active-plan";
      btnSelectFree.disabled = true;
    } else {
      btnSelectFree.textContent = t.downgradeFree;
      btnSelectFree.className = "plan-action-btn secondary-plan";
      btnSelectFree.disabled = false;
    }
  }

  // Update Pro button
  if (btnSelectPro) {
    if (activePlan === "pro") {
      btnSelectPro.textContent = t.currentPlan;
      btnSelectPro.className = "plan-action-btn active-plan";
      btnSelectPro.disabled = true;
    } else {
      btnSelectPro.textContent = activePlan === "honors" ? t.switchToPro : t.upgradeToPro;
      btnSelectPro.className = "plan-action-btn primary-plan";
      btnSelectPro.disabled = false;
    }
  }

  // Update Honors button
  if (btnSelectHonors) {
    if (activePlan === "honors") {
      btnSelectHonors.textContent = t.currentPlan;
      btnSelectHonors.className = "plan-action-btn active-plan";
      btnSelectHonors.disabled = true;
    } else {
      btnSelectHonors.textContent = t.getHonors;
      btnSelectHonors.className = "plan-action-btn secondary-plan";
      btnSelectHonors.disabled = false;
    }
  }
}

function openSubscriptionModal(planKey) {
  pendingSelectedPlan = planKey;
  const planInfo = PLAN_DATA[planKey];
  if (!planInfo || !subscriptionModal) return;

  const t = I18N[currentLang];
  const planName = planKey === "free" ? t.freeScholar : planKey === "pro" ? t.proScholar : t.honorsScholar;

  const isAnnual = currentBillingInterval === "annual";
  const priceStr =
    planKey === "free"
      ? "$0.00"
      : isAnnual
      ? `$${planInfo.annualPrice}.00 ${t.annual}`
      : `$${planInfo.monthlyPrice}.00 ${t.monthly}`;

  if (modalSummaryPlan) modalSummaryPlan.textContent = planName;
  if (modalSummaryInterval) modalSummaryInterval.textContent = isAnnual ? `${t.annual} (${t.save20})` : t.monthly;
  if (modalSummaryPrice) modalSummaryPrice.textContent = priceStr;
  if (modalPlanDesc) {
    modalPlanDesc.innerHTML = `${planName}`;
  }
  if (modalConfirmBtn) {
    modalConfirmBtn.textContent = planKey === "free" ? t.modalConfirmDowngrade : t.modalConfirm;
  }

  subscriptionModal.hidden = false;
}

function closeSubscriptionModal() {
  if (subscriptionModal) {
    subscriptionModal.hidden = true;
  }
  pendingSelectedPlan = null;
}

if (billingMonthlyBtn) {
  billingMonthlyBtn.addEventListener("click", () => updateBillingInterval("monthly"));
}
if (billingAnnualBtn) {
  billingAnnualBtn.addEventListener("click", () => updateBillingInterval("annual"));
}

if (btnSelectFree) {
  btnSelectFree.addEventListener("click", () => openSubscriptionModal("free"));
}
if (btnSelectPro) {
  btnSelectPro.addEventListener("click", () => openSubscriptionModal("pro"));
}
if (btnSelectHonors) {
  btnSelectHonors.addEventListener("click", () => openSubscriptionModal("honors"));
}

if (navPlanBtn) {
  navPlanBtn.addEventListener("click", () => {
    const active = getActivePlan();
    if (active === "free") {
      openSubscriptionModal("pro");
    } else {
      document.querySelector("#pricing").scrollIntoView({ behavior: "smooth" });
    }
  });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeSubscriptionModal);
if (modalCancelBtn) modalCancelBtn.addEventListener("click", closeSubscriptionModal);

if (modalConfirmBtn) {
  modalConfirmBtn.addEventListener("click", () => {
    if (pendingSelectedPlan) {
      setActivePlan(pendingSelectedPlan);
      const t = I18N[currentLang];
      const planName = pendingSelectedPlan === "free" ? t.freeScholar : pendingSelectedPlan === "pro" ? t.proScholar : t.honorsScholar;
      showToast(
        currentLang === "ckb"
          ? `پلان نوێکرایەوە! ئێستا لەسەر پلانی ${planName}ـیت.`
          : currentLang === "ar"
          ? `تم تحديث الباقة بنجاح! أنت الآن في باقة ${planName}.`
          : `Subscription updated! You are now on the ${planName} plan.`
      );
      closeSubscriptionModal();
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && subscriptionModal && !subscriptionModal.hidden) {
    closeSubscriptionModal();
  }
});

// Initialize on page load with stored or default language
setLanguage(currentLang);
