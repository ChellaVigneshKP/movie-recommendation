import { useContext } from 'react';

import { Genre, Media } from '@/types';
import styles from '@/styles/Cards.module.scss';
import { ModalContext } from '@/context/ModalContext';
import { Add, Play, Down, Like, Dislike } from '@/utils/icons';
import Image from 'next/image';
import Button from '@/components/Button';

interface CardsProps {
  defaultCard?: boolean;
  item: Media;
}

export default function Cards({ defaultCard = true, item }: CardsProps): React.ReactElement {
  const style = defaultCard ? styles.card : styles.longCard;
  const infoStyle = defaultCard ? styles.cardInfo : styles.more;
  const { title, poster, banner, rating, genre } = item;
  const image = defaultCard ? banner : poster;

  const { setModalData, setIsModal } = useContext(ModalContext);

  const onClick = (data: Media) => {
    setModalData(data);
    setIsModal(true);
  };

  return (
    <div className={style}>
      <Image
        src={image}
        alt="img"
        className={styles.cardPoster}
        width={224}
        height={144}
        style={{ objectFit: "cover" }}
      />
      <div className={infoStyle}>
        <div className={styles.actionRow}>
          <div className={styles.actionRow}>
            <Button Icon={Play} rounded filled />
            <Button Icon={Add} rounded />
            {defaultCard && (
              <>
                <Button Icon={Like} rounded />
                <Button Icon={Dislike} rounded />
              </>
            )}
          </div>
          <Button Icon={Down} rounded onClick={() => onClick(item)} />
        </div>
        <div className={styles.textDetails}>
          <strong>{title}</strong>
          <div className={styles.row}>
            <span className={styles.greenText}>{`${rating * 10}% match`}</span>
          </div>
          {renderGenre(genre)}
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
