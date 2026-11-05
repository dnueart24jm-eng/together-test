import { LanguageCode } from '../types/lesson';

export interface LocalizedStageContent {
  title: string;
  currentActivity: string;
  tasks: string[];
  teacherQuestions: string[];
  sentenceFrames: string[];
  coreConcepts: string[];
}

export interface LocalizedLessonInfo {
  subject: string;
  unit: string;
  topic: string;
  goal: string;
}

export const LOCALIZED_DEFAULT_LESSON: Record<LanguageCode, {
  info: LocalizedLessonInfo;
  stages: Record<string, LocalizedStageContent>;
}> = {
  en: {
    info: {
      subject: 'Elementary Social Studies',
      unit: '1. Social Changes and Diverse Cultures',
      topic: 'Exploring Changes in Daily Life from Intelligent Information Technology',
      goal: 'Analyze how daily life has changed due to intelligent information technology.',
    },
    stages: {
      INTRO: {
        title: 'Introduction',
        currentActivity: 'Recall the information society we learned about last time and check today’s learning topic.',
        tasks: [
          'Look at the photo on textbook page 24 together with friends.',
          'Write today’s learning goal written on the blackboard into your notebook.',
          'Think in your mind about convenient times when using smartphones or computers.',
        ],
        teacherQuestions: [
          'Everyone, we learned about the information society last time, right? What machines and technologies do we use often today?',
          'How are artificial intelligence and robots changing our daily lives?',
        ],
        sentenceFrames: ['I use ______ every day, which is very convenient.'],
        coreConcepts: ['Information Society: A society where information is the most important resource.'],
      },
      WAKE: {
        title: 'Waking Thoughts',
        currentActivity: 'Look at the picture of a living room with a robot vacuum and smart AI speaker, and answer the question.',
        tasks: [
          'Examine the illustrations and photos on textbook page 25 carefully.',
          'Point to 3 special smart machines in the picture with your partner.',
          'Listen to the teacher’s question and get ready to talk with your partner.',
        ],
        teacherQuestions: [
          'Comparing homes from the past and today, what are the good points of today’s life?',
          'If moving robots or AI do work instead of people, how can we spend our free time?',
        ],
        sentenceFrames: ['In the past, people had to ______ by hand, but today machines do it for us, which is great.'],
        coreConcepts: ['Comparison: A way of thinking that looks for similarities and differences between two things.'],
      },
      ACT1: {
        title: 'Activity 1 — Meaning of Smart Information Tech',
        currentActivity: 'Read the textbook passage to find out what "Intelligent Information Tech" means and find key words.',
        tasks: [
          'Read along the first paragraph on textbook page 26 with your pencil.',
          'Circle the words "Artificial Intelligence (AI)" and "Information & Communications Technology (ICT)".',
          'Match word cards on the blackboard with your partner.',
        ],
        teacherQuestions: [
          'Intelligent information technology means combining AI with information technology. How is this different from simple information technology?',
          'What are some examples of machines thinking and making decisions like humans?',
        ],
        sentenceFrames: ['The machine judges and decides ______ by itself.'],
        coreConcepts: ['Intelligent Information Society: AI, big data, and IoT combined across various fields.'],
      },
      ACT2: {
        title: 'Activity 2 — Changes in Daily Life',
        currentActivity: 'Work with group members to organize changes in transportation, hospitals, schools, and homes on cards.',
        tasks: [
          'Check your group’s assigned area (transportation / healthcare / education / home).',
          'Find pictures or stickers showing changes and stick them onto the activity worksheet.',
          'Share one change you found with your group members.',
        ],
        teacherQuestions: [
          'What is the most convenient change from smart tech in your assigned area?',
          'What difficulties would we have if this technology did not exist?',
        ],
        sentenceFrames: ['Thanks to ______ technology, doing ______ has become much easier.'],
        coreConcepts: ['Daily Convenience: Smart tech saves time, effort, and protects our safety.'],
      },
      ACT3: {
        title: 'Activity 3 — Efforts to Respond to Changes',
        currentActivity: 'Learn about challenges caused by digital tech (digital exclusion, privacy issues) and efforts to solve them.',
        tasks: [
          'Look at the photo of a grandmother having difficulty using a kiosk (self-order machine).',
          'Talk with friends about what we can do to help everyone enjoy technology conveniently.',
          'Put your idea sticker on the group thought-sharing board.',
        ],
        teacherQuestions: [
          'What difficulties do neighbors who find it hard to use smart devices experience?',
          'What efforts should society and we make to build a happy smart society for everyone?',
        ],
        sentenceFrames: ['For neighbors facing difficulties, we need efforts to ______.'],
        coreConcepts: ['Digital Divide: Inequality resulting from differences in accessing or using new information technologies.'],
      },
      CLOSE: {
        title: 'Wrap-up & Reflection',
        currentActivity: 'Organize your learning notebook from today’s lesson and reflect on what you learned.',
        tasks: [
          'Write down the 2 most memorable words from today’s lesson in your learning notebook.',
          'Color the "Self-Check" circles on textbook page 29.',
          'Say goodbye to your partner and finish today’s lesson.',
        ],
        teacherQuestions: [
          'What new things did you learn in today’s lesson?',
          'What kind of attitude should we have as we live in a smart information society?',
        ],
        sentenceFrames: ['In today’s class, I learned that ______.'],
        coreConcepts: ['Digital Citizen: A person who uses technology safely and properly while caring for neighbors.'],
      },
    },
  },
  vi: {
    info: {
      subject: 'Môn Xã hội Tiểu học',
      unit: '1. Sự thay đổi xã hội và văn hóa đa dạng',
      topic: 'Tìm hiểu những thay đổi trong cuộc sống nhờ thông tin hóa thông minh',
      goal: 'Phân tích được những thay đổi trong cuộc sống sinh hoạt nhờ công nghệ thông tin thông minh.',
    },
    stages: {
      INTRO: {
        title: 'Khởi động',
        currentActivity: 'Nhớ lại xã hội thông tin đã học ở tiết trước và xác định vấn đề bài học hôm nay.',
        tasks: [
          'Cùng các bạn xem bức ảnh ở trang 24 sách giáo khoa.',
          'Viết mục tiêu bài học thầy cô ghi trên bảng vào vở.',
          'Nghĩ về những trải nghiệm tiện lợi khi dùng điện thoại hoặc máy tính.',
        ],
        teacherQuestions: [
          'Tiết trước chúng ta đã học về xã hội thông tin. Ngày nay chúng ta thường dùng những máy móc công nghệ nào?',
          'Trí tuệ nhân tạo và robot đang thay đổi cuộc sống của chúng ta như thế nào?',
        ],
        sentenceFrames: ['Em dùng ______ mỗi ngày nên rất tiện lợi.'],
        coreConcepts: ['Xã hội thông tin: Xã hội nơi thông tin là tài nguyên quan trọng nhất.'],
      },
      WAKE: {
        title: 'Khơi dậy suy nghĩ',
        currentActivity: 'Xem bức ảnh phòng khách có robot hút bụi và loa thông minh AI rồi trả lời câu hỏi.',
        tasks: [
          'Quan sát kỹ tranh và ảnh trên trang 25 sách giáo khoa.',
          'Cùng bạn bên cạnh chỉ ngón tay vào 3 máy móc thông minh trong tranh.',
          'Lắng nghe câu hỏi của thầy cô và chuẩn bị thảo luận với bạn cùng bàn.',
        ],
        teacherQuestions: [
          'So với ngôi nhà ngày xưa, ngôi nhà ngày nay có điểm gì tốt hơn?',
          'Nếu robot tự động hoặc AI làm việc thay con người, chúng ta có thể dành thời gian làm gì?',
        ],
        sentenceFrames: ['Ngày xưa con người phải tự tay ______, nhưng ngày nay máy móc làm giúp nên rất tiện.'],
        coreConcepts: ['So sánh: Phương pháp tìm điểm giống và khác nhau giữa hai đối tượng.'],
      },
      ACT1: {
        title: 'Hoạt động 1 — Ý nghĩa thông tin hóa thông minh',
        currentActivity: 'Đọc bài trong sách giáo khoa để hiểu nghĩa của "thông tin hóa thông minh" và tìm từ khóa.',
        tasks: [
          'Dùng bút chì theo dõi và đọc đoạn đầu trang 26 sách giáo khoa.',
          'Khoanh tròn vào các từ "Trí tuệ nhân tạo (AI)" và "Công nghệ thông tin truyền thông (ICT)".',
          'Cùng bạn cùng bàn ghép các thẻ từ vựng trên bảng.',
        ],
        teacherQuestions: [
          'Thông tin hóa thông minh là sự kết hợp giữa AI và CNTT. Điều này khác gì với thông tin hóa đơn thuần?',
          'Máy móc suy nghĩ và đưa ra quyết định như con người có những ví dụ nào?',
        ],
        sentenceFrames: ['Máy móc có thể tự mình phán đoán ______.'],
        coreConcepts: ['Thông tin hóa thông minh: AI, dữ liệu lớn và IoT kết hợp trong nhiều lĩnh vực.'],
      },
      ACT2: {
        title: 'Hoạt động 2 — Thay đổi trong đời sống',
        currentActivity: 'Cùng các bạn trong nhóm sắp xếp các thay đổi về giao thông, bệnh viện, trường học và gia đình vào phiếu học tập.',
        tasks: [
          'Xác định lĩnh vực mà nhóm em phụ trách (giao thông / y tế / giáo dục / gia đình).',
          'Tìm tranh ảnh hoặc hình dán thể hiện sự thay đổi và dán vào phiếu.',
          'Kể cho các bạn trong nhóm nghe về một thay đổi mà em đã tìm được.',
        ],
        teacherQuestions: [
          'Trong lĩnh vực nhóm em phụ trách, công nghệ thông minh mang lại điều tiện lợi nhất là gì?',
          'Nếu không có công nghệ này, chúng ta sẽ gặp bất tiện gì?',
        ],
        sentenceFrames: ['Nhờ công nghệ ______, việc ______ đã trở nên dễ dàng hơn rất nhiều.'],
        coreConcepts: ['Sự tiện lợi trong đời sống: Giúp tiết kiệm thời gian, công sức và bảo đảm an toàn.'],
      },
      ACT3: {
        title: 'Hoạt động 3 — Nỗ lực ứng phó',
        currentActivity: 'Tìm hiểu những khó khăn do thông tin hóa gây ra (khoảng cách số, lộ thông tin cá nhân) và nỗ lực khắc phục.',
        tasks: [
          'Xem ảnh bà cụ gặp khó khăn khi dùng máy gọi món tự động (kiosk).',
          'Thảo luận cùng bạn bè xem chúng ta có thể giúp đỡ điều gì.',
          'Dán giấy ghi suy nghĩ của em lên bảng chia sẻ ý kiến của nhóm.',
        ],
        teacherQuestions: [
          'Những người gặp khó khăn khi dùng thiết bị thông minh sẽ gặp trở ngại gì?',
          'Xã hội và chúng ta cần nỗ lực thế nào để mọi người cùng hạnh phúc?',
        ],
        sentenceFrames: ['Để giúp đỡ những người gặp khó khăn, chúng ta cần nỗ lực ______.'],
        coreConcepts: ['Khoảng cách số: Sự bất bình đẳng do khác biệt trong khả năng tiếp cận công nghệ.'],
      },
      CLOSE: {
        title: 'Tổng kết & Tự đánh giá',
        currentActivity: 'Ghi chép lại những điều đã học hôm nay và tự đánh giá bản thân.',
        tasks: [
          'Ghi 2 từ ngữ đáng nhớ nhất trong tiết học hôm nay vào vở.',
          'Tô màu vào các hình tròn tự kiểm tra trên trang 29 sách giáo khoa.',
          'Chào bạn cùng bàn và kết thúc tiết học hôm nay.',
        ],
        teacherQuestions: [
          'Hôm nay em đã biết thêm điều gì mới?',
          'Khi sống trong xã hội thông tin thông minh, em cần có thái độ như thế nào?',
        ],
        sentenceFrames: ['Trong tiết học hôm nay, em đã hiểu được ______.'],
        coreConcepts: ['Công dân số đúng đắn: Người sử dụng công nghệ an toàn và biết quan tâm đến người khác.'],
      },
    },
  },
  ru: {
    info: {
      subject: 'Обществознание (Начальная школа)',
      unit: '1. Общественные изменения и разнообразные культуры',
      topic: 'Изучение изменений в повседневной жизни благодаря интеллектуальной информатизации',
      goal: 'Уметь анализировать изменения в жизни, вызванные интеллектуальными технологиями.',
    },
    stages: {
      INTRO: {
        title: 'Введение',
        currentActivity: 'Вспомнить тему прошлого урока об информационном обществе и определить учебную задачу.',
        tasks: [
          'Посмотреть вместе с одноклассниками на фотографию на стр. 24 учебника.',
          'Записать в тетрадь тему и учебную цель, написанные на доске.',
          'Вспомнить свой опыт удобного использования смартфонов или компьютеров.',
        ],
        teacherQuestions: [
          'На прошлом уроке мы говорили об информационном обществе. Какую технику мы часто используем сегодня?',
          'Как искусственный интеллект и роботы меняют нашу жизнь?',
        ],
        sentenceFrames: ['Я пользуюсь ______ каждый день, и это очень удобно.'],
        coreConcepts: ['Информационное общество: Общество, где информация является главным ресурсом.'],
      },
      WAKE: {
        title: 'Пробуждение мыслей',
        currentActivity: 'Посмотреть на фото гостиной с роботом-пылесосом и умной колонкой, ответить на вопрос.',
        tasks: [
          'Внимательно рассмотреть иллюстрации и фото на стр. 25 учебника.',
          'Указать пальцем вместе с соседом по парте на 3 умных устройства на картинке.',
          'Выслушать вопрос учителя и подготовиться к обсуждению с соседом по парте.',
        ],
        teacherQuestions: [
          'Если сравнить дома прошлого и сегодняшние дома, в чем преимущества современного дома?',
          'Если роботы или искусственный интеллект работают вместо людей, на что мы можем потратить время?',
        ],
        sentenceFrames: ['Раньше людям приходилось делать ______ вручную, а сегодня машины помогают нам.'],
        coreConcepts: ['Сравнение: Способ мышления, выявляющий сходства и различия между предметами.'],
      },
      ACT1: {
        title: 'Задание 1 — Понятие «Интеллектуальная информатизация»',
        currentActivity: 'Прочитать текст учебника, понять смысл понятия и найти ключевые слова.',
        tasks: [
          'Проследить карандашом и прочитать первый абзац на стр. 26.',
          'Обвести в кружок слова «Искусственный интеллект (ИИ)» и «Информационные технологии».',
          'Сопоставить карточки со словами на доске вместе с соседом по парте.',
        ],
        teacherQuestions: [
          'Интеллектуальная информатизация — это объединение ИИ и технологий. Чем это отличается от обычной информатизации?',
          'Приведите примеры, когда машины мыслят и принимают решения подобно человеку?',
        ],
        sentenceFrames: ['Машина может самостоятельно оценивать и решать ______.'],
        coreConcepts: ['Интеллектуальная информатизация: Сочетание ИИ, больших данных и интернета вещей.'],
      },
      ACT2: {
        title: 'Задание 2 — Изменения в повседневной жизни',
        currentActivity: 'Вместе с группой оформить карточки об изменениях в транспорте, больницах, школе и дома.',
        tasks: [
          'Уточнить сферу своей группы (транспорт / медицина / образование / дом).',
          'Найти наклейки или картинки с изменениями и наклеить на рабочий лист.',
          'Рассказать ребятам в группе об одном найденном изменении.',
        ],
        teacherQuestions: [
          'Что стало самым удобным в сфере вашей группы благодаря умным технологиям?',
          'Какие неудобства возникли бы, если бы этих технологий не было?',
        ],
        sentenceFrames: ['Благодаря технологии ______ стало намного легче делать ______.'],
        coreConcepts: ['Удобство в жизни: Экономия времени, усилий и обеспечение безопасности.'],
      },
      ACT3: {
        title: 'Задание 3 — Преодоление трудностей',
        currentActivity: 'Узнать о трудностях (цифровое неравенство, утечка данных) и о путях их решения.',
        tasks: [
          'Посмотреть фото пожилого человека, которому трудно пользоваться терминалом заказа (киоском).',
          'Обсудить с друзьями, чем мы можем помочь, чтобы технологии были удобны всем.',
          'Прикрепить стикер со своей мыслью на доску мнений группы.',
        ],
        teacherQuestions: [
          'С какими трудностями сталкиваются соседи, которым трудно пользоваться смарт-устройствами?',
          'Какие усилия должно приложить общество и мы сами для счастливой жизни каждого?',
        ],
        sentenceFrames: ['Чтобы помочь тем, кто испытывает трудности, необходимы усилия по ______.'],
        coreConcepts: ['Цифровой разрыв: Неравенство из-за разницы в доступе к технологиям.'],
      },
      CLOSE: {
        title: 'Итог урока & Рефлексия',
        currentActivity: 'Записать выводы в тетрадь и подвести итоги своей работы.',
        tasks: [
          'Записать 2 самых запоминающихся слова сегодняшнего урока в тетрадь.',
          'Закрасить кружки самопроверки на стр. 29 учебника.',
          'Попрощаться с соседом по парте и завершить урок.',
        ],
        teacherQuestions: [
          'Что нового вы узнали на сегодняшнем уроке?',
          'Какое отношение должно быть у человека, живущего в умном обществе?',
        ],
        sentenceFrames: ['На сегодняшнем уроке я понял(а), что ______.'],
        coreConcepts: ['Цифровой гражданин: Человек, безопасно использующий технологии и заботящийся о людях.'],
      },
    },
  },
  'uz-Latn': {
    info: {
      subject: 'Boshlang‘ich Jamiyatshunoslik',
      unit: '1. Jamiyat o‘zgarishlari va turli madaniyatlar',
      topic: 'Intellektual axborotlashtirish tufayli o‘zgargan turmush tarzini o‘rganish',
      goal: 'Intellektual axborotlashtirish tufayli kundalik hayotdagi o‘zgarishlarni tahlil qila olish.',
    },
    stages: {
      INTRO: {
        title: 'Kirish',
        currentActivity: 'O‘tgan darsda o‘rganilgan axborot jamiyatini eslab, bugungi o‘rganish mavzusini aniqlaymiz.',
        tasks: [
          'Darslikning 24-betidagi rasmni do‘stlar bilan birgalikda ko‘rib chiqamiz.',
          'O‘qituvchi doskaga yozgan bugungi dars maqsadini daftarga yozamiz.',
          'Smartfon yoki kompyuterdan foydalanganda qulay bo‘lgan tajribalarni yodga olamiz.',
        ],
        teacherQuestions: [
          'O‘tgan darsda axborot jamiyati haqida o‘rgandik. Bugungi kunda biz qanday texnologiyalardan ko‘p foydalanamiz?',
          'Sun’iy intellekt va robotlar hayotimizni qanday o‘zgartirmoqda?',
        ],
        sentenceFrames: ['Men har kuni ______dan foydalanaman, bu juda qulay.'],
        coreConcepts: ['Axborot jamiyati: Axborot eng muhim boylik bo‘lgan jamiyat.'],
      },
      WAKE: {
        title: 'Fikrni uyg‘otish',
        currentActivity: 'Robot changyutgich va aqlli ovoz karnayi bo‘lgan xona rasmini ko‘rib, savolga javob beramiz.',
        tasks: [
          'Darslikning 25-betidagi rasm va fotosuratlarni diqqat bilan o‘rganamiz.',
          'Partadoshingiz bilan birga rasmdagi 3 ta maxsus aqlli mashinani ko‘rsating.',
          'O‘qituvchining savolini tinglab, partadoshingiz bilan suhbatlashishga tayyorlaning.',
        ],
        teacherQuestions: [
          'Qadimgi uy hayoti bilan solishtirganda, bugungi zamonaviy uyning qanday afzalliklari bor?',
          'Agar robotlar yoki sun’iy intellekt odamlar o‘rniga ish bajarsa, biz bo‘sh vaqtimizda nima qila olamiz?',
        ],
        sentenceFrames: ['Ilgari odamlar o‘zlari ______ qilishga majbur edi, ammo hozir texnika bajarib bergani juda qulay.'],
        coreConcepts: ['Solishtirish: Ikki narsaning o‘xshash va farqli tomonlarini aniqlash usuli.'],
      },
      ACT1: {
        title: '1-faoliyat — Intellektual axborotlashtirish ma’nosi',
        currentActivity: 'Darslik matnini o‘qib, "intellektual axborotlashtirish" ma’nosini va asosiy so‘zlarni topamiz.',
        tasks: [
          'Darslikning 26-betidagi birinchi xatboshini qalam bilan kuzatib o‘qiymiz.',
          '"Sun’iy intellekt (AI)" va "Axborot-kommunikatsiya texnologiyalari" so‘zlarini aylanaga olamiz.',
          'Doskadagi so‘z kartochkalarining ma’nosini partadoshingiz bilan moslashtiring.',
        ],
        teacherQuestions: [
          'Intellektual axborotlashtirish AI va axborot texnologiyalarining birlashuvidir. Bu oddiy axborotlashtirishdan nimasi bilan farq qiladi?',
          'Mashinalar odam kabi o‘ylab qaror qabul qilishiga qanday misollar bor?',
        ],
        sentenceFrames: ['Mashina o‘zi mustaqil ravishda ______ni baholaydi va qaror qiladi.'],
        coreConcepts: ['Intellektual axborotlashtirish: Sun’iy intellekt, katta ma’lumotlar va buyumlar interneti birlashuvi.'],
      },
      ACT2: {
        title: '2-faoliyat — Hayotdagi o‘zgarishlarni o‘rganish',
        currentActivity: 'Guruh bilan transport, shifoxona, maktab va uydagi o‘zgarishlarni kartochkalarga ajratamiz.',
        tasks: [
          'Guruhimizga berilgan sohani (transport / tibbiyot / ta’lim / uy) aniqlang.',
          'Rasmlar yoki stikerlardan o‘zgarishlarni topib, ish varag‘iga yopishtiring.',
          'O‘zingiz topgan bir o‘zgarishni guruh a’zolariga aytib bering.',
        ],
        teacherQuestions: [
          'Guruhimiz sohasida aqlli texnologiya tufayli eng qulay bo‘lgan narsa nima?',
          'Agar bu texnologiya bo‘lmaganida, qanday qiyinchiliklar yuzaga kelardi?',
        ],
        sentenceFrames: ['______ texnologiyasi tufayli ______ qilish ancha osonlashdi.'],
        coreConcepts: ['Hayotdagi qulaylik: Vaqt va kuchni tejaydi, xavfsizlikni ta’minlaydi.'],
      },
      ACT3: {
        title: '3-faoliyat — Qiyinchiliklarni yengish choralari',
        currentActivity: 'Texnologiya keltirib chiqaradigan qiyinchiliklar (raqamli tengsizlik, shaxsiy ma’lumotlar) va ularni hal qilishni o‘rganamiz.',
        tasks: [
          'Kioskdan (o‘zi buyurtma berish apparatidan) foydalanishga qiynalayotgan buvi rasmini ko‘ring.',
          'Barcha odamlar texnologiyadan qulay foydalanishi uchun biz qanday yordam bera olishimizni muhokama qiling.',
          'Guruh fikrlar doskasiga o‘z fikringiz yozilgan stikerni yopishtiring.',
        ],
        teacherQuestions: [
          'Aqlli qurilmalardan foydalana olmaydigan qo‘shnilarimiz qanday qiyinchiliklarga duch kelishadi?',
          'Hamma uchun baxtli jamiyat qurish uchun jamiyat va biz nima qilishimiz kerak?',
        ],
        sentenceFrames: ['Qiyinchilikka uchragan kishilar uchun ______ kabi sa’y-harakatlar kerak.'],
        coreConcepts: ['Raqamli tengsizlik: Yangi texnologiyalardan foydalanish imkoniyatidagi farqlar tufayli yuzaga keladigan tengsizlik.'],
      },
      CLOSE: {
        title: 'Xulosa & O‘zini baholash',
        currentActivity: 'Bugun o‘rgangan daftarni tartibga solib, o‘z o‘rganishingizni sarhisob qiling.',
        tasks: [
          'Bugungi darsda eng esda qolarli bo‘lgan 2 ta so‘zni daftarga yozing.',
          'Darslikning 29-betidagi "O‘zimni tekshiraman" doirachalarini bo‘yang.',
          'Partadoshingiz bilan xayrlashib, bugungi darsni yakunlang.',
        ],
        teacherQuestions: [
          'Bugungi darsda yangi nimalarni bilib oldingiz?',
          'Kelajakda intellektual axborot jamiyatida yashash uchun qanday munosabatda bo‘lishimiz kerak?',
        ],
        sentenceFrames: ['Bugungi darsda men ______ni bilib oldim.'],
        coreConcepts: ['Raqamli fuqaro: Texnologiyadan to‘g‘ri va xavfsiz foydalanadigan, boshqalarga g‘amxo‘rlik qiladigan inson.'],
      },
    },
  },
  'uz-Cyrl': {
    info: {
      subject: 'Бошланғич Жамиятшунослик',
      unit: '1. Жамият ўзгаришлари ва турли маданиятлар',
      topic: 'Интеллектуал ахборотлаштириш туфайли ўзгарган турмуш тарзини ўрганиш',
      goal: 'Интеллектуал ахборотлаштириш туфайли кундалик ҳаётдаги ўзгаришларни таҳлил қила олиш.',
    },
    stages: {
      INTRO: {
        title: 'Кириш',
        currentActivity: 'Ўтган дарсда ўрганилган ахборот жамиятини эслаб, бугунги ўрганиш мавзусини аниқлаймиз.',
        tasks: [
          'Дарсликнинг 24-бетидаги расмни дўстлар билан биргаликда кўриб чиқамиз.',
          'Ўқитувчи доскага ёзган бугунги дарс мақсадини дафтарга ёзамиз.',
          'Смартфон ёки компьютердан фойдаланганда қулай бўлган тажрибаларни ёдга оламиз.',
        ],
        teacherQuestions: [
          'Ўтган дарсда ахборот жамияти ҳақида ўргандик. Бугунги кунда биз қандай технологиялардан кўп фойдаланамиз?',
          'Сунъий интеллект ва роботлар ҳаётимизни қандай ўзгартирмоқда?',
        ],
        sentenceFrames: ['Мен ҳар куни ______дан фойдаланаман, бу жуда қулай.'],
        coreConcepts: ['Ахборот жамияти: Ахборот энг муҳим бойлик бўлган жамият.'],
      },
      WAKE: {
        title: 'Фикрни уйғотиш',
        currentActivity: 'Робот чангютгич ва ақлли овоз карнайи бўлган хона расмини кўриб, саволга жавоб берамиз.',
        tasks: [
          'Дарсликнинг 25-бетидаги расм ва фотосуратларни диққат билан ўрганамиз.',
          'Партадошингиз билан бирга расмдаги 3 та махсус ақлли машинани кўрсатинг.',
          'Ўқитувчининг саволини тинглаб, партадошингиз билан суҳбатлашишга тайёрланинг.',
        ],
        teacherQuestions: [
          'Қадимги уй ҳаёти билан солиштирганда, бугунги замонавий уйнинг қандай афзалликлари бор?',
          'Агар роботлар ёки сунъий интеллект одамлар ўрнига иш бажарса, биз бўш вақтимизда нима қила оламиз?',
        ],
        sentenceFrames: ['Илгари одамлар ўзлари ______ қилишга мажбур эди, аммо ҳозир техника бажариб бергани жуда қулай.'],
        coreConcepts: ['Солиштириш: Икки нарсанинг ўхшаш ва фарқли томонларини аниқлаш усули.'],
      },
      ACT1: {
        title: '1-фаолият — Интеллектуал ахборотлаштириш маъноси',
        currentActivity: 'Дарслик матнини ўқиб, "интеллектуал ахборотлаштириш" маъносини ва асосий сўзларни топамиз.',
        tasks: [
          'Дарсликнинг 26-бетидаги биринчи хатбошини қалам билан кузатиб ўқиймиз.',
          '"Сунъий интеллект (AI)" ва "Ахборот-коммуникация технологиялари" сўзларини айланага оламиз.',
          'Доскадаги сўз карточкаларининг маъносини партадошингиз билан мослаштиринг.',
        ],
        teacherQuestions: [
          'Интеллектуал ахборотлаштириш AI ва ахборот технологияларининг бирлашувидир. Бу оддий ахборотлаштиришдан нимаси билан фарқ қилади?',
          'Машиналар одам каби ўйлаб қарор қабул қилишига қандай мисоллар бор?',
        ],
        sentenceFrames: ['Машина ўзи мустақил равишда ______ни баҳолайди ва қарор қилади.'],
        coreConcepts: ['Интеллектуал ахборотлаштириш: Сунъий интеллект, катта маълумотлар ва буюмлар интернети бирлашуви.'],
      },
      ACT2: {
        title: '2-фаолият — Ҳаётдаги ўзгаришларни ўрганиш',
        currentActivity: 'Гуруҳ билан транспорт, шифохона, мактаб ва уйдаги ўзгаришларни карточкаларга ажратамиз.',
        tasks: [
          'Гуруҳимизга берилган соҳани (транспорт / тиббиёт / таълим / уй) аниқланг.',
          'Расмлар ёки стикерлардан ўзгаришларни топиб, иш варағига ёпиштиринг.',
          'Ўзингиз топган бир ўзгаришни гуруҳ аъзоларига айтиб беринг.',
        ],
        teacherQuestions: [
          'Гуруҳимиз соҳасида ақлли технология туфайли энг қулай бўлган нарса нима?',
          'Агар бу технология бўлмаганида, қандай қийинчиликлар юзага келарди?',
        ],
        sentenceFrames: ['______ технологияси туфайли ______ қилиш анча осонлашди.'],
        coreConcepts: ['Ҳаётдаги қулайлик: Вақт ва кучни тежайди, хавфсизликни таъминлайди.'],
      },
      ACT3: {
        title: '3-фаолият — Қийинчиликларни енгиш чоралари',
        currentActivity: 'Технология келтириб чиқарадиган қийинчиликлар (рақамли тенгсизлик, шахсий маълумотлар) ва уларни ҳал қилишни ўрганамиз.',
        tasks: [
          'Киоскдан фойдаланишга қийналаётган буви расмини кўринг.',
          'Барча одамлар технологиядан қулай фойдаланиши учун биз қандай ёрдам бера олишимизни муҳокама қилинг.',
          'Гуруҳ фикрлар доскасига ўз фикрингиз ёзилган стикерни ёпиштиринг.',
        ],
        teacherQuestions: [
          'Ақлли қурилмалардан фойдалана олмайдиган қўшниларимиз қандай қийинчиликларга дуч келишади?',
          'Ҳамма учун бахтли жамият қуриш учун жамият ва биз нима қилишимиз керак?',
        ],
        sentenceFrames: ['Қийинчиликка учраган кишилар учун ______ каби саъй-ҳаракатлар керак.'],
        coreConcepts: ['Рақамли тенгсизлик: Янги технологиялардан фойдаланиш имкониятидаги фарқлар туфайли юзага келадиган тенгсизлик.'],
      },
      CLOSE: {
        title: 'Хулоса & Ўзини баҳолаш',
        currentActivity: 'Бугун ўрганган дафтарни тартибга солиб, ўз ўрганишингизни сарҳисоб қилинг.',
        tasks: [
          'Бугунги дарсда энг эсда қоларли бўлган 2 та сўзни дафтарга ёзинг.',
          'Дарсликнинг 29-бетидаги "Ўзимни текшираман" доирачаларини бўянг.',
          'Партадошингиз билан хайрлашиб, бугунги дарсни якунланг.',
        ],
        teacherQuestions: [
          'Бугунги дарсда янги нималарни билиб олдингиз?',
          'Келажакда интеллектуал ахборот жамиятида яшаш учун қандай муносабатда бўлишимиз керак?',
        ],
        sentenceFrames: ['Бугунги дарсда мен ______ни билиб олдим.'],
        coreConcepts: ['Рақамли фуқаро: Технологиядан тўғри ва хавфсиз фойдаланадиган, бошқаларга ғамхўрлик қиладиган инсон.'],
      },
    },
  },
  'zh-Hans': {
    info: {
      subject: '小学社会',
      unit: '1. 社会变迁与多元文化',
      topic: '探究智能信息化带来的日常生活变化',
      goal: '能够分析智能信息化对日常生活所带来的各种变化。',
    },
    stages: {
      INTRO: {
        title: '导入',
        currentActivity: '回顾上节课学习的信息化社会，明确今天需要探究的学习问题。',
        tasks: [
          '和同学们一起看课本第24页的照片。',
          '把老师写在黑板上的今天学习目标抄写在笔记本上。',
          '在心里回忆使用智能手机或电脑时感受到的便利经历。',
        ],
        teacherQuestions: [
          '大家上节课学习了信息化社会对吧？当今时代我们经常使用哪些机器和技术呢？',
          '人工智能和机器人是如何改变我们生活的呢？',
        ],
        sentenceFrames: ['我每天都使用______，感到非常方便。'],
        coreConcepts: ['信息化社会：信息成为社会最重要资源的社会。'],
      },
      WAKE: {
        title: '启发思考',
        currentActivity: '观看配有扫地机器人和AI智能音箱的客厅照片，回答老师提出的问题。',
        tasks: [
          '仔细观察课本第25页的插图和照片。',
          '和同桌一起用手指指出图中3个特殊的智能机器。',
          '认真倾听老师的问题，准备好和同桌交流讨论。',
        ],
        teacherQuestions: [
          '与过去的家庭相比，今天的家庭有哪些优点？',
          '如果自主运行的机器人或AI代替人工作，我们可以怎样利用空闲时间？',
        ],
        sentenceFrames: ['过去人们必须亲自手动______，但今天机器帮我们完成，非常便利。'],
        coreConcepts: ['对比思考：找出两个对象的相似点与不同点的思维方法。'],
      },
      ACT1: {
        title: '活动 1 — 探究“智能信息化”的含义',
        currentActivity: '阅读课本内容，理解“智能信息化”的含义并找出核心词汇。',
        tasks: [
          '用铅笔跟着阅读课本第26页第一自然段。',
          '给“人工智能（AI）”和“信息通信技术（ICT）”这两个词画上圈。',
          '和同桌一起把黑板上的生词卡片意思对应起来。',
        ],
        teacherQuestions: [
          '智能信息化是指AI与信息技术的结合。这与单纯的信息化有什么不同？',
          '机器像人一样思考和判断有哪些具体的例子？',
        ],
        sentenceFrames: ['机器能够自主判断并决定______。'],
        coreConcepts: ['智能信息化：人工智能、大数据和物联网等信息技术与各领域深度结合。'],
      },
      ACT2: {
        title: '活动 2 — 了解日常生活中的变化',
        currentActivity: '与小组同学一起，在学习单上分类整理交通、医院、学校和家庭中的智能变化。',
        tasks: [
          '确认本小组负责的领域（交通 / 医疗 / 教育 / 家庭）。',
          '从贴纸或图画资料中找出生活变化并贴在学习单上。',
          '向组内同学们分享自己找到的一项具体生活变化。',
        ],
        teacherQuestions: [
          '在我们组负责的领域中，智能技术带来的最大便利是什么？',
          '如果没有这项技术，会产生怎样的不便？',
        ],
        sentenceFrames: ['得益于______技术，做______变得容易多了。'],
        coreConcepts: ['生活的便利：节省人们的时间和精力，保障人身安全。'],
      },
      ACT3: {
        title: '活动 3 — 应对变化的共同努力',
        currentActivity: '了解智能信息化可能带来的困难（数字鸿沟、隐私泄露）以及解决这些问题的努力。',
        tasks: [
          '看一张奶奶在使用自助点餐机（Kiosk）时遇到困难的照片。',
          '和朋友们讨论我们可以怎样帮助每个人都能方便地享受科技成果。',
          '把写有自己想法的便签贴在小组想法分享板上。',
        ],
        teacherQuestions: [
          '不擅长使用智能设备的邻里会遇到哪些困难？',
          '为了打造让所有人幸福的智能社会，社会和我们应当做出怎样的努力？',
        ],
        sentenceFrames: ['为了帮助遇到困难的邻里，我们需要做出______的努力。'],
        coreConcepts: ['数字鸿沟：因接触或利用新信息技术能力的差异而产生的不平等。'],
      },
      CLOSE: {
        title: '总结 & 自我反思',
        currentActivity: '整理今天的学习笔记，反思自己的学习收获。',
        tasks: [
          '把今天学到的最难忘的2个词语写在笔记本上。',
          '在课本第29页的“自我检查”圆圈上涂上颜色。',
          '和身边的同桌打招呼道别，结束今天的课程。',
        ],
        teacherQuestions: [
          '在今天的课程中你新学到了什么？',
          '在未来的智能信息社会中生活，我们应该具备怎样的心态？',
        ],
        sentenceFrames: ['在今天的课程中，我明白了______。'],
        coreConcepts: ['合格的数字公民：安全正确地使用技术，同时关爱体谅邻里的人。'],
      },
    },
  },
  'zh-Hant': {
    info: {
      subject: '國小社會',
      unit: '1. 社會變遷與多元文化',
      topic: '探討智慧資訊化帶來的日常生活變化',
      goal: '能夠分析智慧資訊化對日常生活所帶來的各種變化。',
    },
    stages: {
      INTRO: {
        title: '導入',
        currentActivity: '回顧上節課學習的資訊化社會，明確今天需要探討的學習問題。',
        tasks: [
          '和同學們一起看課本第24頁的照片。',
          '把老師寫在黑板上的今天學習目標抄寫在筆記本上。',
          '在心裡回憶使用智慧型手機或電腦時感受到的便利經歷。',
        ],
        teacherQuestions: [
          '大家上節課學習了資訊化社會對吧？當今時代我們經常使用哪些機器和技術呢？',
          '人工智慧和機器人是如何改變我們生活的呢？',
        ],
        sentenceFrames: ['我每天都使用______，感到非常方便。'],
        coreConcepts: ['資訊化社會：資訊成為社會最重要資源的社會。'],
      },
      WAKE: {
        title: '啟發思考',
        currentActivity: '觀看配有掃地機器人和AI智慧音箱的客廳照片，回答老師提出的問題。',
        tasks: [
          '仔細觀察課本第25頁的插圖和照片。',
          '和同桌一起用手指指出圖中3個特殊的智慧機器。',
          '認真傾聽老師的問題，準備好和同桌交流討論。',
        ],
        teacherQuestions: [
          '與過去的家庭相比，今天的家庭有哪些優點？',
          '如果自主運行的機器人或AI代替人工作，我們可以怎樣利用空閒時間？',
        ],
        sentenceFrames: ['過去人們必須親自動手______，但今天機器幫我們完成，非常便利。'],
        coreConcepts: ['對比思考：找出兩個對象的相似點與不同點的思維方法。'],
      },
      ACT1: {
        title: '活動 1 — 探究「智慧資訊化」的涵義',
        currentActivity: '閱讀課本內容，理解「智慧資訊化」的涵義並找出核心詞彙。',
        tasks: [
          '用鉛筆跟著閱讀課本第26頁第一自然段。',
          '給「人工智慧（AI）」和「資訊通信技術（ICT）」這兩個詞畫上圈。',
          '和同桌一起把黑板上的生字卡片意思對應起來。',
        ],
        teacherQuestions: [
          '智慧資訊化是指AI與資訊技術的結合。這與單純的資訊化有何不同？',
          '機器像人一樣思考和判斷有哪些具體的例子？',
        ],
        sentenceFrames: ['機器能夠自主判斷並決定______。'],
        coreConcepts: ['智慧資訊化：人工智慧、大數據和物聯網等資訊技術與各領域深度結合。'],
      },
      ACT2: {
        title: '活動 2 — 了解日常生活中的變化',
        currentActivity: '與小組同學一起，在學習單上分類整理交通、醫院、學校和家庭中的智慧變化。',
        tasks: [
          '確認本小組負責的領域（交通 / 醫療 / 教育 / 家庭）。',
          '從貼紙或圖畫資料中找出生活變化並貼在學習單上。',
          '向組內同學們分享自己找到的一項具體生活變化。',
        ],
        teacherQuestions: [
          '在我們組負責的領域中，智慧技術帶來的最大便利是什麼？',
          '如果沒有這項技術，會產生怎樣的不便？',
        ],
        sentenceFrames: ['得益於______技術，做______變得容易多了。'],
        coreConcepts: ['生活的便利：節省人們的時間和精力，保障人身安全。'],
      },
      ACT3: {
        title: '活動 3 — 應對變化的共同努力',
        currentActivity: '了解智慧資訊化可能帶來的困難（數位落差、隱私洩漏）以及解決這些問題的努力。',
        tasks: [
          '看一張奶奶在使用自助點餐機（Kiosk）時遇到困難的照片。',
          '和朋友們討論我們可以怎樣幫助每個人都能方便地享受科技成果。',
          '把寫有自己想法的便簽貼在小組想法分享板上。',
        ],
        teacherQuestions: [
          '不擅長使用智慧設備的鄰里會遇到哪些困難？',
          '為了打造讓所有人幸福的智慧社會，社會和我們應當做出怎樣的努力？',
        ],
        sentenceFrames: ['為了幫助遇到困難的鄰里，我們需要做出______的努力。'],
        coreConcepts: ['數位落差：因接觸或利用新資訊技術能力的差異而產生的不平等。'],
      },
      CLOSE: {
        title: '總結 & 自我反思',
        currentActivity: '整理今天的學習筆記，反思自己的學習收穫。',
        tasks: [
          '把今天學到的最難忘的2個詞語寫在筆記本上。',
          '在課本第29頁的「自我檢查」圓圈上塗上顏色。',
          '和身邊的同桌打招呼道別，結束今天的課程。',
        ],
        teacherQuestions: [
          '在今天的課程中你新學到了什麼？',
          '在未來的智慧資訊社會中生活，我們應該具備怎樣的心態？',
        ],
        sentenceFrames: ['在今天的課程中，我明白了______。'],
        coreConcepts: ['合格的數位公民：安全正確地使用技術，同時關愛體諒鄰里的人。'],
      },
    },
  },
  ko: {
    info: {
      subject: '초등 사회',
      unit: '1. 사회 변화와 다양한 문화',
      topic: '지능정보화로 달라진 생활 모습 살펴보기',
      goal: '지능정보화로 달라진 생활 모습의 변화를 분석할 수 있다.',
    },
    stages: {
      INTRO: {
        title: '도입',
        currentActivity: '지난 시간에 배운 정보화 사회를 떠올리고 오늘 배울 공부할 문제를 확인해요.',
        tasks: [
          '교과서 24쪽 사진을 친구들과 함께 보아요.',
          '선생님이 칠판에 적어주신 오늘의 배움 문제를 공책에 적어요.',
          '스마트폰이나 컴퓨터를 쓸 때 편리했던 경험을 마음속으로 떠올려요.',
        ],
        teacherQuestions: [
          '여러분, 지난 시간에 정보화 사회에 대해 배웠지요? 오늘날 우리는 어떤 기계와 기술을 자주 사용하나요?',
          '인공지능이나 로봇이 우리 생활을 어떻게 바꾸고 있을까요?',
        ],
        sentenceFrames: ['저는 매일 ______을(를) 사용해서 편리해요.'],
        coreConcepts: ['정보화 사회: 정보가 사회의 가장 중요한 자원이 되는 사회입니다.'],
      },
      WAKE: {
        title: '생각 깨우기',
        currentActivity: '로봇 청소기와 인공지능 스피커가 있는 거실 사진을 보고 질문에 답해요.',
        tasks: [
          '교과서 25쪽의 그림과 사진을 자세히 살펴봅니다.',
          '짝꿍과 함께 그림 속에 있는 특별한 기계 3가지를 손가락으로 짚어봅니다.',
          '선생님의 질문을 듣고 짝꿍과 이야기할 준비를 합니다.',
        ],
        teacherQuestions: [
          '옛날의 집 모습과 비교하여 오늘날 집의 모습은 어떤 점이 좋을까요?',
          '스스로 움직이는 로봇이나 인공지능이 사람 대신 일을 하면 우리는 어떤 시간을 보낼 수 있을까요?',
        ],
        sentenceFrames: ['옛날에는 사람이 직접 ______했지만, 오늘날에는 기계가 ______해 줘서 좋아요.'],
        coreConcepts: ['비교하기: 두 가지 대상의 비슷한 점과 다른 점을 찾아보는 생각 방법입니다.'],
      },
      ACT1: {
        title: '활동 1 — 지능정보화의 의미 알아보기',
        currentActivity: "'지능정보화'가 무슨 뜻인지 교과서 글을 읽고 핵심 단어를 찾아요.",
        tasks: [
          '교과서 26쪽 첫 번째 문단을 연필로 따라 읽어요.',
          "'인공지능', '정보통신기술'이라는 단어에 동그라미를 쳐요.",
          '칠판에 붙은 낱말 카드의 의미를 짝꿍과 맞춰보아요.',
        ],
        teacherQuestions: [
          '지능정보화란 인공지능과 정보통신기술이 합쳐진 것을 말합니다. 이것은 단순한 정보화와 무엇이 다를까요?',
          '기계가 사람처럼 생각하고 판단한다는 것은 어떤 예가 있을까요?',
        ],
        sentenceFrames: ['기계가 스스로 ______을(를) 판단해요.'],
        coreConcepts: ['지능정보화: 인공지능과 빅데이터, 사물인터넷 등의 정보통신기술이 다양한 분야와 결합하는 것을 말합니다.'],
      },
      ACT2: {
        title: '활동 2 — 지능정보화로 달라진 생활 모습 알아보기',
        currentActivity: '교통, 병원, 학교, 집에서 지능정보화로 달라진 점을 모둠 친구들과 함께 카드에 정리해요.',
        tasks: [
          '우리 모둠이 맡은 영역(교통/의료/교육/가정)을 확인해요.',
          '붙임 딱지나 그림 자료에서 변화된 모습을 찾아 학습지에 붙여요.',
          '내가 찾은 한 가지 변화를 모둠 친구들에게 말해줍니다.',
        ],
        teacherQuestions: [
          '우리가 맡은 생활 영역에서 지능정보 기술이 쓰여서 가장 편리해진 점은 무엇인가요?',
          '만약 이 기술이 없다면 어떤 불편함이 생길까요?',
        ],
        sentenceFrames: ['______ 기술 덕분에 ______하기가 훨씬 쉬워졌어요.'],
        coreConcepts: ['생활의 편리함: 지능정보 기술은 사람들의 시간과 노력을 아껴주고 안전을 지켜줍니다.'],
      },
      ACT3: {
        title: '활동 3 — 지능정보화에 대응하는 여러 가지 노력 알아보기',
        currentActivity: '지능정보화로 생길 수 있는 어려운 점(디지털 소외, 개인정보 유출)과 해결 노력을 알아봐요.',
        tasks: [
          '키오스크(무인 기계)를 쓰기 힘들어하시는 할머니 사진을 보아요.',
          '모든 사람이 편리하게 기술을 누리려면 우리가 무엇을 도와야 할지 친구들과 이야기해요.',
          '모둠 생각 나누기 판에 내 생각 스티커를 붙여요.',
        ],
        teacherQuestions: [
          '스마트 기기를 다루기 힘든 이웃은 어떤 어려움을 겪을까요?',
          '모든 사람이 행복한 지능정보 사회를 만들기 위해 사회와 우리는 어떤 노력을 해야 할까요?',
        ],
        sentenceFrames: ['어려움을 겪는 이웃을 위해 ______ 노력이 필요해요.'],
        coreConcepts: ['디지털 격차: 새로운 정보통신기술에 접근하거나 이를 활용하는 능력의 차이로 생기는 불평등입니다.'],
      },
      CLOSE: {
        title: '정리',
        currentActivity: '오늘 공부한 배움 공책을 정리하고, 스스로 배움을 되돌아보아요.',
        tasks: [
          '오늘 배운 가장 기억에 남는 낱말 2가지를 배움 공책에 적어요.',
          '교과서 29쪽의 \'스스로 확인해요\' 동그라미에 색칠해요.',
          '옆 친구와 인사하며 오늘 수업을 마쳐요.',
        ],
        teacherQuestions: [
          '오늘 수업에서 새롭게 알게 된 점은 무엇인가요?',
          '앞으로 지능정보 사회에서 살아갈 때 어떤 마음가짐을 가져야 할까요?',
        ],
        sentenceFrames: ['오늘 수업에서 ______을(를) 알게 되었어요.'],
        coreConcepts: ['올바른 디지털 시민: 기술을 안전하고 올바르게 사용하며, 이웃을 배려하는 사람입니다.'],
      },
    },
  },
};

export function getLocalizedStage(stageId: string, lang: LanguageCode): LocalizedStageContent | undefined {
  return LOCALIZED_DEFAULT_LESSON[lang]?.stages[stageId] || LOCALIZED_DEFAULT_LESSON.en?.stages[stageId];
}

export function getLocalizedLessonInfo(lang: LanguageCode): LocalizedLessonInfo {
  return LOCALIZED_DEFAULT_LESSON[lang]?.info || LOCALIZED_DEFAULT_LESSON.en?.info;
}
