export const scrollContainer = (scrollRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = Array.from(container.children) as HTMLElement[];
    let targetCard: HTMLElement | null = null;
    if (direction === "right") {
        targetCard = cards.find(card =>
            card.offsetLeft + card.offsetWidth > container.scrollLeft + container.clientWidth
        ) || null;

        if (targetCard) {
            container.scrollTo({
                left: targetCard.offsetLeft,
                behavior: "smooth",
            });
        }
    } else {
        targetCard = cards.find(card => card.offsetLeft >= container.scrollLeft) || null;

        if (targetCard) {
            const scrollAmount = (container.scrollLeft - targetCard.offsetLeft) + container.clientWidth - targetCard.offsetWidth;

            container.scrollTo({
                left: container.scrollLeft - scrollAmount,
                behavior: "smooth",
            });
        }
    }
};