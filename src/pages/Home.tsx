import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Hero, Metrics, HotList, WhyChoose } from "../components/homepage";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Header />
      <div className="pt-16">
        <Hero />
        <Metrics />
        <HotList />
        <WhyChoose />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
