import './App.css';
import getAppRoutes from "./routes";
import {checkNullJson, isValueBool} from "./utils/AppUtils";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
    return (
        <>
            {/*Declare routes*/}
            <Router>
                <Routes>
                    {getAppRoutes().map((item, index) => {
                        return (checkNullJson(item) && !isValueBool(item)) &&
                            <Route key={item.route + index} exact path={item.route} element={item.component}/>
                    })}
                </Routes>
            </Router>
        </>
    );
}

export default App;
