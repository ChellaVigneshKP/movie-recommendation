import Button from "../Button";
import { Play, Info } from "@/utils/icons";
import styles from "@/styles/Banner.module.scss";
import { Media } from "@/types";
import { useRouter } from "next/navigation";
interface BannerDetailsProps {
  media: Media;
  onClick: (data: Media) => void;
}

export default function BannerDetails({ media, onClick }: BannerDetailsProps) {
  const router = useRouter();
  const handleMoreInfo = () => {
    router.push(`/movie/${media.id}`);
  };
  return (
    <div className={styles.spotlight__details}>
      <div className={styles.title}>{media?.title}</div>
      <div className={styles.synopsis}>{media?.overview}</div>
      <div className={styles.buttonRow}>
        <Button label="Play" filled Icon={Play} onClick={handleMoreInfo} />
        <Button label="More Info" Icon={Info} onClick={() => onClick(media)} />
      </div>
    </div>
  );
}