import Image from "next/image";
require("dotenv").config();
export default function Home() {
  console.log("Database URL from env: ", process.env.DATABASE_URL);

  return (
    <div>
      Waste Mangment
    </div>
  );
}
