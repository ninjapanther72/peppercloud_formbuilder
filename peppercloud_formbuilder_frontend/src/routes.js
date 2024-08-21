import {
    _404Page, FormAddEditPage,
    FormsListPage,
    FormViewPage,
} from "./components";
import {GenRouteUrls, ModuleRouteUrls, Modules} from "./config/AppConfig";
import {getDefValueStr, isBoolTrue} from "./utils/AppUtils.js";

const TAG = 'routes.js';

export default function getAppRoutes() {
    return [
        //Main Pages
        createRoute(Modules.Home, <FormsListPage/>),

        //Internal pages
        createInternalPageRoute(Modules.FormView, <FormViewPage/>, GenRouteUrls.formView),

        //Form pages
        createInternalPageRoute(Modules.Forms, <FormAddEditPage/>, GenRouteUrls.formCreate),
        createInternalPageRoute(Modules.Forms, <FormAddEditPage updateOnly={true}/>, GenRouteUrls.formEdit),

        //Include 404 route as default-route
        {route: GenRouteUrls._404, component: <_404Page/>},
    ]
}

function createRoute(name, component, routeUrl = null) {
    return {
        name: name,
        route: getDefValueStr(routeUrl, ModuleRouteUrls[name]),
        component: component,
    }
}

function createInternalPageRoute(name, component, routeUrl) {
    return {
        name: name,
        // route: (routeUrl + '').replace('?id=', '').replace('?sid=', ''),
        // route: (routeUrl + '').replace(':id', ''),
        route: routeUrl,
        component: component,
    }
}
