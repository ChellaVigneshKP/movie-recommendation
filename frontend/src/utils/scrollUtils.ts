export const scrollContainer = (scrollRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
        left: direction === 'left' ? -scrollRef.current.offsetWidth : scrollRef.current.offsetWidth,
        behavior: 'smooth'
    });
};