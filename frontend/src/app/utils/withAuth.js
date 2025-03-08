"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux"; // Assuming you store auth in Redux

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const user = useSelector((state) => state.user);

    useEffect(() => {
      if (!user.isAuthenticated) {
        router.push("/login");
      }
    }, [user.isAuthenticated, router]);

    if (!user.isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;