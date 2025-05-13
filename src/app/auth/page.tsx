import AuthTabs from "@/components/auth/AuthTabs";
import { FadeUp, FadeScale, MotionH2, MotionP } from "@/components/ui/motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Meteors } from "@/components/ui/meteors";
import { Spotlight } from "@/components/ui/spotlight";

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* 背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <BackgroundBeams className="opacity-30" />
        <Meteors className="opacity-30" />
        <Spotlight className="opacity-20" fill="hsl(var(--primary))" />
      </div>

      <FadeUp className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <MotionH2
            className="mt-6 text-3xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            欢迎使用3D模型平台
          </MotionH2>
          <MotionP
            className="mt-2 text-sm text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            登录或注册以开始探索和分享3D创作
          </MotionP>
        </div>

        <FadeScale transition={{ duration: 0.5, delay: 0.4 }}>
          <AuthTabs showTerms={false} />
        </FadeScale>
      </FadeUp>
    </div>
  );
}
