import { LanguageCode } from '../types/lesson';

export interface SpeechRecognitionResultState {
  transcript: string;
  isFinal: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function getRecognitionLanguageCode(lang: LanguageCode): string {
  switch (lang) {
    case 'en':
      return 'en-US';
    case 'vi':
      return 'vi-VN';
    case 'ru':
      return 'ru-RU';
    case 'uz-Latn':
    case 'uz-Cyrl':
      return 'uz-UZ';
    case 'zh-Hans':
      return 'zh-CN';
    case 'zh-Hant':
      return 'zh-TW';
    case 'ko':
    default:
      return 'ko-KR';
  }
}

export function createSpeechRecognizer(
  lang: LanguageCode,
  onResult: (text: string, isFinal: boolean) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRec();

  recognition.lang = getRecognitionLanguageCode(lang);
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    onResult(final || interim, Boolean(final));
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition event error:', event.error);
    if (event.error === 'not-allowed') {
      onError('마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해 주세요.');
    } else if (event.error === 'no-speech') {
      onError('음성이 감지되지 않았습니다. 다시 말씀해 보세요.');
    } else {
      onError('음성을 인식하지 못했습니다. 텍스트로 직접 입력할 수 있습니다.');
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    },
  };
}
