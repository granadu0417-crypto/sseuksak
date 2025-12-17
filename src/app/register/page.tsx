'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
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
import { useRegister } from '@/lib/api/hooks';

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');

  // 복구코드 모달 상태
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 클라이언트 유효성 검사
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    register.mutate(
      { nickname: nickname.trim(), password, passwordConfirm },
      {
        onSuccess: (data) => {
          setRecoveryCode(data.recoveryCode);
          setShowRecoveryModal(true);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
        },
      }
    );
  };

  const handleCopyRecoveryCode = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 실패 시 fallback
      const textArea = document.createElement('textarea');
      textArea.value = recoveryCode;
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-lg">회원가입</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>
              닉네임과 비밀번호만으로 가입할 수 있어요
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
                  placeholder="2~20자 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                  maxLength={20}
                  autoComplete="username"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 안내 */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
                <p className="font-medium mb-1">🔒 개인정보 보호</p>
                <p className="text-blue-300/80">
                  이메일, 전화번호 등 개인정보를 수집하지 않습니다.
                  가입 후 발급되는 복구 코드를 안전하게 보관하세요.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {register.isPending ? '가입 중...' : '가입하기'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 복구 코드 모달 */}
      <Dialog open={showRecoveryModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              복구 코드 저장
            </DialogTitle>
            <DialogDescription>
              이 코드는 <strong className="text-foreground">한 번만</strong> 표시됩니다.
              비밀번호를 잊어버렸을 때 이 코드로 복구할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 복구 코드 표시 */}
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-center font-mono text-2xl tracking-widest text-primary">
                {recoveryCode}
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
                복구 코드를 안전하게 저장했습니다. 이 코드가 다시 표시되지 않는다는 것을 이해합니다.
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
