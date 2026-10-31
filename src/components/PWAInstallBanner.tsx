import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onDismiss,
  showDismiss = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If running as standalone app, no need to show
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSModal(true);
    }
  };

  const handleClose = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <>
      {/* Sleek In-App Mobile Install Banner */}
      <div className="mx-4 my-2.5 p-3.5 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white rounded-2xl shadow-lg border border-gray-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <Smartphone className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black bg-white text-black px-1.5 py-0.2 rounded font-mono">
                APP
              </span>
              <p className="text-xs font-bold truncate">
                iOS / 안드로이드 앱으로 설치
              </p>
            </div>
            <p className="text-[11px] text-gray-300 truncate mt-0.5">
              홈 화면에 추가해 실시간 호가 푸시 및 전체화면 지원
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            type="button"
            className="px-3 py-1.5 bg-white hover:bg-gray-100 active:scale-95 text-black text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>설치</span>
          </button>

          {showDismiss && (
            <button
              onClick={handleClose}
              type="button"
              aria-label="닫기"
              className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950">
                    iOS / iPhone 홈 화면 설치 안내
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Apple Safari 브라우저에서 3초 만에 설치 가능합니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="mt-4 space-y-3.5">
              {/* Step 1 */}
              <div className="p-3.5 bg-gray-50 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs text-gray-700">
                  <p className="font-bold text-gray-950 flex items-center gap-1.5">
                    Safari 하단 툴바의 <strong>[공유]</strong> 아이콘 누르기
                    <Share className="w-4 h-4 text-blue-600 inline" />
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    화면 하단 중앙의 네모 박스에 위로 뻗은 화살표 아이콘을 터치합니다.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-gray-50 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs text-gray-700">
                  <p className="font-bold text-gray-950 flex items-center gap-1.5">
                    메뉴에서 <strong>[홈 화면에 추가]</strong> 선택
                    <PlusSquare className="w-4 h-4 text-gray-800 inline" />
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    공유 메뉴 리스트를 아래로 스크롤하여 홈 화면에 추가를 선택합니다.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-gray-50 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs text-gray-700">
                  <p className="font-bold text-gray-950 flex items-center gap-1.5">
                    우측 상단 <strong>[추가]</strong> 터치 완료
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    아이폰 홈 화면에 전용 앱 아이콘이 생성되며 독립 앱으로 실행됩니다.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              type="button"
              className="mt-5 w-full py-3.5 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl text-xs transition-colors"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
    </>
  );
};
