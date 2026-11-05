import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Volume2,
  Trash2,
  X,
  Sparkles,
  Search,
  Folder,
  FolderPlus,
  Edit3,
  Check,
  Bookmark,
} from 'lucide-react';
import { LanguageCode, NotebookItem, NotebookFolder } from '../../types/lesson';
import {
  fetchNotebookData,
  saveNotebookItem,
  updateNotebookItem,
  deleteNotebookItem,
  createNotebookFolder,
  renameNotebookFolder,
  lookupNotebookExpression,
  speakKoreanText,
} from '../../services/apiService';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentLanguage: LanguageCode;
  classCode: string;
  studentId: string;
  studentNickname: string;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  studentLanguage,
  classCode,
  studentId,
  studentNickname,
}) => {
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [folders, setFolders] = useState<NotebookFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  // AI Lookup state
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<{
    koreanText: string;
    nativeText: string;
    explanation: string;
    exampleSentence: string;
    pronunciation: string;
  } | null>(null);
  const [lookupSavedMsg, setLookupSavedMsg] = useState<string | null>(null);

  // Folder creation / rename state
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');

  // Item edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editKorean, setEditKorean] = useState<string>('');
  const [editNative, setEditNative] = useState<string>('');

  const loadData = async () => {
    if (!classCode || !studentId) return;
    setLoading(true);
    try {
      const data = await fetchNotebookData(classCode, studentId);
      setItems(data.items);
      setFolders(data.folders);
    } catch (err) {
      console.error('Failed to load notebook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setLookupResult(null);
      setLookupSavedMsg(null);
    }
  }, [isOpen, classCode, studentId]);

  if (!isOpen) return null;

  const handleAiLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLookupLoading(true);
    setLookupSavedMsg(null);
    try {
      const res = await lookupNotebookExpression(searchQuery.trim(), studentLanguage);
      setLookupResult(res);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSaveLookupResult = async () => {
    if (!lookupResult) return;
    const targetFolder = selectedFolderId !== 'all' ? selectedFolderId : 'folder_words';
    const res = await saveNotebookItem(classCode, studentId, {
      type: 'word',
      koreanText: lookupResult.koreanText,
      nativeText: lookupResult.nativeText,
      pronunciation: lookupResult.pronunciation,
      exampleSentence: lookupResult.exampleSentence,
      folderId: targetFolder,
    });
    if (res.success) {
      if (res.items) setItems(res.items);
      if (res.folders) setFolders(res.folders);
      setLookupSavedMsg(res.duplicate ? '이미 노트에 저장된 표현입니다.' : '내 노트에 저장되었습니다!');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const res = await createNotebookFolder(classCode, studentId, newFolderName.trim());
    if (res.success && res.folders) {
      setFolders(res.folders);
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) return;
    const res = await renameNotebookFolder(classCode, studentId, folderId, editingFolderName.trim());
    if (res.success && res.folders) {
      setFolders(res.folders);
      setEditingFolderId(null);
    }
  };

  const handleMoveItemFolder = async (noteId: string, folderId: string) => {
    const res = await updateNotebookItem(classCode, studentId, noteId, { folderId });
    if (res.success && res.items) {
      setItems(res.items);
    }
  };

  const handleSaveItemEdit = async (noteId: string) => {
    if (!editKorean.trim() || !editNative.trim()) return;
    const res = await updateNotebookItem(classCode, studentId, noteId, {
      koreanText: editKorean.trim(),
      nativeText: editNative.trim(),
    });
    if (res.success && res.items) {
      setItems(res.items);
      setEditingItemId(null);
    }
  };

  const handleDelete = async (noteId: string) => {
    const res = await deleteNotebookItem(classCode, studentId, noteId);
    if (res.items) {
      setItems(res.items);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== noteId));
    }
  };

  const handleSpeak = (id: string, text: string) => {
    setSpeakingId(id);
    speakKoreanText(text, speechRate);
    setTimeout(() => setSpeakingId(null), 1500);
  };

  const filteredItems = items.filter((item) => {
    const matchesFolder = selectedFolderId === 'all' || item.folderId === selectedFolderId;
    const matchesSearch =
      !searchQuery.trim() ||
      item.koreanText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nativeText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {({
                  ko: '나만의 한국어 노트',
                  en: 'My Korean Notebook',
                  vi: 'Sổ tay tiếng Hàn của em',
                  ru: 'Мой блокнот корейского языка',
                  'uz-Latn': 'Mening koreys tili daftarim',
                  'uz-Cyrl': 'Менинг корейс тили дафтарим',
                  'zh-Hans': '我的韩语笔记本',
                  'zh-Hant': '我的韓語筆記本',
                } as Record<LanguageCode, string>)[studentLanguage] || 'My Korean Notebook'}
              </h3>
              <p className="text-xs text-amber-100">
                {studentNickname} ·{' '}
                {({
                  ko: '궁금한 한국어를 검색하고 폴더별로 정리해요',
                  en: 'Search Korean words and organize them into folders',
                  vi: 'Tìm kiếm từ tiếng Hàn và sắp xếp theo thư mục',
                  ru: 'Ищи корейские слова и сохраняй их по папкам',
                  'uz-Latn': 'Koreyscha so‘zlarni qidiring va papkalarga saqlang',
                  'uz-Cyrl': 'Корейсча сўзларни қидиринг ва папкаларга сақланг',
                  'zh-Hans': '搜索韩语单词并按文件夹整理',
                  'zh-Hant': '搜尋韓語單字並按資料夾整理',
                } as Record<LanguageCode, string>)[studentLanguage] || 'Search Korean words and organize them into folders'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 1. Search-Centric Interface + AI Lookup */}
          <form onSubmit={handleAiLookup} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="궁금한 한국어 단어, 문장 또는 모국어 표현을 입력하세요 (예: 지능정보화, I want to help)"
                className="w-full text-xs sm:text-sm font-medium pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading || !searchQuery.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lookupLoading ? '검색 중...' : 'AI 뜻풀이 검색'}</span>
            </button>
          </form>

          {/* AI Lookup Result Card */}
          {lookupResult && (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2.5 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase">AI 검색 결과</span>
                  <h4 className="text-lg font-black text-slate-900">{lookupResult.koreanText}</h4>
                  {lookupResult.pronunciation && (
                    <p className="text-xs font-mono text-amber-700">[{lookupResult.pronunciation}]</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSpeak('lookup', lookupResult.koreanText)}
                    className="p-2 bg-white text-amber-700 hover:bg-amber-100 rounded-xl border border-amber-200"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLookupResult}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>내 노트에 저장</span>
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-800">{lookupResult.nativeText}</p>
              <p className="text-xs text-slate-700 leading-relaxed">{lookupResult.explanation}</p>
              {lookupResult.exampleSentence && (
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60 text-xs text-slate-800 flex items-center justify-between">
                  <span>예문: <strong>{lookupResult.exampleSentence}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleSpeak('lookup-ex', lookupResult.exampleSentence)}
                    className="text-amber-700 hover:text-amber-900 p-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {lookupSavedMsg && (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{lookupSavedMsg}</span>
                </p>
              )}
            </div>
          )}

          {/* 2. Folder Tabs & Speed Control */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFolderId('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  selectedFolderId === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체 ({items.length})
              </button>

              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center">
                  {editingFolderId === folder.id ? (
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="text-xs w-24 bg-white px-1.5 py-0.5 rounded border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameFolder(folder.id)}
                        className="text-emerald-600 p-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      onDoubleClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                        selectedFolderId === folder.id
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="더블클릭하여 폴더 이름 변경"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>{folder.name}</span>
                    </button>
                  )}
                </div>
              ))}

              {isAddingFolder ? (
                <form onSubmit={handleCreateFolder} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="새 폴더명"
                    className="text-xs w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg"
                    autoFocus
                  />
                  <button type="submit" className="p-1 bg-emerald-600 text-white rounded-lg text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingFolder(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>
                    {({
                      ko: '폴더 추가',
                      en: 'Add Folder',
                      vi: 'Thêm thư mục',
                      ru: 'Добавить папку',
                      'uz-Latn': 'Papka qo‘shish',
                      'uz-Cyrl': 'Папка қўшиш',
                      'zh-Hans': '添加文件夹',
                      'zh-Hant': '新增資料夾',
                    } as Record<LanguageCode, string>)[studentLanguage] || 'Add Folder'}
                  </span>
                </button>
              )}
            </div>

            {/* Pronunciation Speed */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setSpeechRate(0.75)}
                className={`px-2 py-0.5 rounded-lg ${
                  speechRate === 0.75 ? 'bg-amber-500 text-white' : 'text-slate-600'
                }`}
              >
                0.75x
              </button>
              <button
                type="button"
                onClick={() => setSpeechRate(1.0)}
                className={`px-2 py-0.5 rounded-lg ${
                  speechRate === 1.0 ? 'bg-amber-500 text-white' : 'text-slate-600'
                }`}
              >
                1.0x
              </button>
            </div>
          </div>

          {/* 3. Saved Items List */}
          <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                {({
                  ko: '노트를 불러오는 중...',
                  en: 'Loading notebook...',
                  vi: 'Đang tải sổ tay...',
                  ru: 'Загрузка блокнота...',
                  'uz-Latn': 'Daftar yuklanmoqda...',
                  'uz-Cyrl': 'Дафтар юкланмоқда...',
                  'zh-Hans': '正在加载笔记本...',
                  'zh-Hant': '正在載入筆記本...',
                } as Record<LanguageCode, string>)[studentLanguage] || 'Loading notebook...'}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                {({
                  ko: '저장된 항목이 없습니다. 위 검색창에서 단어를 검색하거나 수업 화면에서 북마크를 눌러보세요!',
                  en: 'No saved items yet. Search a word above or tap the bookmark icon during class!',
                  vi: 'Chưa có mục nào được lưu. Hãy tìm từ ở trên hoặc nhấn biểu tượng đánh dấu trong giờ học!',
                  ru: 'Пока нет сохранённых записей. Найди слово выше или нажми на закладку на уроке!',
                  'uz-Latn': 'Hali saqlangan so‘zlar yo‘q. Yuqoridan qidiring yoki darsda xatcho‘pni bosing!',
                  'uz-Cyrl': 'Ҳали сақланган сўзлар йўқ. Юқоридан қидиринг ёки дарсда хатчўпни босинг!',
                  'zh-Hans': '暂无保存的内容。请在上方搜索单词或在课堂页面点击书签图标！',
                  'zh-Hant': '暫無儲存的內容。請在上方搜尋單字或在課堂頁面點擊書籤圖示！',
                } as Record<LanguageCode, string>)[studentLanguage] || 'No saved items yet. Search a word above or tap the bookmark icon during class!'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-colors flex items-start justify-between gap-3 shadow-2xs"
                >
                  {editingItemId === item.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editKorean}
                        onChange={(e) => setEditKorean(e.target.value)}
                        className="w-full text-sm font-bold px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editNative}
                        onChange={(e) => setEditNative(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveItemEdit(item.id)}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <select
                            value={item.folderId || 'folder_words'}
                            onChange={(e) => handleMoveItemFolder(item.id, e.target.value)}
                            className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                            title="폴더 이동"
                          >
                            {folders.map((f) => (
                              <option key={f.id} value={f.id}>
                                📁 {f.name}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-slate-400 ml-auto">{item.dateSaved}</span>
                        </div>

                        <p className="text-sm sm:text-base font-bold text-slate-900">{item.koreanText}</p>
                        {item.pronunciation && (
                          <p className="text-xs text-amber-700 font-medium">[{item.pronunciation}]</p>
                        )}
                        <p className="text-xs text-slate-600 mt-0.5">{item.nativeText}</p>
                        {item.exampleSentence && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">예: {item.exampleSentence}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.id, item.koreanText)}
                          className={`p-2 rounded-lg transition-colors ${
                            speakingId === item.id
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="발음 듣기"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditKorean(item.koreanText);
                            setEditNative(item.nativeText);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
