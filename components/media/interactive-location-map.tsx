interface InteractiveLocationMapProps {
  src: string;
  title?: string;
  location?: string;
  className?: string;
}

export function InteractiveLocationMap({
  src,
  title = "Location Map",
  location,
  className = "",
}: InteractiveLocationMapProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        title={title}
        src={src}
        className="size-full min-h-[360px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        aria-label={location ? `Location map: ${location}` : title}
      />
    </div>
  );
}

