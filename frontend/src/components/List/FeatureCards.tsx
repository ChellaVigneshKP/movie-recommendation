"use client";
import { useContext, useState, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/Cards.module.scss";
import { Genre, Media } from "@/types";
import { ModalContext } from "@/context/ModalContext";
import { Add, Play, Down, Like, Dislike } from "@/utils/icons";
import { handleFeatureMouseEnter, handleFeatureMouseLeave } from "@/utils/mouseUtils"; // Import utility functions
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface FeatureCardProps {
  index: number;
  item: Media;
}

export default function FeatureCard({ index, item }: FeatureCardProps): React.ReactElement {
  const { title, poster, banner, rating, genre, id } = item;
  const [image, setImage] = useState<string>(poster);
  const { setModalData, setIsModal } = useContext(ModalContext);

  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const handleMoreInfo = () => {
    router.push(`/movie/${id}`);
  };

  const onClick = (data: Media) => {
    setModalData(data);
    setIsModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.rank}>{index}</div>

      <div
        className={styles.featureCard}
        onMouseOver={() =>
          handleFeatureMouseEnter(id, setImage, banner, setTrailerUrl, setIsTrailerPlaying, timerRef)
        }
        onMouseOut={() =>
          handleFeatureMouseLeave(setImage, poster, setTrailerUrl, setIsTrailerPlaying, timerRef)
        }
      >
        {isTrailerPlaying && trailerUrl ? (
          <iframe
            className={styles.trailer}
            src={`${trailerUrl}?autoplay=1&mute=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <Image src={image} alt="img" width={70} height={70} className={styles.poster} />
        )}

        <div className={styles.info}>
          <div className={styles.actionRow}>
            <div className={styles.actionRow}>
              <Button Icon={Play} rounded filled onClick={handleMoreInfo}/>
              <Button Icon={Add} rounded />
              <Button Icon={Like} rounded />
              <Button Icon={Dislike} rounded />
            </div>
            <Button Icon={Down} rounded onClick={() => onClick(item)} />
          </div>
          <div className={styles.textDetails}>
            <strong>{title}</strong>
            <div className={styles.row}>
              <span className={styles.greenText}>{`${Math.round(rating * 10)}% Match`}</span>
            </div>
            {renderGenre(genre)}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderGenre(genre: Genre[]) {
  return (
    <div className={styles.row}>
      {genre.map((item, index) => {
        const isLast = index === genre.length - 1;
        return (
          <div key={index} className={styles.row}>
            <span className={styles.regularText}>{item.name}</span>
            {!isLast && <div className={styles.dot}>&bull;</div>}
          </div>
        );
      })}
    </div>
  );
}
