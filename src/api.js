import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
/*import runtimeEnv from '@mars/heroku-js-runtime-env';

export const env = runtimeEnv();*/

// base api
export const apiBase = axios.create({
    baseURL: "https://cors-anywhere.herokuapp.com/http://test.aeroguest.io:39425/",
    timeout: 4000,
    headers: {
        Accept: 'application/json',
        AGID: 'uP0Qp/1LNjOSMziv3ArA95OALihT5+kIaFfVzoTuL88=',
    },
});

// TODO: revisit this
// we basically needs this to better work with
// how axios handles errors
apiBase.interceptors.response.use(
    (response) => {
        // Do something with response data
        return response;
    },
    (error) => {
        return Promise.resolve(error.response);
    }
);

