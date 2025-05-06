import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { scrollContainer } from '@/utils/scrollUtils';
import { Media } from '@/types';
import styles from '@/styles/Cards.module.scss';

const Cards = dynamic(() => import('./Cards'));
const FeatureCard = dynamic(() => import('./FeatureCards'));

interface ListProps {
  readonly defaultCard?: boolean;
  readonly heading: string;
  readonly topList?: boolean;
  readonly endpoint: string;
}

export default function List({
  defaultCard = true,
  heading,
  topList = false,
  endpoint
}: ListProps): React.ReactElement {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Reset state when endpoint changes
  useEffect(() => {
    setMedia([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [endpoint]);

  const getEndpoint = useCallback(async (pageNumber: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_BASE;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const result = await axios.get(`${baseUrl}${endpoint}`, {
        params: { page: pageNumber },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMedia(prevMedia => (pageNumber === 1 ? result.data.data : [...prevMedia, ...result.data.data]));
      setHasMore(result.data.data.length > 0);
    }
    /*eslint-disable-next-line @typescript-eslint/no-unused-vars*/
    catch (error) {
      console.error('Error fetching media:');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    getEndpoint(page);
  }, [getEndpoint, page]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollContainer(scrollRef, "left");
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollContainer(scrollRef, "right");
    }
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !loading && hasMore) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 100) {
        setPage(prevPage => prevPage + 1);
      }
    }
  }, [hasMore, loading]);

  const useDebounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    return useCallback((...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }, [func, delay]);
  };

  const debouncedHandleScroll = useDebounce(handleScroll, 200);

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener('scroll', debouncedHandleScroll);
      return () => {
        currentScrollRef.removeEventListener('scroll', debouncedHandleScroll);
      };
    }
  }, [debouncedHandleScroll]);

  return (
    <div className={styles.listContainermain}>
      <div className={styles.listContainer}>
        <strong className={styles.category}>{heading}</strong>
        <div className={`${styles.scrollContainer} ${topList ? styles.featureCardContainer : defaultCard ? styles.defaultCardContainer : styles.nonDefaultCardContainer}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isHovered && (
            <button className={styles.scrollButton} onClick={scrollLeft}>
              <ChevronLeft size={32} />
            </button>
          )}
          <div className={styles.cardRow} ref={scrollRef}>
            {loading && page === 1 ? (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}></div>
              ))
            ) : media.length === 0 ? (
              <p>No results found.</p>
            ) : (
              media.map((item, index) =>
                topList && index >= 10 ? null : topList ? (
                  <FeatureCard key={`${item.id}-${page}-${index}`} index={index + 1} item={item} sectionHeading={heading} />
                ) : (
                  <Cards key={`${item.id}-${page}-${index}`} defaultCard={defaultCard} item={item} sectionHeading={heading} />
                )
              )
            )}
            {loading && page > 1 && <div className={styles.skeletonCard}></div>}
          </div>
          {isHovered && (
            <button className={styles.scrollButton} onClick={scrollRight}>
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
