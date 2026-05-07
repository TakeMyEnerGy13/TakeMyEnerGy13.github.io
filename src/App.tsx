import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { LensProvider } from './lens/LensProvider';
import './lens/lens.css';

function App() {
  return (
    <LensProvider>
      <div className="relative min-h-screen">
        <Nav />
        <main>
          <Hero />
          <Projects />
          <About />
          <Contact />
        </main>
      </div>
    </LensProvider>
  );
}

export default App;
