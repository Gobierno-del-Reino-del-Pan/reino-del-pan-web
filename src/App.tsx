import { Route, Switch } from "wouter";

import Home from "./pages/Home";
import About from "./pages/About";
import DPI from "./pages/DPI";
import Gobierno from "./pages/Gobierno";
import Politics from "./pages/Politics";
import Donations from "./pages/Donations";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import RestoreDPI from "./pages/RestoreDPI";
import CreateDPI from "./pages/CreateDPI";
import Carpeta from "./pages/Carpeta";
import PKMN from "./pages/PKMN";
import LaLiga from "./pages/LaLiga";
import TVP from "./pages/TVP";
import CSD from "./pages/LALIGA/CSD";
import JuegoLimpio from "./pages/LALIGA/juego-limpio";
import Reglamento from "./pages/LALIGA/reglamento";
import LPB from "./pages/LaboralBank/LPB";
import Level from "./pages/level";
import PanelDeControl from "./pages/TVP/PanelDeControl.tsx";
import Consorcio from "./pages/Consorcio/consorcio";
import Maps from "./pages/Maps";
import BORP from "./pages/BORP";
import PKMNpokedex from "./pages/PKMN/pokedex.tsx";
import Policía from "./pages/Policía/PolicíaPanacional.tsx";
import Turismo from "./pages/Otros/VisitPan.tsx";
import Patrimonio from "./pages/Otros/Patrimonio.tsx";
import Selección from "./pages/Otros/SelecciónPaniense.tsx"
import PanedaContest from "./pages/concursos/PanedaContest.tsx";
import PKMNCContest from "./pages/concursos/PKMNContest.tsx";
import tvpContest from "./pages/concursos/tvpContest.tsx";
import Elecciones from "./pages/Otros/Electa.tsx";
import Alertas from "./pages/Alerta.tsx"
import FuerzaTech from "./pages/Otros/FuerzaTech.tsx";


function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/gobierno" component={Gobierno} />
        <Route path="/Politics" component={Politics} />
        <Route path="/donations" component={Donations} />
        <Route path="/pkmn" component={PKMN} />
        <Route path="/electa" component={Elecciones} />

        <Route path="/laliga" component={LaLiga} />
        <Route path="/LALIGA/CSD" component={CSD} />
        <Route path="/LALIGA/juego-limpio" component={JuegoLimpio} />
        <Route path="/LALIGA/reglamento" component={Reglamento} />
        <Route path="/seleccion" component={Selección} />
        <Route path="/concursos/paneda" component={PanedaContest} />
        <Route path="/concursos/lineapoke" component={PKMNCContest} />
        <Route path="/concursos/imagentvp" component={tvpContest} />
        <Route path="/lpb" component={LPB} />
        <Route path="/level" component={Level} />
        <Route path="/consorcio" component={Consorcio} />
        <Route path="/maps" component={Maps} />
        <Route path="/borp" component={BORP} />
        <Route path="/pkmn/pokedex" component={PKMNpokedex} />
        <Route path="/policia" component={Policía} />
        <Route path="/turismo" component={Turismo} />
        <Route path="/patrimonio-panacional" component={Patrimonio} />
        <Route path="alertas" component={Alertas} />
        <Route path="/elecciones" component={Elecciones} />
        <Route path="/tvp" component={TVP} />
        <Route path="/tvp/paneldecontrol" component={PanelDeControl} />
        <Route path="/dpi" component={DPI} />
        <Route path="/dpi/create" component={CreateDPI} />
        <Route path="/dpi/restore" component={RestoreDPI} />
        <Route path="/carpeta" component={Carpeta} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/404" component={NotFound} />
        <Route path="/FTech" component={FuerzaTech} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;