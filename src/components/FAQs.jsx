import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ChevronDown, ChevronUp } from "lucide-react";


const FAQs = () => {
  const faqs = [
    {
      question: "What is Unified Business Permit?",
      answer:
        "a single permit that combines multiple licenses and permits required for a business to operate within the city.",
    },
    {
      question:
        "What should I do if my business activity is not listed in the Search UBP?",
      answer:
        "Search for a related business activity, note down the business activity code, then head over to the NairobiPay portal and select the 'Other' or 'All Other' option when choosing your business activity.",
    },
    {
      question:
        "If I am engaged in two business activities at the same location, will fire and pest control be applied only once?",
      answer:
        "Yes, if you are engaged in two business activities at the same location, fire and pest control will be applied only once.",
    },
    {
      question: "What is the validity period for a Unified Business Permit?",
      answer: "One year from the payment date.",
    },
    {
      question: "What is an outlet in reference to MPESA?",
      answer:
        "An outlet is an agent where customers can conduct transactions related to the MPESA mobile money service.",
    },
    {
      question: "What is a nozzle in reference to Petrol Station?",
      answer: "The nozzle is the part that delivers fuel to a car.",
    },
    {
      question: "What is a machine in reference to cybercafes?",
      answer:
        "A machine refers to computers and other electronic equipment like a printer or lamination machine in a cybercafe.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white px-2 py-8">
      {/* SEO Metadata */}
      <Helmet>
        <title>FAQs - Unified Business Permits & MPESA Outlets</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about Unified Business Permits, MPESA Outlets, Cybercafes, and Petrol Stations."
        />
        <meta
          name="keywords"
          content="Unified Business Permit, MPESA Outlets, Cybercafe Machines, Petrol Nozzle, Business FAQs"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Header */}
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFEC8B] drop-shadow-lg">
          Frequently Asked Questions
        </h1>
        <p className="text-lg md:text-xl font-light text-white/90">
          Find answers to common questions regarding unified business permits, MPESA outlets, and more.
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full px-5 py-3 rounded-full bg-white/80 text-emerald-900 placeholder-emerald-700 shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-lg"
          aria-label="Search FAQs"
        />
      </div>

      {/* FAQ Accordion */}
      <div className="w-full max-w-3xl space-y-6">
        {filteredFaqs.length === 0 && (
          <div className="text-center text-lg text-[#FFD700] font-semibold py-8 animate-pulse">
            No FAQs found for your search.
          </div>
        )}
        {filteredFaqs.map((faq, index) => {
          // Find the original index for toggle logic
          const origIndex = faqs.findIndex((f) => f.question === faq.question);
          return (
            <motion.div
              key={faq.question}
              className="backdrop-blur-lg bg-white/10 dark:bg-[var(--color-surface)]/20 border border-white/30 dark:border-[var(--color-primary)]/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <button
                className={`w-full flex justify-between items-center px-6 py-5 md:py-6 text-left text-xl md:text-2xl font-bold focus:outline-none transition-all duration-300 bg-gradient-to-r from-[#FFD700]/90 to-[#FFEC8B]/80 dark:from-[var(--color-primary)]/90 dark:to-yellow-300/80 text-emerald-900 dark:text-[var(--color-text)] group relative`}
                onClick={() => toggleFAQ(origIndex)}
                aria-expanded={openIndex === origIndex}
                aria-controls={`faq-panel-${origIndex}`}
              >
                <span className="flex-1 text-emerald-900 dark:text-[var(--color-text)] group-hover:underline group-hover:decoration-2 group-hover:decoration-[#FFD700] dark:group-hover:decoration-[var(--color-primary)]">
                  {faq.question}
                </span>
                <span className="ml-4 flex-shrink-0">
                  {openIndex === origIndex ? (
                    <ChevronUp className="text-emerald-900 dark:text-[var(--color-primary)] transition-transform duration-300 rotate-180" />
                  ) : (
                    <ChevronDown className="text-emerald-900 dark:text-[var(--color-primary)] transition-transform duration-300" />
                  )}
                </span>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFD700] dark:bg-[var(--color-primary)] opacity-60 group-hover:scale-125 transition-transform duration-300" />
              </button>
              <motion.div
                id={`faq-panel-${origIndex}`}
                className={`overflow-hidden bg-white/80 dark:bg-[var(--color-surface)]/80 text-emerald-900 dark:text-[var(--color-text)] transition-all duration-500 ease-in-out ${openIndex === origIndex ? "max-h-96 p-6" : "max-h-0 p-0"}`}
                initial={false}
                animate={{ height: openIndex === origIndex ? "auto" : 0, opacity: openIndex === origIndex ? 1 : 0.5 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                aria-hidden={openIndex !== origIndex}
              >
                <p className="text-lg leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative Glow */}
      <div className="pointer-events-none fixed inset-0 z-[-1] flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-[#FFD700]/10 dark:bg-[var(--color-primary)]/10 blur-3xl opacity-60 animate-pulse" />
      </div>
    </div>
  );
};

export default FAQs;
