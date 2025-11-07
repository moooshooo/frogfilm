import "./App.css";
import SearchBar from "./components/SearchBar";

// Viktigt: importera logotypen via Vite
import logo from "./assets/logo.png";

function App() {
  return (
    <>
      <div id="search-div">
        <div id="logo-div">
          <img src={logo} id="logo" alt="FrogFilm logo" />
        </div>

        <SearchBar />
      </div>
    </>
  );
}

export default App;