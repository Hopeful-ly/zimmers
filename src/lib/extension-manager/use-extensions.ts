import { useEffect, useState } from "react";
import {  extensions as extens } from ".";

export default function useExtensions() {
  const [extensions, setExtensions] = useState<typeof extens>({});

  useEffect(() => {
    setExtensions(extens);
    const id = setInterval(() => {
      setExtensions(extens);
    }, 300);
    return () => clearInterval(id);
  }, []);

  return { extensions };
}
