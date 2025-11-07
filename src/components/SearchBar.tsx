import { useState, useEffect } from "react";

type MovieResult = {
  id: number;
  name: string;
  year: number;
  image_url?: string;
};

type MovieDetails = {
  id: number;
  title: string;
  release_date?: string;
  plot_overview?: string;
  runtime_minutes?: number;
  year?: number;
};

type MovieSource = {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url?: string;
};

const countries = [
  { code: "SE", flag: "🇸🇪", name: "Sverige" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "Storbritannien" },
  { code: "FR", flag: "🇫🇷", name: "Frankrike" },
  { code: "DE", flag: "🇩🇪", name: "Tyskland" },
];

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [country, setCountry] = useState("SE");
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [sources, setSources] = useState<MovieSource[]>([]);

  console.log(
    "API Key loaded:",
    import.meta.env.VITE_WATCHMODE_KEY ? "✅ OK" : "❌ Missing"
  );

  useEffect(() => {
    if (query.length < 2) return;

    const fetchData = async () => {
      const useMock = import.meta.env.VITE_USE_MOCK === "true";
      const baseUrl = window.location.origin.includes("localhost")
        ? window.location.origin
        : `${window.location.origin}/frogfilm`;

      const url = useMock
        ? `${baseUrl}/mocks/mock_autocomplete.json`
        : `https://api.watchmode.com/v1/autocomplete-search/?apiKey=${
            import.meta.env.VITE_WATCHMODE_KEY
          }&search_value=${query}&regions=${country}`;

      console.log("Fetching from:", url);

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Fetch failed:", error);
        setResults([]);
      }
    };

    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [query, country]);

  // Klick på en film
  const handleSelectMovie = async (movie: MovieResult) => {
    setResults([]); // rensa listan direkt
    setSelectedMovie(null);
    setSources([]);

    const apiKey = import.meta.env.VITE_WATCHMODE_KEY;
    const useMock = import.meta.env.VITE_USE_MOCK === "true";
    const baseUrl = window.location.origin.includes("localhost")
      ? window.location.origin
      : `${window.location.origin}/frogfilm`;

    try {
      const detailsUrl = useMock
        ? `${baseUrl}/mocks/mock_details.json`
        : `https://api.watchmode.com/v1/title/${movie.id}/details/?apiKey=${apiKey}`;
      const res1 = await fetch(detailsUrl);
      const details = await res1.json();
      setSelectedMovie(details);

      const sourcesUrl = useMock
        ? `${baseUrl}/mocks/mock_sources.json`
        : `https://api.watchmode.com/v1/title/${movie.id}/sources/?apiKey=${apiKey}`;
      const res2 = await fetch(sourcesUrl);
      const sourcesData = await res2.json();
      setSources(sourcesData || []);
    } catch (error) {
      console.error("Failed to load movie details:", error);
    }
  };

  const handleBackToSearch = () => {
    setSelectedMovie(null);
    setQuery("");
  };

  return (
    <div id="search-container">
      {!selectedMovie && (
        <>
          <div className="country-select">
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <input
            id="search"
            type="text"
            placeholder="Vad ska HFF kolla på?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {results.length > 0 && (
            <ul className="results-list">
              {results.map((movie) => (
                <li key={movie.id} onClick={() => handleSelectMovie(movie)}>
                  {movie.image_url && (
                    <img
                      src={movie.image_url}
                      alt={movie.name}
                      width="40"
                      height="60"
                      style={{ borderRadius: "6px" }}
                    />
                  )}
                  <span>{movie.name}</span> <small>({movie.year})</small>
                  <span className="flag">
                    {countries.find((c) => c.code === country)?.flag}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selectedMovie && (
        <div className="movie-info">
          <button className="back-btn" onClick={handleBackToSearch}>
            ← Tillbaka till sökning
          </button>

          <h2>{selectedMovie.title}</h2>
          <p>
            <strong>Släppt:</strong>{" "}
            {selectedMovie.release_date || selectedMovie.year}
          </p>
          <p>
            <strong>Handling:</strong>{" "}
            {selectedMovie.plot_overview || "Ingen beskrivning"}
          </p>

          {sources.length > 0 ? (
            <>
              <h3>Tillgänglig i {country}:</h3>
              <ul>
                {sources.map((src) => (
                  <li key={src.source_id}>
                    {src.name} ({src.type})
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Inga tillgängliga streamingtjänster hittades.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;