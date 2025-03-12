import Button from "../Button";
import { Play, Info } from "@/utils/icons";
import styles from "@/styles/Banner.module.scss";
import { Media } from "@/types";

interface BannerDetailsProps {
  media: Media;
  onClick: (data: Media) => void;
}

export default function BannerDetails({ media, onClick }: BannerDetailsProps) {
  return (
    <div className={styles.spotlight__details}>
      <div className={styles.title}>{media?.title}</div>
      <div className={styles.synopsis}>{media?.overview}</div>
      <div className={styles.buttonRow}>
        <Button label="Play" filled Icon={Play} />
        <Button label="More Info" Icon={Info} onClick={() => onClick(media)} />
      </div>
    </div>
  );
}