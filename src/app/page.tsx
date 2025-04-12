import { Slot } from "./Momo";
import { AAComment } from "@/app/comment";

export default function Home() {
  return (
    <>
      <AAComment />
      <Slot />
    </>
  );
}
