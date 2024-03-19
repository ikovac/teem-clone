import 'vuetify/styles';
import '@vuepic/vue-datepicker/dist/main.css';

import { createAuth0 } from '@auth0/auth0-vue';
import app from './app';
import router from './router';

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import VueDatePicker from '@vuepic/vue-datepicker';

const vuetify = createVuetify({
  components,
  directives,
});

app.use(vuetify);
app.use(router);

app.component('vue-date-picker', VueDatePicker);

app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: new URL('callback', window.location.origin).href,
      audience: import.meta.env.VITE_AUTH0_API_IDENTIFIER,
    },
  }),
);

app.mount('#app');
