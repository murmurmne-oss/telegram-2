export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-telegram-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-telegram-link border-t-transparent rounded-full animate-spin" />
        <p className="text-telegram-hint">Загрузка...</p>
      </div>
    </div>
  );
}
