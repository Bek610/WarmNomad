// FAQ доторх видео: mp4 файл бол шууд тоглуулна, YouTube бол суулгана,
// бусад (Facebook, TikTok, Instagram) бол "Видео үзэх" товч болно.
function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function FaqVideo({ src, index }: { src: string; index: number }) {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
    return <video className="faq-video" src={src} controls playsInline preload="metadata" />;
  }
  const yt = youtubeId(src);
  if (yt) {
    return (
      <iframe
        className="faq-video"
        src={`https://www.youtube-nocookie.com/embed/${yt}`}
        title={`Видео ${index}`}
        loading="lazy"
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <a className="btn btn-outline" href={src} target="_blank" rel="noopener noreferrer">
      ▶ Видео {index} үзэх
    </a>
  );
}
