import { useState, useRef } from "react";
import { Mute, Unmute } from "@/utils/icons";
import styles from "@/styles/Banner.module.scss";

export default function BannerVideo({ trailerUrl }: { trailerUrl: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
                `{"event":"command","func":"${isMuted ? "unMute" : "mute"}","args":""}`,
                "*"
            );
            setIsMuted(!isMuted);
        }
    };

    return (
        <div>
            <iframe
                ref={iframeRef}
                className={styles.spotlight__video}
                src={`${trailerUrl}?autoplay=1&mute=1&enablejsapi=1`}
                allow="autoplay; fullscreen"
                allowFullScreen
            ></iframe>
            <button onClick={toggleMute} className={styles.muteButton}>
                {isMuted ? <Mute size={24} /> : <Unmute size={24} />}
            </button>
        </div>
    );
}