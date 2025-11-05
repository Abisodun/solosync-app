import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Finance from './pages/Finance';
import TaxPrep from './pages/TaxPrep';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Workflows from './pages/Workflows';
import Content from './pages/Content';
import Habits from './pages/Habits';
import Projects from './pages/Projects';
import Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Onboarding": Onboarding,
    "Dashboard": Dashboard,
    "Tasks": Tasks,
    "Goals": Goals,
    "Finance": Finance,
    "TaxPrep": TaxPrep,
    "Settings": Settings,
    "Clients": Clients,
    "Workflows": Workflows,
    "Content": Content,
    "Habits": Habits,
    "Projects": Projects,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: Layout,
};