import React from 'react';
import { GraduationCap, BookOpen, Globe, Sparkles, ArrowRight, Users } from 'lucide-react';
import { LanguageCode } from '../types/lesson';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';

interface LandingPageProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
}

const LANDING_COPY: Record<LanguageCode, {
  badge: string;
  titlePrefix: string;
  titleBrand: string;
  subtitle: string;
  studentTitle: string;
  studentDesc: string;
  studentCta: string;
  teacherTitle: string;
  teacherDesc: string;
  teacherCta: string;
  footer: string;
}> = {
  ko: {
    badge: '이주배경 초등학생을 위한 교실 수업 동행 플랫폼',
    titlePrefix: '우리 모두가 함께하는 교실, ',
    titleBrand: '함께ON',
    subtitle: '한국어가 아직 익숙하지 않아도 괜찮아요. 모국어로 수업 내용을 이해하고, 친구들과 같은 활동에 참여할 수 있습니다.',
    studentTitle: '학생으로 시작하기',
    studentDesc: '이름과 모국어를 선택하고, 선생님이 진행하는 오늘의 수업에 참여해요.',
    studentCta: '수업 참여하기',
    teacherTitle: '교사로 시작하기',
    teacherDesc: '수업 자료를 업로드하고, 학생들의 태블릿 화면과 활동 현황을 실시간으로 관리합니다.',
    teacherCta: '교사 관리 로그인',
    footer: '함께ON (TogetherON) · 모든 학생이 소외되지 않는 초등 교실 학습 지원 플랫폼',
  },
  en: {
    badge: 'Classroom Learning Companion for Multilingual Students',
    titlePrefix: 'A Classroom Where Everyone Learns Together, ',
    titleBrand: 'TogetherON',
    subtitle: 'It is okay if Korean is still new to you. Understand the lesson in your own language and join every activity with your classmates.',
    studentTitle: 'Start as Student',
    studentDesc: 'Enter your name and choose your language to join today’s class.',
    studentCta: 'Join Class',
    teacherTitle: 'Start as Teacher',
    teacherDesc: 'Upload lesson materials and manage student tablets and live progress.',
    teacherCta: 'Teacher Login',
    footer: 'TogetherON (함께ON) · Inclusive Elementary Classroom Support Platform',
  },
  vi: {
    badge: 'Nền tảng hỗ trợ học tập trên lớp cho học sinh đa ngôn ngữ',
    titlePrefix: 'Lớp học nơi tất cả cùng đồng hành, ',
    titleBrand: 'TogetherON',
    subtitle: 'Dù tiếng Hàn còn mới mẻ, em vẫn có thể hiểu bài bằng tiếng mẹ đẻ và tham gia mọi hoạt động cùng các bạn.',
    studentTitle: 'Bắt đầu với tư cách Học sinh',
    studentDesc: 'Nhập tên và chọn ngôn ngữ của em để tham gia tiết học hôm nay.',
    studentCta: 'Tham gia lớp học',
    teacherTitle: 'Bắt đầu với tư cách Giáo viên',
    teacherDesc: 'Tải lên tài liệu bài giảng và theo dõi tiến độ học tập của học sinh.',
    teacherCta: 'Đăng nhập Giáo viên',
    footer: 'TogetherON (함께ON) · Nền tảng hỗ trợ lớp học tiểu học hòa nhập',
  },
  ru: {
    badge: 'Платформа поддержки на уроках для многоязычных учеников',
    titlePrefix: 'Класс, где все учатся вместе — ',
    titleBrand: 'TogetherON',
    subtitle: 'Даже если корейский язык ещё непривычен, ты сможешь понимать урок на родном языке и участвовать в заданиях вместе с классом.',
    studentTitle: 'Начать как ученик',
    studentDesc: 'Введи имя и выбери родной язык, чтобы присоединиться к уроку.',
    studentCta: 'Войти на урок',
    teacherTitle: 'Начать как учитель',
    teacherDesc: 'Загружайте материалы урока и отслеживайте активность учеников в реальном времени.',
    teacherCta: 'Вход для учителя',
    footer: 'TogetherON (함께ON) · Платформа поддержки для начальной школы',
  },
  'uz-Latn': {
    badge: 'Ko‘p tilli o‘quvchilar uchun darsda ko‘makchi platforma',
    titlePrefix: 'Hamma birga o‘qiydigan sinf — ',
    titleBrand: 'TogetherON',
    subtitle: 'Koreys tili hali yangi bo‘lsa ham, darsni ona tilingizda tushunib, sinfdoshlar bilan birga qatnasha olasiz.',
    studentTitle: 'O‘quvchi sifatida boshlash',
    studentDesc: 'Ismingiz va tilingizni tanlab, bugungi darsga qo‘shiling.',
    studentCta: 'Darsga qo‘shilish',
    teacherTitle: 'O‘qituvchi sifatida boshlash',
    teacherDesc: 'Dars materiallarini yuklang va o‘quvchilar faoliyatini kuzatib boring.',
    teacherCta: 'O‘qituvchi kirishi',
    footer: 'TogetherON (함께ON) · Boshlang‘ich sinf o‘quvchilarini qo‘llab-quvvatlash platformasi',
  },
  'uz-Cyrl': {
    badge: 'Кўп тилли ўқувчилар учун дарсда кўмакчи платформа',
    titlePrefix: 'Ҳамма бирга ўқийдиган синф — ',
    titleBrand: 'TogetherON',
    subtitle: 'Корейс тили ҳали янги бўлса ҳам, дарсни она тилингизда тушуниб, синфдошлар билан бирга қатнаша оласиз.',
    studentTitle: 'Ўқувчи сифатида бошлаш',
    studentDesc: 'Исмингиз ва тилингизни танлаб, бугунги дарсга қўшилинг.',
    studentCta: 'Дарсга қўшилиш',
    teacherTitle: 'Ўқитувчи сифатида бошлаш',
    teacherDesc: 'Дарс материалларини юкланг ва ўқувчилар фаолиятини кузатиб боринг.',
    teacherCta: 'Ўқитувчи кириши',
    footer: 'TogetherON (함께ON) · Бошланғич синф ўқувчиларини қўллаб-қувватлаш платформаси',
  },
  'zh-Hans': {
    badge: '面向多语种小学生的课堂学习辅助平台',
    titlePrefix: '大家一起学习的教室，',
    titleBrand: 'TogetherON',
    subtitle: '即使还不熟悉韩语也没关系，你可以用母语理解课堂内容，和同学们一起参加活动。',
    studentTitle: '以学生身份开始',
    studentDesc: '输入名字并选择母语，加入今天的课堂。',
    studentCta: '加入课堂',
    teacherTitle: '以教师身份开始',
    teacherDesc: '上传课堂资料，实时管理学生平板画面与学习进度。',
    teacherCta: '教师登录',
    footer: 'TogetherON (함께ON) · 小学课堂学习支持平台',
  },
  'zh-Hant': {
    badge: '面向多語種小學生的課堂學習輔助平台',
    titlePrefix: '大家一起學習的教室，',
    titleBrand: 'TogetherON',
    subtitle: '即使還不熟悉韓語也沒關係，你可以用母語理解課堂內容，和同學們一起參加活動。',
    studentTitle: '以學生身分開始',
    studentDesc: '輸入名字並選擇母語，加入今天的課堂。',
    studentCta: '加入課堂',
    teacherTitle: '以教師身分開始',
    teacherDesc: '上傳課堂資料，即時管理學生平板畫面與學習進度。',
    teacherCta: '教師登入',
    footer: 'TogetherON (함께ON) · 小學課堂學習支持平台',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onSelectStudent,
  onSelectTeacher,
}) => {
  const copy = LANDING_COPY[selectedLanguage] || LANDING_COPY.en;

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex flex-col justify-between">
      {/* Top Brand Header & Language Selector */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
              함께ON
            </span>
            <span className="text-xs font-semibold text-amber-700 tracking-wide">
              TogetherON
            </span>
          </div>
        </div>

        {/* 8-Language Quick Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white border border-amber-200/80 p-1.5 rounded-2xl shadow-2xs">
          <Globe className="w-4 h-4 text-amber-600 ml-1.5 mr-0.5 shrink-0" />
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Hero & Role Selection */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{copy.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {copy.titlePrefix}
              <span className="text-amber-600">{copy.titleBrand}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {copy.subtitle}
            </p>
          </div>

          {/* Two Large Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Student Entry Card */}
            <button
              type="button"
              onClick={onSelectStudent}
              className="group text-left bg-white hover:bg-amber-50/40 border-2 border-amber-200 hover:border-amber-500 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[230px]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  {copy.studentTitle}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {copy.studentDesc}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-amber-700 font-bold text-base">
                <span>{copy.studentCta}</span>
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            {/* Teacher Entry Card */}
            <button
              type="button"
              onClick={onSelectTeacher}
              className="group text-left bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-600 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[230px]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  {copy.teacherTitle}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {copy.teacherDesc}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-indigo-700 font-bold text-base">
                <span>{copy.teacherCta}</span>
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        {copy.footer}
      </footer>
    </div>
  );
};
