export const Background = () => {
  return (
    <>
      {/* Канвас для рун */}
      <canvas id="runeCanvas" className="fixed inset-0 z-0 pointer-events-none opacity-40"></canvas>

      {/* Видео-фон из донора */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover scale-105" // scale чуть больше, чтобы убрать края
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        {/* Затемнение, чтобы текст читался */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>
    </>
  );
};