import React from "react";
import customPic from "../assets/ubpAd.jpeg";

const UBP = () => {
  return (
    <div>
      <div className="bg-[#065A38] dark:bg-[var(--color-bg)] min-h-screen flex flex-col items-center justify-center py-4 md:py-8">
        <main className="w-11/12 max-w-5xl px-2 md:px-4 h-screen-5xl md:py-2 py-4 bg-white dark:bg-[var(--color-surface)] shadow-lg rounded-md overflow-y-auto mb-16">
          <article>
            <header className="flex justify-center mb-16">
              <img
                className="w-full h-auto"
                src={customPic}
                alt="UBPMadeEasy"
              />
            </header>
            <div className="flex justify-center flex-1 items-center mb-2">
              <p className="text-[#065A38] dark:text-[var(--color-primary)] italic mt-4 mx-2">Photo Courtesy: Nairobi City County</p>
            </div>
            <section className="text-center px-4">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#065A38] dark:text-[var(--color-primary)] mb-4">
                Unified Business Permit (UBP)
              </h1>
              <p className="text-[#065A38] dark:text-[var(--color-text)] md:text-lg lg:text-lg text-base mb-4 leading-relaxed">
                The Unified Business Permit (UBP) issued by the Nairobi City County Government consolidates multiple licenses and permits required for businesses in the city into a single permit. This streamlines the process, minimizes paperwork, and simplifies compliance with the county's regulations.
              </p>
              <p className="text-[#065A38] dark:text-[var(--color-text)] md:text-lg lg:text-lg text-base mb-4 leading-relaxed">
                The permit encompasses various activities, including trade licenses and health certificates, tailored to the specific type of business. For the most up-to-date information and requirements, it is advisable to consult the Nairobi City County Government directly.
              </p>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
};

export default UBP;
