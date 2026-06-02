import { Route, Switch } from "wouter";

import Home       from "./pages/Home";
import About      from "./pages/About";
import DPI        from "./pages/DPI";
import Gobierno   from "./pages/Gobierno";
import Politics   from "./pages/Politics";
import Donations  from "./pages/Donations";
import Privacy    from "./pages/Privacy";
import Terms      from "./pages/Terms";
import NotFound   from "./pages/NotFound";
import RestoreDPI from "./pages/RestoreDPI";
import CreateDPI  from "./pages/CreateDPI";
import Carpeta    from "./pages/Carpeta";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/"            component={Home}      />
        <Route path="/about"       component={About}     />
        <Route path="/gobierno"    component={Gobierno}  />
        <Route path="/Politics"    component={Politics}  />
        <Route path="/donations"   component={Donations} />
        <Route path="/dpi"         component={DPI}       />
        <Route path="/dpi/create"  component={CreateDPI} />
        <Route path="/dpi/restore" component={RestoreDPI}/>
        <Route path="/carpeta"     component={Carpeta}   />
        <Route path="/privacy"     component={Privacy}   />
        <Route path="/terms"       component={Terms}     />
        <Route path="/404"         component={NotFound}  />
        <Route                     component={NotFound}  />
      </Switch>
    </div>
  );
}

export default App;