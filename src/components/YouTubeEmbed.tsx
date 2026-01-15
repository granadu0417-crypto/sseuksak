interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export default function YouTubeEmbed({
  videoId,
  title = 'YouTube video',
}: YouTubeEmbedProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto my-6">
      <div className="relative w-full pb-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">{title}</p>
    </div>
  );
}
