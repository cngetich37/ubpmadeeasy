import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";

const AdvertFormat = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    adjustContentHeight();
  }, [filteredData]);

  const fetchData = async () => {
    try {
      const response = await fetch("/images.json");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
      const jsonData = await response.json();
      setData(jsonData);
      setFilteredData(jsonData);
      adjustContentHeight();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const adjustContentHeight = () => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = "none";
      setTimeout(() => {
        const contentHeight = contentRef.current.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxContainerHeight = windowHeight * 0.8;
        if (contentHeight > maxContainerHeight) {
          contentRef.current.style.maxHeight = `${maxContainerHeight}px`;
        } else {
          contentRef.current.style.maxHeight = "none";
        }
      }, 0);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = data.filter(
      (item) =>
        item.imageName.toLowerCase().includes(searchTerm) ||
        item.imageDescription.toLowerCase().includes(searchTerm)
    );
    setFilteredData(filtered);
  };

  return (
    <main className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 min-h-screen flex flex-col items-center p-4">
      <Helmet>
        <title>Advert Formats - Browse advert formats</title>
        <meta
          name="description"
          content="Discover different advert formats and search for specific advert types. Browse images and descriptions for better understanding."
        />
        <meta name="author" content="Collins Ngetich" />
      </Helmet>

      <section className="bg-white/90 w-full max-w-5xl p-8 rounded-3xl shadow-2xl min-h-[80vh] flex flex-col items-center relative">
        <header className="w-full flex flex-col items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-900 mb-2 tracking-tight text-center drop-shadow-lg">
            Advert (Small Formats)
          </h1>
          <span className="text-lg text-emerald-800 font-medium mb-2 text-center">Discover, search, and explore various advert types</span>
          <div className="w-24 h-1 bg-[#FFD700] rounded-full mb-2" />
        </header>

        {/* Search Bar */}
        <div className="mb-8 w-full max-w-md relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900 text-xl pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <input
            id="search"
            type="text"
            placeholder="Search advert type..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 border-2 border-emerald-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] bg-white text-emerald-900 text-lg shadow-sm transition-all duration-200"
            autoComplete="off"
          />
        </div>

        {/* Adverts Grid */}
        <div ref={contentRef} className="overflow-y-auto w-full px-1 max-h-[65vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <figure
                  key={item.id}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-emerald-100 group flex flex-col h-full"
                >
                  <div className="relative w-full h-52 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.imageDescription || 'Advert Image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <figcaption className="flex-1 flex items-center justify-center px-4 py-3 bg-[#FFD700]/90 text-emerald-900 font-semibold text-center text-base md:text-lg rounded-b-2xl shadow-inner truncate">
                    {item.imageDescription}
                  </figcaption>
                </figure>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FFD700" className="w-16 h-16 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25m0 0A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25v3.75m7.5 0h-7.5m7.5 0v7.5A2.25 2.25 0 0113.5 19.5h-3A2.25 2.25 0 018.25 17.25v-7.5" />
                </svg>
                <p className="text-center text-emerald-900 text-lg font-medium">No matching adverts found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdvertFormat;
