'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Loader2, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRecoverPassword } from '@/lib/api/hooks';

export default function RecoverPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 새 복구코드 모달 상태
  const [showNewCodeModal, setShowNewCodeModal] = useState(false);
  const [newRecoveryCode, setNewRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const recover = useRecoverPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!recoveryCode.trim()) {
      setError('복구 코드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    recover.mutate(
      {
        nickname: nickname.trim(),
        recoveryCode: recoveryCode.trim(),
        newPassword,
        newPasswordConfirm,
      },
      {
        onSuccess: (data) => {
          setNewRecoveryCode(data.newRecoveryCode);
          setShowNewCodeModal(true);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : '비밀번호 복구에 실패했습니다.');
        },
      }
    );
  };

  const handleCopyRecoveryCode = async () => {
    try {
      await navigator.clipboard.writeText(newRecoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = newRecoveryCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmAndLogin = () => {
    if (!confirmed) return;
    router.push('/login');
  };

  // 복구 코드 입력 포맷팅 (XXXX-XXXX-XXXX)
  const handleRecoveryCodeChange = (value: string) => {
    // 영숫자만 허용하고 대문자로 변환
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // 포맷팅 (4자리마다 하이픈)
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 12; i += 4) {
      parts.push(cleaned.slice(i, i + 4));
    }

    setRecoveryCode(parts.join('-'));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-lg">비밀번호 복구</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">비밀번호 복구</CardTitle>
            <CardDescription>
              회원가입 시 발급받은 복구 코드로 비밀번호를 재설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 닉네임 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  닉네임 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="가입한 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                  autoComplete="username"
                />
              </div>

              {/* 복구 코드 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  복구 코드 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => handleRecoveryCodeChange(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 font-mono tracking-widest"
                  maxLength={14}
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  새 비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8자 이상"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  새 비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 다시 입력"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                  autoComplete="new-password"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 안내 */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
                <p className="text-blue-300/80">
                  복구 코드는 회원가입 시 한 번만 발급됩니다.
                  비밀번호 재설정 후 새로운 복구 코드가 발급됩니다.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={recover.isPending}
              >
                {recover.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4 mr-2" />
                )}
                {recover.isPending ? '복구 중...' : '비밀번호 재설정'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  로그인으로 돌아가기
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 새 복구 코드 모달 */}
      <Dialog open={showNewCodeModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              새 복구 코드 발급
            </DialogTitle>
            <DialogDescription>
              비밀번호가 재설정되었습니다. 기존 복구 코드는 더 이상 사용할 수 없습니다.
              <strong className="text-foreground"> 새 복구 코드를 안전하게 보관하세요.</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 새 복구 코드 표시 */}
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-center font-mono text-2xl tracking-widest text-primary">
                {newRecoveryCode}
              </p>
            </div>

            {/* 복사 버튼 */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyRecoveryCode}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  복구 코드 복사
                </>
              )}
            </Button>

            {/* 경고 */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
              <ul className="space-y-1 text-yellow-200/80">
                <li>• 이 코드를 안전한 곳에 보관하세요.</li>
                <li>• 비밀번호 분실 시 유일한 복구 수단입니다.</li>
                <li>• 복구 코드는 다시 확인할 수 없습니다.</li>
              </ul>
            </div>

            {/* 확인 체크박스 */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                새 복구 코드를 안전하게 저장했습니다. 이 코드가 다시 표시되지 않는다는 것을 이해합니다.
              </span>
            </label>

            {/* 확인 버튼 */}
            <Button
              className="w-full"
              onClick={handleConfirmAndLogin}
              disabled={!confirmed}
            >
              확인하고 로그인하러 가기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
