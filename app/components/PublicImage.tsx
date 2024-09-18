import Image from 'next/image';

interface PublicImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const PublicImage: React.FC<PublicImageProps> = ({ src, alt, width, height, className }) => {
  return (
    <Image
      src={`/${src}`}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
};

export default PublicImage;