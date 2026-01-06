import Navbar from "./components/base/Navbar";
import HeroSection from "./components/base/HeroSection";
import FeatureSection from "./components/base/FeatureSection";
import UserReviews from "./components/base/UserReviews";
import Footer from "./components/base/Footer";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession, CustomUser } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session: CustomSession | null = await getServerSession(authOptions)
  return (
    <div className="min-h-screen flex flex-col ">
      {/* Header */}
      <Navbar user={session?.user as CustomUser ?? null} />
      {/* Hero Section */}
      <HeroSection user={session?.user as CustomUser ?? null} />

      {/* Features Section */}
      <FeatureSection />

      {/* User Reviews Section */}
      <UserReviews />

      {/* Footer */}
      <Footer />
    </div>
  );

}