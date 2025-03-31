
import { createWebHashHistory, createRouter } from 'vue-router'

// import HomeView from './HomeView.vue'
// import AboutView from './AboutView.vue'

import NotFoundView from '@views/NotFoundView';
// import RootView from '@views/RootView';
// import HomeView from '@views/HomeView';
import AppView from '@views/AppView';
import AppToolView from '@views/appViews/AppToolView';
import ToolMd5View from '@views/appViews/ToolMd5View';
import ToolEncryptView from '@views/appViews/ToolEncryptView';
import AppNotesView from '@views/appViews/AppNotesView';

// const routes = [
//   { path: '/:pathMatch(.*)*', name: '404', component: NotFoundView },
//   { path: '/', name: 'root', component: RootView },
//   { path: '/home', name: 'home', component: HomeView },
//   { path: '/app', name: 'app-root', component: AppView, children: [
//     { path: '', name: 'app', component: AppRootView },
//     { path: 'index', name: 'app-index', component: AppRootView },
//     { path: 'notes', name: 'app-notes', component: AppNotesView },
//   ] },
// ];
const routes = [
  { path: '/:pathMatch(.*)*', name: '404', component: NotFoundView },
  { path: '/', redirect: '/notes' },
  { path: '/', name: 'app-root', component: AppView, children: [
    { path: 'md5', name: 'tool-md5', component: ToolMd5View },
    { path: 'encrypt', name: 'tool-encrypt', component: ToolEncryptView },
    { path: 'tool', name: 'app-tool', component: AppToolView },
    { path: 'notes', name: 'app-notes', component: AppNotesView },
  ] },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
