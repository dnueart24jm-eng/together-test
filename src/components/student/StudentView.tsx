import React, { useState } from 'react';
import {
  HelpCircle,
  ListTodo,
  Lightbulb,
  MessageSquare,
  SlidersHorizontal,
} from 'lucide-react';
import {
  LessonData,
  LessonStage,
  LanguageCode,
  KoreanLevel,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { StageProgressBar } from './StageProgressBar';
import { MenuWhatAreWeDoing } from './MenuWhatAreWeDoing';
import { MenuWhatShouldIDo } from './MenuWhatShouldIDo';
import { MenuWhatShouldIThink } from './MenuWhatShouldIThink';
import { MenuHowDoISayIt } from './MenuHowDoISayIt';
import { BookMarked } from 'lucide-react';

interface StudentViewProps {
  lessonData: LessonData;
  currentStageId: string;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  onOpenSettings: () => void;
  classCode?: string;
  studentId?: string;
  studentNickname?: string;
  onOpenCommunication?: () => void;
  onOpenNotebook?: () => void;
  initialTaskStates?: Record<string, { status: any }>;
}

export type StudentMenuId = 'menu1' | 'menu2' | 'menu3' | 'menu4';

export const StudentView: React.FC<StudentViewProps> = ({
  lessonData,
  currentStageId,
  studentLanguage,
  koreanLevel,
  onOpenSettings,
  classCode,
  studentId,
  studentNickname,
  onOpenCommunication,
  onOpenNotebook,
  initialTaskStates,
}) => {
  const isDefaultLesson = lessonData.info.topic === '지능정보화로 달라진 생활 모습 살펴보기';
  const [activeMenu, setActiveMenu] = useState<StudentMenuId>('menu1');
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;

  const currentStage: LessonStage =
    lessonData.stages.find((s) => s.id === currentStageId) ||
    lessonData.stages[0];

  const menuItems = [
    {
      id: 'menu1' as StudentMenuId,
      num: '1',
      primaryTitle: studentLanguage === 'ko' ? ui.menu1.titleKo : ui.menu1.titleNative,
      koreanSub: studentLanguage === 'ko' ? '' : ui.menu1.titleKo,
      icon: HelpCircle,
      activeColor: 'bg-sky-50 text-sky-900 border-sky-400 ring-2 ring-sky-300/40',
      tagColor: 'bg-sky-500 text-white',
    },
    {
      id: 'menu2' as StudentMenuId,
      num: '2',
      primaryTitle: studentLanguage === 'ko' ? ui.menu2.titleKo : ui.menu2.titleNative,
      koreanSub: studentLanguage === 'ko' ? '' : ui.menu2.titleKo,
      icon: ListTodo,
      activeColor: 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300/40',
      tagColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'menu3' as StudentMenuId,
      num: '3',
      primaryTitle: studentLanguage === 'ko' ? ui.menu3.titleKo : ui.menu3.titleNative,
      koreanSub: studentLanguage === 'ko' ? '' : ui.menu3.titleKo,
      icon: Lightbulb,
      activeColor: 'bg-purple-50 text-purple-900 border-purple-400 ring-2 ring-purple-300/40',
      tagColor: 'bg-purple-600 text-white',
    },
    {
      id: 'menu4' as StudentMenuId,
      num: '4',
      primaryTitle: studentLanguage === 'ko' ? ui.menu4.titleKo : ui.menu4.titleNative,
      koreanSub: studentLanguage === 'ko' ? '' : ui.menu4.titleKo,
      icon: MessageSquare,
      activeColor: 'bg-amber-50 text-amber-950 border-amber-400 ring-2 ring-amber-300/40',
      tagColor: 'bg-amber-500 text-white',
    },
  ];

  const bottomLabels: Record<LanguageCode, { currentLang: string; koreanLevel: string; changeBtn: string }> = {
    en: { currentLang: 'My Language', koreanLevel: 'Korean Level', changeBtn: 'Change Language / Level' },
    vi: { currentLang: 'Ngôn ngữ của em', koreanLevel: 'Trình độ tiếng Hàn', changeBtn: 'Đổi ngôn ngữ / Trình độ' },
    ru: { currentLang: 'Мой язык', koreanLevel: 'Уровень корейского', changeBtn: 'Сменить язык / Уровень' },
    'uz-Latn': { currentLang: 'Mening tilim', koreanLevel: 'Koreys tili darajasi', changeBtn: 'Til / Darajani o‘zgartirish' },
    'uz-Cyrl': { currentLang: 'Менинг тилим', koreanLevel: 'Корейс тили даражаси', changeBtn: 'Тил / Даражани ўзгартириш' },
    'zh-Hans': { currentLang: '我的母语', koreanLevel: '韩语理解水平', changeBtn: '切换语言与水平' },
    'zh-Hant': { currentLang: '我的母語', koreanLevel: '韓語理解水平', changeBtn: '切換語言與水平' },
    ko: { currentLang: '현재 언어', koreanLevel: '한국어 수준', changeBtn: '언어 및 수준 변경' },
  };

  const bText = bottomLabels[studentLanguage] || bottomLabels.en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Stage Progress Map */}
      <StageProgressBar
        stages={lessonData.stages}
        currentStageId={currentStageId}
        studentLanguage={studentLanguage}
        isDefaultLesson={isDefaultLesson}
      />

      {/* 2. Four Core Question Menus Tab Navigation - Native Language First! */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveMenu(item.id)}
              className={`flex flex-col p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? `${item.activeColor} shadow-xs font-bold`
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                    isActive ? item.tagColor : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.num}
                </span>
                <IconComponent
                  className={`w-4 h-4 ${
                    isActive ? 'text-current' : 'text-slate-400'
                  }`}
                />
              </div>

              {/* Native title prominent */}
              <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {item.primaryTitle}
              </span>

              {/* Korean subtitle as reference */}
              {item.koreanSub && (
                <span className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
                  {item.koreanSub}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Action Ribbon: Communication Helper & My Notebook */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 rounded-2xl border border-amber-200/50">
        <div className="flex items-center gap-2">
          {studentNickname && (
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              👤 {studentNickname}
            </span>
          )}
          {classCode && (
            <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              수업 코드: {classCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenCommunication && (
            <button
              type="button"
              onClick={onOpenCommunication}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>의사소통 도우미 (말하기/듣기)</span>
            </button>
          )}

          {onOpenNotebook && (
            <button
              type="button"
              onClick={onOpenNotebook}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>나만의 한국어 노트</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Active Menu Content Area */}
      <main>
        {activeMenu === 'menu1' && (
          <MenuWhatAreWeDoing
            lessonInfo={lessonData.info}
            stage={currentStage}
            studentLanguage={studentLanguage}
            koreanLevel={koreanLevel}
            classCode={classCode}
            studentId={studentId}
          />
        )}

        {activeMenu === 'menu2' && (
          <MenuWhatShouldIDo
            stage={currentStage}
            studentLanguage={studentLanguage}
            koreanLevel={koreanLevel}
            classCode={classCode}
            studentId={studentId}
            isDefaultLesson={isDefaultLesson}
            initialTaskStates={initialTaskStates}
          />
        )}

        {activeMenu === 'menu3' && (
          <MenuWhatShouldIThink
            lessonInfo={lessonData.info}
            stage={currentStage}
            studentLanguage={studentLanguage}
            koreanLevel={koreanLevel}
          />
        )}

        {activeMenu === 'menu4' && (
          <MenuHowDoISayIt
            lessonInfo={lessonData.info}
            stage={currentStage}
            studentLanguage={studentLanguage}
            koreanLevel={koreanLevel}
            classCode={classCode}
            studentId={studentId}
          />
        )}
      </main>

      {/* 4. Bottom Safety & Settings Ribbon */}
      <footer className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{bText.currentLang}: <strong className="text-slate-800 font-bold">{studentLanguage}</strong></span>
          <span aria-hidden="true">·</span>
          <span>{bText.koreanLevel}: <strong className="text-slate-800 font-bold">{koreanLevel}</strong></span>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>{bText.changeBtn}</span>
        </button>
      </footer>
    </div>
  );
};
