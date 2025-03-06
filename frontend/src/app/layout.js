import "./globals.css";
import { Providers } from "./providers";
import PropTypes from "prop-types";

export const metadata = {
  title: "Movie Recommendation - CSL7110",
  description: "A Next.js-based movie recommendation system",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
